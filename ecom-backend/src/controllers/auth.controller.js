const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleSignIn(req, res) {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ error: 'Missing Google credential' });
    }

    // Verify the token actually came from Google and was issued for our app
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: authUserId, email, name } = payload;

    // Find existing user, or create a new one
    let user = await prisma.user.findUnique({ where: { authUserId } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          authUserId,
          email,
          name,
          phone: null, // collected later, at address/checkout
        },
      });
    }

    // Issue our own session token
    const token = jwt.sign(
      { userId: user.id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Google sign-in failed' });
  }
}

async function getMe(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: BigInt(req.userId) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

function logout(req, res) {
  res.clearCookie('session');
  res.json({ success: true });
}

module.exports = { googleSignIn, getMe, logout };