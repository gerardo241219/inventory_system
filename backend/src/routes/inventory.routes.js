const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/movements', ctrl.index);
router.get('/stock', ctrl.currentStock);

router.post(
  '/movements',
  [
    body('productId').isInt(),
    body('type').isIn(['entrada', 'salida', 'ajuste']),
    body('quantity').isDecimal({ decimal_digits: '0,2' }).toFloat(),
  ],
  validate,
  ctrl.createMovement
);

module.exports = router;
