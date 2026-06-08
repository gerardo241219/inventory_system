const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Supplier = sequelize.define('Supplier', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    contact: { type: DataTypes.STRING(100) },
    phone: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    address: { type: DataTypes.TEXT },
    rfc: { type: DataTypes.STRING(20) },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return Supplier;
};
