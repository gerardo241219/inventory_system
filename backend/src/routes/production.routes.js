const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/production.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/',       ctrl.index);
router.get('/:id',    ctrl.show);

router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('area').isIn(['cocina_churros', 'cocina_papas', 'envasado']),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isInt(),
    body('items.*.quantity').isFloat({ gt: 0 }),
    body('items.*.itemType').isIn(['input', 'output']),
  ],
  validate,
  ctrl.store
);

router.patch('/:id/complete', authorize('admin', 'manager'), ctrl.complete);
router.patch('/:id/cancel',   authorize('admin', 'manager'), ctrl.cancel);
router.patch(
  '/:id/status',
  authorize('admin', 'manager'),
  [body('status').isIn(['borrador', 'en_proceso', 'completado', 'cancelado'])],
  validate,
  ctrl.updateStatus
);

module.exports = router;
