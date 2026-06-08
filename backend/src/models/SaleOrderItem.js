const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaleOrderItem = sequelize.define('SaleOrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    saleOrderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  });

  return SaleOrderItem;
};
