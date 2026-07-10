require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: 'frozen-samosas' },
  });

  if (!product) {
    console.log('Product not found — check the slug.');
    return;
  }

  const image = await prisma.productImage.create({
    data: {
      productId: product.id,
      imageUrl: '/uploads/products/07902a85381410c5.webp',
      displayOrder: 0,
    },
  });

  // Also set it as the product's thumbnail
  await prisma.product.update({
    where: { id: product.id },
    data: { thumbnailUrl: '/uploads/products/07902a85381410c5-thumb.webp' },
  });

  console.log('Linked image to product:', image);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });