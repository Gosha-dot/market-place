const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired, requireRole } = require('../middleware/auth');
const controller = require('../controllers/couponsController');

const router = express.Router();

router.post('/validate', authRequired(), asyncHandler(controller.validate));

router.get('/', authRequired(), requireRole('admin'), asyncHandler(controller.list));
router.post('/', authRequired(), requireRole('admin'), asyncHandler(controller.create));
router.put('/:id', authRequired(), requireRole('admin'), asyncHandler(controller.update));
router.delete('/:id', authRequired(), requireRole('admin'), asyncHandler(controller.remove));

module.exports = { couponsRouter: router };

