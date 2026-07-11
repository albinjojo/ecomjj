const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../../lib/prisma');
const { sendPasswordResetEmail } = require('../../lib/mailer');

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: admin.id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.json({ success: true });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `http://localhost:5174/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(admin.email, resetLink);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process request' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' });
    }

    const admin = await prisma.admin.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!admin) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}

async function getMe(req, res) {
  try {
    const admin = await prisma.admin.findUnique({ where: { id: BigInt(req.adminId) } });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json({ admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch admin' });
  }
}

function logout(req, res) {
  res.clearCookie('admin_session');
  res.json({ success: true });
}

module.exports = { login, forgotPassword, resetPassword, getMe, logout };