const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      defaultValue: 'employee',
    },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
  });

  return User;
};
