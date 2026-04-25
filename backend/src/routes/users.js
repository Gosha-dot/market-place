const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { authRequired, requireRole } = require('../middleware/auth');
const controller = require('../controllers/usersController');

const router = express.Router();

router.get('/', authRequired(), requireRole('admin'), asyncHandler(controller.list));
router.patch('/:id/role', authRequired(), requireRole('admin'), asyncHandler(controller.updateRole));
router.post('/me/browse', authRequired(), asyncHandler(controller.addBrowseHistory));

module.exports = { usersRouter: router };

