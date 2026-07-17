const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, cancelOrder } = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrderById);
router.post('/:id/cancel', requireAuth, cancelOrder);

module.exports = router;