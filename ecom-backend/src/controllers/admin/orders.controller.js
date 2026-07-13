const prisma = require('../../lib/prisma');
const { sendPushNotification } = require('../../lib/webpush');

async function getAllOrders(req, res) {
  try {
    const { status, search } = req.query;

    const where = {};

    if (status) {
      where.orderStatus = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { address: { name: { contains: search, mode: 'insensitive' } } },
        { address: { phone: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true, address: true, user: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true, address: true, user: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const validPaymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const existing = await prisma.order.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = await prisma.order.update({
      where: { id: BigInt(id) },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: { items: true, address: true },
    });

    // Notify the customer their order status changed
    if (orderStatus) {
      const customerSubs = await prisma.pushSubscription.findMany({
        where: { userId: order.userId },
      });

      const statusMessages = {
        CONFIRMED: 'Your order has been confirmed!',
        PROCESSING: 'Your order is being prepared.',
        OUT_FOR_DELIVERY: 'Your order is out for delivery!',
        DELIVERED: 'Your order has been delivered.',
        CANCELLED: 'Your order has been cancelled.',
      };

      for (const sub of customerSubs) {
        sendPushNotification(sub, {
          title: `Order ${order.orderNumber}`,
          body: statusMessages[orderStatus] || `Status updated to ${orderStatus}`,
          url: `/orders/${order.id}`,
        });
      }
    }

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
}

module.exports = { getAllOrders, getOrderById, updateOrderStatus };