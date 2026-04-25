const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired, requireRole } = require('../middleware/auth');
const controller = require('../controllers/productsController');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.get('/categories', asyncHandler(controller.categories));
router.get('/brands', asyncHandler(controller.brands));
router.get('/suggest', asyncHandler(controller.suggestions));
router.get('/recommendations', authRequired(), asyncHandler(controller.recommendations));
router.get('/mine', authRequired(), requireRole('seller', 'admin'), asyncHandler(controller.mine));
router.get('/:id', asyncHandler(controller.getById));
router.get('/:id/similar', asyncHandler(controller.similar));

router.post('/', authRequired(), requireRole('seller', 'admin'), asyncHandler(controller.create));
router.put('/:id', authRequired(), requireRole('seller', 'admin'), asyncHandler(controller.update));
router.delete('/:id', authRequired(), requireRole('seller', 'admin'), asyncHandler(controller.remove));

module.exports = { productsRouter: router };
