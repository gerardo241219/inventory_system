const { Op } = require('sequelize');
const { Product, Category, UnitOfMeasure } = require('../models');

const include = [
  { model: Category, as: 'category', attributes: ['id', 'name'] },
  { model: UnitOfMeasure, as: 'unitOfMeasure', attributes: ['id', 'code', 'name'] },
];

exports.index = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, categoryId, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = { businessId: req.businessId };
    if (search) where.name = { [Op.like]: `%${search}%` };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include,
      limit: Number(limit),
      offset,
      order: [['name', 'ASC']],
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

exports.show = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, businessId: req.businessId },
      include,
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const data = { ...req.body, businessId: req.businessId };
    const product = await Product.create(data);
    const full = await Product.findByPk(product.id, { include });
    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    await product.update(req.body);
    const full = await Product.findByPk(product.id, { include });
    res.json(full);
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    await product.update({ status: 'I' });
    res.json({ message: 'Producto desactivado correctamente' });
  } catch (err) {
    next(err);
  }
};

exports.lowStock = async (req, res, next) => {
  try {
    const { sequelize } = require('../models');
    const products = await Product.findAll({
      where: {
        businessId: req.businessId,
        status: 'A',
        [Op.and]: sequelize.literal('stock <= minStock'),
      },
      include,
      order: [['stock', 'ASC']],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};
