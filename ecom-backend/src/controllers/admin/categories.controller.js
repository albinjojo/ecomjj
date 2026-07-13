const prisma = require('../../lib/prisma');
const { generateUniqueSlug } = require('../../lib/slugify');
const { processProductImage } = require('../../lib/imageProcessor');

async function getAllCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, requiresPacking } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const slug = await generateUniqueSlug(prisma, name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        requiresPacking: requiresPacking || false,
      },
    });

    res.status(201).json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, isActive, requiresPacking } = req.body;

    const existing = await prisma.category.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    let slug = existing.slug;
    if (name && name !== existing.name) {
      slug = await generateUniqueSlug(prisma, name);
    }

    const category = await prisma.category.update({
      where: { id: BigInt(id) },
      data: {
        ...(name && { name, slug }),
        ...(isActive !== undefined && { isActive }),
        ...(requiresPacking !== undefined && { requiresPacking }),
      },
    });

    res.json({ category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

async function uploadCategoryImage(req, res) {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const category = await prisma.category.findUnique({ where: { id: BigInt(id) } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { imageUrl } = await processProductImage(req.file.buffer, req.file.originalname);

    const updated = await prisma.category.update({
      where: { id: BigInt(id) },
      data: { imageUrl },
    });

    res.json({ category: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    const productCount = await prisma.product.count({ where: { categoryId: BigInt(id) } });
    if (productCount > 0) {
      return res.status(400).json({ error: 'Cannot delete a category that still has products in it' });
    }

    const existing = await prisma.category.findUnique({ where: { id: BigInt(id) } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({ where: { id: BigInt(id) } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

module.exports = { getAllCategories, createCategory, updateCategory, uploadCategoryImage, deleteCategory };