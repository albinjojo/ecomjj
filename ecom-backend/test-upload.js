const fs = require('fs');
const { processProductImage } = require('./src/lib/imageProcessor');

async function test() {
  const buffer = fs.readFileSync('./test-image.jpg');
  const result = await processProductImage(buffer);
  console.log('Processed:', result);
}

test();