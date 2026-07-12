const crypto = require('crypto');

async function generateUniqueOrderNumber(prisma) {
  let orderNumber;
  let exists = true;

  while (exists) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    orderNumber = `JJS-${datePart}-${randomPart}`;

    const existing = await prisma.order.findUnique({ where: { orderNumber } });
    exists = !!existing;
  }

  return orderNumber;
}

module.exports = { generateUniqueOrderNumber };