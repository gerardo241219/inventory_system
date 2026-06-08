const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UnitOfMeasure = sequelize.define('UnitOfMeasure', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(20), allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    businessId: { type: DataTypes.INTEGER, allowNull: true },
  });

  return UnitOfMeasure;
};
