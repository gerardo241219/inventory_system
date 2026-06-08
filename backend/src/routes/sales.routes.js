const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/sales.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/',    ctrl.index);
router.get('/:id', ctrl.show);

router.post(
  '/',
  [
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isFloat({ gt: 0 }),
    body('items.*.unitPrice').isFloat({ min: 0 }),
  ],
  validate,
  ctrl.store
);

router.patch('/:id/confirm', ctrl.confirm);
router.patch('/:id/ship',    authorize('admin', 'manager'), ctrl.ship);
router.patch('/:id/cancel',  ctrl.cancel);

module.exports = router;
