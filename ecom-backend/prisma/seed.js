require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { generateUniqueSlug } = require('../src/lib/slugify');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: 'frozen-foods' },
    update: {},
    create: {
      name: 'Frozen Foods',
      slug: 'frozen-foods',
      isActive: true,
    },
  });

  const existingProduct = await prisma.product.findFirst({
    where: { name: 'Frozen Samosas' },
  });

  if (existingProduct) {
    console.log('Product already seeded, skipping:', existingProduct);
  } else {
    const productName = 'Frozen Samosas';
    const slug = await generateUniqueSlug(prisma, productName);

    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: productName,
        slug: slug,
        description: 'Delicious frozen samosas, ready to fry or bake.',
        isActive: true,
        variants: {
          create: [
            { variantName: '500g', price: 3.99, stock: 50, isActive: true },
            { variantName: '1kg', price: 6.99, stock: 30, isActive: true },
          ],
        },
      },
    });

    console.log('Seeded:', { category, product });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });