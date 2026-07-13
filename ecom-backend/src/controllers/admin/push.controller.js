const prisma = require('../../lib/prisma');

async function subscribeAdmin(req, res) {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Invalid subscription data' });
    }

    // Avoid duplicate subscriptions for the same endpoint
    const existing = await prisma.adminPushSubscription.findFirst({
      where: { endpoint },
    });

    if (existing) {
      return res.json({ success: true, subscription: existing });
    }

    const subscription = await prisma.adminPushSubscription.create({
      data: {
        adminId: BigInt(req.adminId),
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    res.status(201).json({ success: true, subscription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
}

module.exports = { subscribeAdmin };