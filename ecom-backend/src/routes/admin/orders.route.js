const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, updateOrderStatus } = require('../../controllers/admin/orders.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

router.get('/', requireAdminAuth, getAllOrders);
router.get('/:id', requireAdminAuth, getOrderById);
router.put('/:id/status', requireAdminAuth, updateOrderStatus);

module.exports = router;