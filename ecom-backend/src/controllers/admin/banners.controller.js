const { processBannerImage } = require('../../lib/imageProcessor');
const prisma = require('../../lib/prisma');
const { processProductImage } = require('../../lib/imageProcessor');

async function getAllBanners(req, res) {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    res.json({ banners });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch banners' });
  }
}

async function createBanner(req, res) {
  try {
    const { title } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ error: 'Title and image are required' });
    }

    const { imageUrl } = await processBannerImage(req.file.buffer, req.file.originalname);

    const currentCount = await prisma.banner.count();

    const banner = await prisma.banner.create({
      data: {
        title,
        imageUrl,
        displayOrder: currentCount,
      },
    });

    res.status(201).json({ banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create banner' });
  }
}

async function updateBanner(req, res) {
  try {
    const { id } = req.params;
    const { title, isActive, displayOrder } = req.body;

    const existing = await prisma.banner.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const banner = await prisma.banner.update({
      where: { id: BigInt(id) },
      data: {
        ...(title !== undefined && { title }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder }),
      },
    });

    res.json({ banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update banner' });
  }
}

async function deleteBanner(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.banner.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    await prisma.banner.delete({ where: { id: BigInt(id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
}

module.exports = { getAllBanners, createBanner, updateBanner, deleteBanner };