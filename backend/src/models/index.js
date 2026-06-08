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

const Business            = require('./Business')(sequelize);
const User                = require('./User')(sequelize);
const Category            = require('./Category')(sequelize);
const UnitOfMeasure       = require('./UnitOfMeasure')(sequelize);
const Product             = require('./Product')(sequelize);
const Supplier            = require('./Supplier')(sequelize);
const InventoryMovement   = require('./InventoryMovement')(sequelize);
const ProductionOrder     = require('./ProductionOrder')(sequelize);
const ProductionOrderItem = require('./ProductionOrderItem')(sequelize);
const SaleOrder           = require('./SaleOrder')(sequelize);
const SaleOrderItem       = require('./SaleOrderItem')(sequelize);

// ── Business ──────────────────────────────────────────────────────────────────
Business.hasMany(User,              { foreignKey: 'businessId', as: 'users' });
Business.hasMany(Category,          { foreignKey: 'businessId', as: 'categories' });
Business.hasMany(Product,           { foreignKey: 'businessId', as: 'products' });
Business.hasMany(Supplier,          { foreignKey: 'businessId', as: 'suppliers' });
Business.hasMany(InventoryMovement, { foreignKey: 'businessId', as: 'movements' });
Business.hasMany(ProductionOrder,   { foreignKey: 'businessId', as: 'productionOrders' });
Business.hasMany(SaleOrder,         { foreignKey: 'businessId', as: 'saleOrders' });

// ── User ──────────────────────────────────────────────────────────────────────
User.belongsTo(Business,        { foreignKey: 'businessId', as: 'business' });
User.hasMany(InventoryMovement, { foreignKey: 'userId',     as: 'movements' });
User.hasMany(ProductionOrder,   { foreignKey: 'userId',     as: 'productionOrders' });
User.hasMany(SaleOrder,         { foreignKey: 'userId',     as: 'saleOrders' });

// ── Category ──────────────────────────────────────────────────────────────────
Category.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Category.hasMany(Product,    { foreignKey: 'categoryId', as: 'products' });

// ── UnitOfMeasure ─────────────────────────────────────────────────────────────
UnitOfMeasure.hasMany(Product, { foreignKey: 'unitOfMeasureId', as: 'products' });

// ── Product ───────────────────────────────────────────────────────────────────
Product.belongsTo(Business,       { foreignKey: 'businessId',     as: 'business' });
Product.belongsTo(Category,       { foreignKey: 'categoryId',     as: 'category' });
Product.belongsTo(UnitOfMeasure,  { foreignKey: 'unitOfMeasureId',as: 'unitOfMeasure' });
Product.hasMany(InventoryMovement,{ foreignKey: 'productId',      as: 'movements' });
Product.hasMany(ProductionOrderItem,{ foreignKey: 'productId',    as: 'productionItems' });
Product.hasMany(SaleOrderItem,    { foreignKey: 'productId',      as: 'saleItems' });

// ── Supplier ──────────────────────────────────────────────────────────────────
Supplier.belongsTo(Business,        { foreignKey: 'businessId', as: 'business' });
Supplier.hasMany(InventoryMovement, { foreignKey: 'supplierId', as: 'movements' });

// ── InventoryMovement ─────────────────────────────────────────────────────────
InventoryMovement.belongsTo(Business,  { foreignKey: 'businessId', as: 'business' });
InventoryMovement.belongsTo(Product,   { foreignKey: 'productId',  as: 'product' });
InventoryMovement.belongsTo(User,      { foreignKey: 'userId',     as: 'user' });
InventoryMovement.belongsTo(Supplier,  { foreignKey: 'supplierId', as: 'supplier' });

// ── ProductionOrder ───────────────────────────────────────────────────────────
ProductionOrder.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
ProductionOrder.belongsTo(User,     { foreignKey: 'userId',     as: 'user' });
ProductionOrder.hasMany(ProductionOrderItem, { foreignKey: 'productionOrderId', as: 'items' });

// ── ProductionOrderItem ───────────────────────────────────────────────────────
ProductionOrderItem.belongsTo(ProductionOrder, { foreignKey: 'productionOrderId', as: 'productionOrder' });
ProductionOrderItem.belongsTo(Product,         { foreignKey: 'productId',         as: 'product' });

// ── SaleOrder ─────────────────────────────────────────────────────────────────
SaleOrder.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
SaleOrder.belongsTo(User,     { foreignKey: 'userId',     as: 'user' });
SaleOrder.hasMany(SaleOrderItem, { foreignKey: 'saleOrderId', as: 'items' });

// ── SaleOrderItem ─────────────────────────────────────────────────────────────
SaleOrderItem.belongsTo(SaleOrder, { foreignKey: 'saleOrderId', as: 'saleOrder' });
SaleOrderItem.belongsTo(Product,   { foreignKey: 'productId',   as: 'product' });

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
  ProductionOrder,
  ProductionOrderItem,
  SaleOrder,
  SaleOrderItem,
};
