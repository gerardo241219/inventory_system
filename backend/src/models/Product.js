const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING(20), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    stock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    minStock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
    classification: { type: DataTypes.STRING(10), defaultValue: 'M' },
    status: { type: DataTypes.ENUM('A', 'I'), defaultValue: 'A' },
    categoryId: { type: DataTypes.INTEGER, allowNull: true },
    unitOfMeasureId: { type: DataTypes.INTEGER, allowNull: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return Product;
};
