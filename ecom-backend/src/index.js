const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const productsRouter = require('./routes/products.route');
const categoriesRouter = require('./routes/categories.route');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads'));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(generalLimiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});