const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryMovement = sequelize.define('InventoryMovement', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: {
      type: DataTypes.ENUM('entrada', 'salida', 'ajuste'),
      allowNull: false,
    },
    quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    previousStock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    newStock: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    cost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    reason: { type: DataTypes.STRING(200) },
    notes: { type: DataTypes.TEXT },
    referenceNumber: { type: DataTypes.STRING(50) },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    supplierId: { type: DataTypes.INTEGER, allowNull: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return InventoryMovement;
};
