const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);

module.exports = router;