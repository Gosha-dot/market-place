const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { register, login, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', authRequired(), asyncHandler(me));

module.exports = { authRouter: router };

