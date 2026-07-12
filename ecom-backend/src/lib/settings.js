const prisma = require('./prisma');

async function getSettings() {
  let settings = await prisma.settings.findFirst();

  if (!settings) {
    settings = await prisma.settings.create({ data: {} }); // uses schema defaults (all off, 0)
  }

  return settings;
}

module.exports = { getSettings };