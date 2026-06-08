const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/products.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', ctrl.index);
router.get('/low-stock', ctrl.lowStock);
router.get('/:id', ctrl.show);

router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('code').notEmpty().trim(),
    body('name').notEmpty().trim(),
    body('cost').optional().isDecimal(),
    body('price').optional().isDecimal(),
  ],
  validate,
  ctrl.store
);

router.put('/:id', authorize('admin', 'manager'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.destroy);

module.exports = router;
