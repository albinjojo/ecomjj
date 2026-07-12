const prisma = require('../lib/prisma');

async function getAddresses(req, res) {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: BigInt(req.userId) },
      orderBy: { isDefault: 'desc' },
    });
    res.json({ addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
}

async function createAddress(req, res) {
  try {
    const { name, phone, houseName, street, city, postcode, landmark, deliveryNotes, isDefault } = req.body;

    if (!name || !phone || !houseName || !street || !city || !postcode) {
      return res.status(400).json({ error: 'Missing required address fields' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: BigInt(req.userId) },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: BigInt(req.userId),
        name,
        phone,
        houseName,
        street,
        city,
        postcode,
        landmark: landmark || null,
        deliveryNotes: deliveryNotes || null,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({ address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create address' });
  }
}

async function updateAddress(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findUnique({ where: { id: BigInt(id) } });
    if (!existing || existing.userId !== BigInt(req.userId)) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: BigInt(req.userId) },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id: BigInt(id) },
      data: req.body,
    });

    res.json({ address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update address' });
  }
}

async function deleteAddress(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.address.findUnique({ where: { id: BigInt(id) } });
    if (!existing || existing.userId !== BigInt(req.userId)) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await prisma.address.delete({ where: { id: BigInt(id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete address' });
  }
}

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress };