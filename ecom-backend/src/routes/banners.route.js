const express = require('express');
const router = express.Router();
const { getActiveBanners } = require('../controllers/banners.controller');

router.get('/', getActiveBanners);

module.exports = router;