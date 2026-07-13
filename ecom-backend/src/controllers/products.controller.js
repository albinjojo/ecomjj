const prisma = require('../lib/prisma');

async function getProducts(req, res) {
  try {
    const { featured, onOffer } = req.query;
    const now = new Date();

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(featured === 'true' && { isFeatured: true }),
        ...(onOffer === 'true' && {
          variants: {
            some: {
              offerEnabled: true,
              offerPrice: { not: null },
              OR: [{ offerStartDate: null }, { offerStartDate: { lte: now } }],
              AND: [{ OR: [{ offerEndDate: null }, { offerEndDate: { gte: now } }] }],
            },
          },
        }),
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function getProductBySlug(req, res) {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
}

module.exports = { getProducts, getProductBySlug };