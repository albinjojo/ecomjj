const prisma = require('../lib/prisma');

async function getActiveBanners(req, res) {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ banners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
}

module.exports = { getActiveBanners };