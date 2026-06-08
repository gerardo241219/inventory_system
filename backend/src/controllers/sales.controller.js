const {
  SaleOrder,
  SaleOrderItem,
  Product,
  InventoryMovement,
  User,
  sequelize,
} = require('../models');

const itemInclude = {
  model: SaleOrderItem,
  as: 'items',
  include: [{ model: Product, as: 'product', attributes: ['id', 'code', 'name', 'stock', 'unitOfMeasureId'] }],
};

const generateFolio = async (businessId) => {
  const count = await SaleOrder.count({ where: { businessId } });
  return `VTA-${String(count + 1).padStart(5, '0')}`;
};

exports.index = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = { businessId: req.businessId };
    if (status) where.status = status;

    const { count, rows } = await SaleOrder.findAndCountAll({
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
    const order = await SaleOrder.findOne({
      where: { id: req.params.id, businessId: req.businessId },
      include: [itemInclude, { model: User, as: 'user', attributes: ['id', 'name'] }],
    });
    if (!order) return res.status(404).json({ message: 'Nota de venta no encontrada' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { customerName, customerPhone, customerAddress, notes, items, discount = 0 } = req.body;

    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'La nota de venta debe tener al menos un producto' });
    }

    const folio = await generateFolio(req.businessId);
    const subtotal = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const total = subtotal - Number(discount);

    const order = await SaleOrder.create(
      {
        folio,
        customerName,
        customerPhone,
        customerAddress,
        notes,
        discount,
        subtotal,
        total,
        status: 'borrador',
        userId: req.user.id,
        businessId: req.businessId,
      },
      { transaction: t }
    );

    await SaleOrderItem.bulkCreate(
      items.map((i) => ({
        saleOrderId: order.id,
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.quantity * i.unitPrice,
      })),
      { transaction: t }
    );

    await t.commit();
    const full = await SaleOrder.findByPk(order.id, { include: [itemInclude] });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.ship = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await SaleOrder.findOne({
      where: { id: req.params.id, businessId: req.businessId },
      include: [itemInclude],
      transaction: t,
    });

    if (!order) { await t.rollback(); return res.status(404).json({ message: 'Nota de venta no encontrada' }); }
    if (order.status === 'embarcada')  { await t.rollback(); return res.status(400).json({ message: 'Nota ya embarcada' }); }
    if (order.status === 'cancelada') { await t.rollback(); return res.status(400).json({ message: 'Nota cancelada' }); }

    for (const item of order.items) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      const prev = parseFloat(product.stock);

      if (prev < parseFloat(item.quantity)) {
        await t.rollback();
        return res.status(400).json({
          message: `Stock insuficiente para "${product.name}" (disponible: ${prev}, solicitado: ${item.quantity})`,
        });
      }

      const next = prev - parseFloat(item.quantity);
      await product.update({ stock: next }, { transaction: t });
      await InventoryMovement.create(
        {
          productId: item.productId,
          type: 'salida',
          quantity: item.quantity,
          previousStock: prev,
          newStock: next,
          cost: item.unitPrice,
          reason: `Embarque nota de venta ${order.folio} — ${order.customerName || 'cliente'}`,
          userId: req.user.id,
          businessId: req.businessId,
        },
        { transaction: t }
      );
    }

    await order.update({ status: 'embarcada', shippedAt: new Date() }, { transaction: t });
    await t.commit();

    const full = await SaleOrder.findByPk(order.id, { include: [itemInclude] });
    res.json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const order = await SaleOrder.findOne({ where: { id: req.params.id, businessId: req.businessId } });
    if (!order) return res.status(404).json({ message: 'Nota de venta no encontrada' });
    if (order.status !== 'borrador') return res.status(400).json({ message: 'Solo se puede confirmar un borrador' });
    await order.update({ status: 'confirmada' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const order = await SaleOrder.findOne({ where: { id: req.params.id, businessId: req.businessId } });
    if (!order) return res.status(404).json({ message: 'Nota de venta no encontrada' });
    if (order.status === 'embarcada') return res.status(400).json({ message: 'No se puede cancelar una nota embarcada' });
    await order.update({ status: 'cancelada' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};
