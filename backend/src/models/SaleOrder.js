const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaleOrder = sequelize.define('SaleOrder', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    folio: { type: DataTypes.STRING(30), allowNull: false },
    customerName: { type: DataTypes.STRING(150) },
    customerPhone: { type: DataTypes.STRING(20) },
    customerAddress: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM('borrador', 'confirmada', 'embarcada', 'cancelada'),
      defaultValue: 'borrador',
    },
    subtotal: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    notes: { type: DataTypes.TEXT },
    shippedAt: { type: DataTypes.DATE, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return SaleOrder;
};
