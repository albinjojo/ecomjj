const prisma = require('../lib/prisma');
const { generateUniqueOrderNumber } = require('../lib/orderNumber');
const { getSettings } = require('../lib/settings');
const { sendPushNotification } = require('../lib/webpush');

async function createOrder(req, res) {
  try {
    const { addressId, paymentMethod, items } = req.body;

    if (!addressId || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ error: 'Address, payment method, and at least one item are required' });
    }

    if (paymentMethod !== 'COD') {
      return res.status(400).json({ error: 'Only Cash on Delivery is available right now' });
    }

    const address = await prisma.address.findUnique({ where: { id: BigInt(addressId) } });
    if (!address || address.userId !== BigInt(req.userId)) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const settings = await getSettings();

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      let hasPackingRequiredItem = false;
      const orderItemsData = [];

      for (const item of items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: BigInt(item.productVariantId) },
          include: { product: { include: { category: true } } },
        });

        if (!variant || !variant.isActive) {
          throw new Error(`Product variant not found or inactive`);
        }

        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${variant.product.name} (${variant.variantName})`);
        }

        const now = new Date();
        const offerActive =
          variant.offerEnabled &&
          variant.offerPrice &&
          (!variant.offerStartDate || variant.offerStartDate <= now) &&
          (!variant.offerEndDate || variant.offerEndDate >= now);

        const unitPrice = offerActive ? variant.offerPrice : variant.price;
        const lineTotal = Number(unitPrice) * item.quantity;
        subtotal += lineTotal;

        if (variant.product.category.requiresPacking) {
          hasPackingRequiredItem = true;
        }

        orderItemsData.push({
          productId: variant.productId,
          productVariantId: variant.id,
          productName: variant.product.name,
          variantName: variant.variantName,
          price: unitPrice,
          quantity: item.quantity,
          total: lineTotal,
        });

        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const deliveryCharge = settings.deliveryChargeEnabled ? Number(settings.deliveryChargeAmount) : 0;
      const packingCharge =
        settings.packingChargeEnabled && hasPackingRequiredItem ? Number(settings.packingChargeAmount) : 0;
      const grandTotal = subtotal + deliveryCharge + packingCharge;

      const orderNumber = await generateUniqueOrderNumber(tx);

      const newOrder = await tx.order.create({
        data: {
          userId: BigInt(req.userId),
          addressId: BigInt(addressId),
          orderNumber,
          subtotal,
          deliveryCharge,
          packingCharge,
          discountAmount: 0,
          grandTotal,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          orderStatus: 'PENDING',
          items: { create: orderItemsData },
        },
        include: { items: true, address: true },
      });

      return newOrder;
    });

    const adminSubs = await prisma.adminPushSubscription.findMany();
    for (const sub of adminSubs) {
      sendPushNotification(sub, {
        title: 'New Order Received',
        body: `Order ${order.orderNumber} — £${order.grandTotal} (${order.items.length} item${order.items.length > 1 ? 's' : ''})`,
        url: `/admin/orders/${order.id}`,
      });
    }

    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Failed to create order' });
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: BigInt(req.userId) },
      include: { items: true },
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
      include: { items: true, address: true },
    });

    if (!order || order.userId !== BigInt(req.userId)) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

async function cancelOrder(req, res) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: BigInt(id) },
      include: { items: true },
    });

    if (!order || order.userId !== BigInt(req.userId)) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.orderStatus !== 'PENDING') {
      return res.status(400).json({ error: 'This order can no longer be cancelled' });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.productVariantId) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: BigInt(id) },
        data: { orderStatus: 'CANCELLED' },
      });
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
}

module.exports = { createOrder, getMyOrders, getOrderById, cancelOrder };