const express = require('express');
const router = express.Router();
const { fetchSettings, updateSettings } = require('../../controllers/admin/settings.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

router.get('/', requireAdminAuth, fetchSettings);
router.put('/', requireAdminAuth, updateSettings);

module.exports = router;