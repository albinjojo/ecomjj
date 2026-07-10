const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

async function processProductImage(inputBuffer) {
  const id = crypto.randomBytes(8).toString('hex');

  const mainFilename = `${id}.webp`;
  const thumbFilename = `${id}-thumb.webp`;

  const mainPath = path.join(UPLOAD_DIR, mainFilename);
  const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

  await sharp(inputBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(mainPath);

  await sharp(inputBuffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  return {
    imageUrl: `/uploads/products/${mainFilename}`,
    thumbnailUrl: `/uploads/products/${thumbFilename}`,
  };
}

module.exports = { processProductImage };