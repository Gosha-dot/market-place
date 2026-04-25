const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired } = require('../middleware/auth');
const controller = require('../controllers/cartController');

const router = express.Router();

router.get('/', authRequired(), asyncHandler(controller.getCart));
router.put('/', authRequired(), asyncHandler(controller.putCart));
router.delete('/', authRequired(), asyncHandler(controller.clearCart));

module.exports = { cartRouter: router };

