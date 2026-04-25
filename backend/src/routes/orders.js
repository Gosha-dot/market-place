const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired, requireRole } = require('../middleware/auth');
const controller = require('../controllers/ordersController');

const router = express.Router();

router.get('/mine', authRequired(), asyncHandler(controller.listMine));
router.get('/mine/:id', authRequired(), asyncHandler(controller.getMineById));
router.post('/checkout', authRequired(), asyncHandler(controller.checkout));

router.get('/seller', authRequired(), requireRole('seller'), asyncHandler(controller.listForSeller));
router.patch('/:id/status', authRequired(), requireRole('seller', 'admin'), asyncHandler(controller.updateStatus));

module.exports = { ordersRouter: router };
