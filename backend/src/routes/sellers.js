const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired, requireRole } = require('../middleware/auth');
const controller = require('../controllers/sellersController');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.get('/me', authRequired(), requireRole('seller', 'admin'), asyncHandler(controller.me));
router.get('/:id', asyncHandler(controller.getById));
router.get('/:id/ratings', asyncHandler(controller.ratings));
router.post('/:id/ratings', authRequired(), asyncHandler(controller.rate));

module.exports = { sellersRouter: router };

