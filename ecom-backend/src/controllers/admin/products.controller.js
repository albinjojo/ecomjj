const prisma = require('../../lib/prisma');
const { generateUniqueSlug } = require('../../lib/slugify');
const { processProductImage } = require('../../lib/imageProcessor');

async function createProduct(req, res) {
  try {
    const { name, categoryId, description, isFeatured, variants } = req.body;

    if (!name || !categoryId || !variants || variants.length === 0) {
      return res.status(400).json({ error: 'Name, category, and at least one variant are required' });
    }

    const slug = await generateUniqueSlug(prisma, name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        categoryId: BigInt(categoryId),
        description: description || null,
        isFeatured: isFeatured || false,
        variants: {
          create: variants.map((v) => ({
            variantName: v.variantName,
            price: v.price,
            offerPrice: v.offerEnabled ? v.offerPrice : null,
            offerEnabled: v.offerEnabled || false,
            offerStartDate: v.offerEnabled ? v.offerStartDate : null,
            offerEndDate: v.offerEnabled ? v.offerEndDate : null,
            stock: v.stock || 0,
            sku: v.sku || null,
          })),
        },
      },
      include: { variants: true, images: true, category: true },
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, categoryId, description, isActive, isFeatured, variants } = req.body;

    const existing = await prisma.product.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = await generateUniqueSlug(prisma, name);
    }

    const updateData = {
      ...(name && { name, slug }),
      ...(categoryId && { categoryId: BigInt(categoryId) }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    };

    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: BigInt(id) } });
      updateData.variants = {
        create: variants.map((v) => ({
          variantName: v.variantName,
          price: v.price,
          offerPrice: v.offerEnabled ? v.offerPrice : null,
          offerEnabled: v.offerEnabled || false,
          offerStartDate: v.offerEnabled ? v.offerStartDate : null,
          offerEndDate: v.offerEnabled ? v.offerEndDate : null,
          stock: v.stock || 0,
          sku: v.sku || null,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: { variants: true, images: true, category: true },
    });

    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function uploadProductImage(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const product = await prisma.product.findUnique({ where: { id: BigInt(id) } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { imageUrl, thumbnailUrl } = await processProductImage(req.file.buffer, req.file.originalname);

    const currentCount = await prisma.productImage.count({ where: { productId: BigInt(id) } });

    const image = await prisma.productImage.create({
      data: {
        productId: BigInt(id),
        imageUrl,
        displayOrder: currentCount,
      },
    });

    if (currentCount === 0) {
      await prisma.product.update({
        where: { id: BigInt(id) },
        data: { thumbnailUrl },
      });
    }

    res.status(201).json({ image });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

module.exports = { createProduct, updateProduct, uploadProductImage };