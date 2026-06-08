const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post(
  '/register',
  authenticate,
  authorize('admin'),
  [
    body('name').notEmpty().trim(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'manager', 'employee']),
    body('businessId').isInt(),
  ],
  validate,
  ctrl.register
);

router.get('/profile', authenticate, ctrl.profile);

router.put(
  '/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 })],
  validate,
  ctrl.changePassword
);

module.exports = router;
