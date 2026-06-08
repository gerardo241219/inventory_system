const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/products', require('./products.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/inventory', require('./inventory.routes'));
router.use('/suppliers', require('./suppliers.routes'));
router.use('/reports', require('./reports.routes'));
router.use('/units', require('./units.routes'));
router.use('/production', require('./production.routes'));
router.use('/sales', require('./sales.routes'));

module.exports = router;
