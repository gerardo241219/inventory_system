const {
  ProductionOrder,
  ProductionOrderItem,
  Product,
  InventoryMovement,
  User,
  sequelize,
} = require('../models');

const itemInclude = {
  model: ProductionOrderItem,
  as: 'items',
  include: [{ model: Product, as: 'product', attributes: ['id', 'code', 'name', 'stock', 'unitOfMeasureId'] }],
};

const generateFolio = async (businessId) => {
  const count = await ProductionOrder.count({ where: { businessId } });
  return `PROD-${String(count + 1).padStart(5, '0')}`;
};

exports.index = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, area } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = { businessId: req.businessId };
    if (status) where.status = status;
    if (area)   where.area   = area;

    const { count, rows } = await ProductionOrder.findAndCountAll({
      where,
      include: [
        itemInclude,
        { model: User, as: 'user', attributes: ['id', 'name'] },
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

exports.show = async (req, res, next) => {
  try {
    const order = await ProductionOrder.findOne({
      where: { id: req.params.id, businessId: req.businessId },
      include: [itemInclude, { model: User, as: 'user', attributes: ['id', 'name'] }],
    });
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { area, notes, items } = req.body;
    const folio = await generateFolio(req.businessId);

    const order = await ProductionOrder.create(
      { folio, area, notes, status: 'borrador', userId: req.user.id, businessId: req.businessId },
      { transaction: t }
    );

    if (items && items.length) {
      await ProductionOrderItem.bulkCreate(
        items.map((i) => ({ ...i, productionOrderId: order.id })),
        { transaction: t }
      );
    }

    await t.commit();
    const full = await ProductionOrder.findByPk(order.id, {
      include: [itemInclude, { model: User, as: 'user', attributes: ['id', 'name'] }],
    });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.complete = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await ProductionOrder.findOne({
      where: { id: req.params.id, businessId: req.businessId },
      include: [itemInclude],
      transaction: t,
    });

    if (!order) { await t.rollback(); return res.status(404).json({ message: 'Orden no encontrada' }); }
    if (order.status === 'completado') { await t.rollback(); return res.status(400).json({ message: 'Orden ya completada' }); }
    if (order.status === 'cancelado')  { await t.rollback(); return res.status(400).json({ message: 'Orden cancelada' }); }

    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      const prev = parseFloat(product.stock);
      let next;

      if (item.itemType === 'input') {
        if (prev < parseFloat(item.quantity)) {
          await t.rollback();
          return res.status(400).json({
            message: `Stock insuficiente para "${product.name}" (disponible: ${prev}, requerido: ${item.quantity})`,
          });
        }
        next = prev - parseFloat(item.quantity);
      } else {
        next = prev + parseFloat(item.quantity);
      }

      await product.update({ stock: next }, { transaction: t });
      await InventoryMovement.create(
        {
          productId: item.productId,
          type: item.itemType === 'input' ? 'salida' : 'entrada',
          quantity: item.quantity,
          previousStock: prev,
          newStock: next,
          cost: item.unitCost,
          reason: `Orden de producción ${order.folio} — área: ${order.area}`,
          userId: req.user.id,
          businessId: req.businessId,
        },
        { transaction: t }
      );
    }

    await order.update({ status: 'completado', completedAt: new Date() }, { transaction: t });
    await t.commit();

    const full = await ProductionOrder.findByPk(order.id, { include: [itemInclude] });
    res.json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const order = await ProductionOrder.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    if (order.status === 'completado') return res.status(400).json({ message: 'No se puede cancelar una orden completada' });
    await order.update({ status: 'cancelado' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await ProductionOrder.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!order) return res.status(404).json({ message: 'Orden no encontrada' });
    await order.update({ status });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
