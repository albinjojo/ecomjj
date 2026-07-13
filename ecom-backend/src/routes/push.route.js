const express = require('express');
const router = express.Router();
const { subscribeCustomer } = require('../controllers/push.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/subscribe', requireAuth, subscribeCustomer);

module.exports = router;