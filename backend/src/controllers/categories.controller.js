const { Category } = require('../models');

exports.index = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { businessId: req.businessId },
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const category = await Category.create({ ...req.body, businessId: req.businessId });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!category) return res.status(404).json({ message: 'Familia no encontrada' });
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!category) return res.status(404).json({ message: 'Familia no encontrada' });
    await category.update({ isActive: false });
    res.json({ message: 'Familia desactivada correctamente' });
  } catch (err) {
    next(err);
  }
};
