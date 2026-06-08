const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProductionOrder = sequelize.define('ProductionOrder', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    folio: { type: DataTypes.STRING(30), allowNull: false },
    area: {
      type: DataTypes.ENUM('cocina_churros', 'cocina_papas', 'envasado'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('borrador', 'en_proceso', 'completado', 'cancelado'),
      defaultValue: 'borrador',
    },
    notes: { type: DataTypes.TEXT },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return ProductionOrder;
};
