const { InventoryMovement, Product, User, Supplier, sequelize } = require('../models');

const include = [
  { model: Product, as: 'product', attributes: ['id', 'code', 'name', 'stock'] },
  { model: User, as: 'user', attributes: ['id', 'name'] },
  { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
];

exports.index = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = { businessId: req.businessId };
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const { count, rows } = await InventoryMovement.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      data: rows,
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

exports.createMovement = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { productId, type, quantity, cost, reason, notes, referenceNumber, supplierId } = req.body;

    const product = await Product.findOne({
      where: { id: productId, businessId: req.businessId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const previousStock = parseFloat(product.stock);
    let newStock;

    if (type === 'entrada') {
      newStock = previousStock + parseFloat(quantity);
    } else if (type === 'salida') {
      if (previousStock < parseFloat(quantity)) {
        await t.rollback();
        return res.status(400).json({ message: 'Stock insuficiente' });
      }
      newStock = previousStock - parseFloat(quantity);
    } else {
      newStock = parseFloat(quantity);
    }

    await product.update({ stock: newStock, cost: cost || product.cost }, { transaction: t });

    const movement = await InventoryMovement.create(
      {
        productId,
        type,
        quantity,
        previousStock,
        newStock,
        cost: cost || product.cost,
        reason,
        notes,
        referenceNumber,
        supplierId,
        userId: req.user.id,
        businessId: req.businessId,
      },
      { transaction: t }
    );

    await t.commit();

    const full = await InventoryMovement.findByPk(movement.id, { include });
    res.status(201).json(full);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.currentStock = async (req, res, next) => {
  try {
    const { Product: P, Category, UnitOfMeasure } = require('../models');
    const products = await P.findAll({
      where: { businessId: req.businessId, status: 'A' },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: UnitOfMeasure, as: 'unitOfMeasure', attributes: ['id', 'code'] },
      ],
      order: [['name', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};
