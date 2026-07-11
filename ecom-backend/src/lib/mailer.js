const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendPasswordResetEmail(toEmail, resetLink) {
  await transporter.sendMail({
    from: `"JJ Stores Admin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your JJ Stores admin password',
    html: `
      <p>Someone requested a password reset for your JJ Stores admin account.</p>
      <p><a href="${resetLink}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}

module.exports = { sendPasswordResetEmail };