const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/suppliers.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');

router.use(authenticate);

router.get('/', ctrl.index);
router.post('/', authorize('admin', 'manager'), [body('name').notEmpty().trim()], validate, ctrl.store);
router.put('/:id', authorize('admin', 'manager'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.destroy);

module.exports = router;
