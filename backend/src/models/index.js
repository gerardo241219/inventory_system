const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    timezone: config.timezone,
    define: config.define,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

const Business = require('./Business')(sequelize);
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const UnitOfMeasure = require('./UnitOfMeasure')(sequelize);
const Product = require('./Product')(sequelize);
const Supplier = require('./Supplier')(sequelize);
const InventoryMovement = require('./InventoryMovement')(sequelize);

// Business associations
Business.hasMany(User, { foreignKey: 'businessId', as: 'users' });
Business.hasMany(Category, { foreignKey: 'businessId', as: 'categories' });
Business.hasMany(Product, { foreignKey: 'businessId', as: 'products' });
Business.hasMany(Supplier, { foreignKey: 'businessId', as: 'suppliers' });
Business.hasMany(InventoryMovement, { foreignKey: 'businessId', as: 'movements' });

// User associations
User.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
User.hasMany(InventoryMovement, { foreignKey: 'userId', as: 'movements' });

// Category associations
Category.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// UnitOfMeasure associations
UnitOfMeasure.hasMany(Product, { foreignKey: 'unitOfMeasureId', as: 'products' });

// Product associations
Product.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(UnitOfMeasure, { foreignKey: 'unitOfMeasureId', as: 'unitOfMeasure' });
Product.hasMany(InventoryMovement, { foreignKey: 'productId', as: 'movements' });

// Supplier associations
Supplier.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Supplier.hasMany(InventoryMovement, { foreignKey: 'supplierId', as: 'movements' });

// InventoryMovement associations
InventoryMovement.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
InventoryMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InventoryMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });
InventoryMovement.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });

module.exports = {
  sequelize,
  Sequelize,
  Business,
  User,
  Category,
  UnitOfMeasure,
  Product,
  Supplier,
  InventoryMovement,
};
