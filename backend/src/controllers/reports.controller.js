const { Op, fn, col, literal } = require('sequelize');
const { Product, Category, UnitOfMeasure, InventoryMovement, User } = require('../models');

exports.stockValuation = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { businessId: req.businessId, status: 'A' },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: UnitOfMeasure, as: 'unitOfMeasure', attributes: ['id', 'code'] },
      ],
      order: [['category', 'name', 'ASC'], ['name', 'ASC']],
    });

    let totalValue = 0;
    const rows = products.map((p) => {
      const value = parseFloat(p.stock) * parseFloat(p.cost);
      totalValue += value;
      return { ...p.toJSON(), stockValue: value.toFixed(2) };
    });

    res.json({ products: rows, totalValue: totalValue.toFixed(2) });
  } catch (err) {
    next(err);
  }
};

exports.movementHistory = async (req, res, next) => {
  try {
    const { from, to, productId, type, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const where = { businessId: req.businessId };

    if (from && to) {
      where.createdAt = { [Op.between]: [new Date(from), new Date(`${to}T23:59:59`)] };
    }
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const { count, rows } = await InventoryMovement.findAndCountAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'code', 'name'] },
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

exports.lowStockAlert = async (req, res, next) => {
  try {
    const { sequelize } = require('../models');
    const products = await Product.findAll({
      where: {
        businessId: req.businessId,
        status: 'A',
        [Op.and]: literal('stock <= minStock'),
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: UnitOfMeasure, as: 'unitOfMeasure', attributes: ['id', 'code'] },
      ],
      order: [['stock', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.summary = async (req, res, next) => {
  try {
    const { sequelize } = require('../models');
    const totalProducts = await Product.count({ where: { businessId: req.businessId, status: 'A' } });
    const lowStockCount = await Product.count({
      where: {
        businessId: req.businessId,
        status: 'A',
        [Op.and]: literal('stock <= minStock'),
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const movementsToday = await InventoryMovement.count({
      where: { businessId: req.businessId, createdAt: { [Op.gte]: today } },
    });

    const totalValue = await Product.findAll({
      where: { businessId: req.businessId, status: 'A' },
      attributes: [[literal('SUM(stock * cost)'), 'total']],
      raw: true,
    });

    res.json({
      totalProducts,
      lowStockCount,
      movementsToday,
      totalInventoryValue: parseFloat(totalValue[0]?.total || 0).toFixed(2),
    });
  } catch (err) {
    next(err);
  }
};
