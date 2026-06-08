const router = require('express').Router();
const ctrl = require('../controllers/units.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.index);
router.post('/', authorize('admin', 'manager'), ctrl.store);

module.exports = router;
