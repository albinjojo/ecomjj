const sharp = require('sharp');
const heicConvert = require('heic-convert');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads/products');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function isHeic(buffer, filename) {
  const ext = (filename || '').toLowerCase();
  if (ext.endsWith('.heic') || ext.endsWith('.heif')) return true;

  const signature = buffer.toString('hex', 4, 12);
  return signature.includes('66747970686569') || signature.includes('6674797068656963');
}

async function processProductImage(inputBuffer, originalFilename = '') {
  let workingBuffer = inputBuffer;

  if (isHeic(inputBuffer, originalFilename)) {
    workingBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    });
  }

  const id = crypto.randomBytes(8).toString('hex');

  const mainFilename = `${id}.webp`;
  const thumbFilename = `${id}-thumb.webp`;

  const mainPath = path.join(UPLOAD_DIR, mainFilename);
  const thumbPath = path.join(UPLOAD_DIR, thumbFilename);

  await sharp(workingBuffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(mainPath);

  await sharp(workingBuffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(thumbPath);

  return {
    imageUrl: `/uploads/products/${mainFilename}`,
    thumbnailUrl: `/uploads/products/${thumbFilename}`,
  };
}

async function processBannerImage(inputBuffer, originalFilename = '') {
  let workingBuffer = inputBuffer;

  if (isHeic(inputBuffer, originalFilename)) {
    workingBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.9,
    });
  }

  const id = crypto.randomBytes(8).toString('hex');
  const filename = `${id}.webp`;
  const filePath = path.join(UPLOAD_DIR, filename);

  await sharp(workingBuffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filePath);

  return {
    imageUrl: `/uploads/products/${filename}`,
  };
}

module.exports = { processProductImage, processBannerImage };