const router = require('express').Router();
const ctrl = require('../controllers/reports.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/summary', ctrl.summary);
router.get('/stock-valuation', authorize('admin', 'manager'), ctrl.stockValuation);
router.get('/movements', ctrl.movementHistory);
router.get('/low-stock', ctrl.lowStockAlert);

module.exports = router;
