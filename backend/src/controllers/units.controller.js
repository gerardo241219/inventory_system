const { UnitOfMeasure } = require('../models');
const { Op } = require('sequelize');

exports.index = async (req, res, next) => {
  try {
    const units = await UnitOfMeasure.findAll({
      where: { [Op.or]: [{ businessId: req.businessId }, { businessId: null }] },
      order: [['code', 'ASC']],
    });
    res.json(units);
  } catch (err) {
    next(err);
  }
};

exports.store = async (req, res, next) => {
  try {
    const unit = await UnitOfMeasure.create({ ...req.body, businessId: req.businessId });
    res.status(201).json(unit);
  } catch (err) {
    next(err);
  }
};
