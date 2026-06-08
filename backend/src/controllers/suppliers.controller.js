const { Supplier } = require('../models');

exports.index = async (req, res, next) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { businessId: req.businessId },
      order: [['name', 'ASC']],
    });
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const supplier = await Supplier.create({ ...req.body, businessId: req.businessId });
    res.status(201).json(supplier);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!supplier) return res.status(404).json({ message: 'Proveedor no encontrado' });
    await supplier.update(req.body);
    res.json(supplier);
  } catch (err) {
    next(err);
  }
};

exports.destroy = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({
      where: { id: req.params.id, businessId: req.businessId },
    });
    if (!supplier) return res.status(404).json({ message: 'Proveedor no encontrado' });
    await supplier.update({ isActive: false });
    res.json({ message: 'Proveedor desactivado correctamente' });
  } catch (err) {
    next(err);
  }
};
