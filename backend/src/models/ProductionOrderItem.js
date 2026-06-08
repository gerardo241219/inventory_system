const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionOrderItem = sequelize.define('ProductionOrderItem', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productionOrderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    // 'input' = materia prima consumida, 'output' = producto generado
    itemType: {
      type: DataTypes.ENUM('input', 'output'),
      allowNull: false,
    },
    unitCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  });

  return ProductionOrderItem;
};
