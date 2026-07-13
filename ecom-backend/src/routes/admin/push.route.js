const express = require('express');
const router = express.Router();
const { subscribeAdmin } = require('../../controllers/admin/push.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

router.post('/subscribe', requireAdminAuth, subscribeAdmin);

module.exports = router;