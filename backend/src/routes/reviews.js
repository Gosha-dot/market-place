const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired } = require('../middleware/auth');
const controller = require('../controllers/reviewsController');

const router = express.Router();

router.get('/product/:productId', asyncHandler(controller.listByProduct));
router.post('/', authRequired(), asyncHandler(controller.create));

module.exports = { reviewsRouter: router };

