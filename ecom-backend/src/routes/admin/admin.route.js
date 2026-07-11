const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { login, forgotPassword, resetPassword, getMe, logout } = require('../../controllers/admin/admin.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many attempts, please try again later.' },
});

router.post('/login', strictLimiter, login);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password', strictLimiter, resetPassword);
router.get('/me', requireAdminAuth, getMe);
router.post('/logout', logout);

module.exports = router;