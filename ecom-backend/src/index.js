const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const productsRouter = require('./routes/products.route');
const categoriesRouter = require('./routes/categories.route');
const authRouter = require('./routes/auth.route');
const adminRouter = require('./routes/admin/admin.route');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
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
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});