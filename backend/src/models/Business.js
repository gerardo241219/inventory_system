const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Business = sequelize.define('Business', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    type: { type: DataTypes.STRING(50), defaultValue: 'general' },
    description: { type: DataTypes.TEXT },
    logo: { type: DataTypes.STRING(255) },
    settings: { type: DataTypes.JSON, defaultValue: {} },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  return Business;
};
