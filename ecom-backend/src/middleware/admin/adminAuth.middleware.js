const jwt = require('jsonwebtoken');

function requireAdminAuth(req, res, next) {
  const token = req.cookies.admin_session;

  if (!token) {
    return res.status(401).json({ error: 'Not signed in as admin' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session' });
  }
}

module.exports = { requireAdminAuth };