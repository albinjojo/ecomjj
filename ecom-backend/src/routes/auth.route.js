const express = require('express');
const router = express.Router();
const { googleSignIn, getMe, logout } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/google', googleSignIn);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);

module.exports = router;