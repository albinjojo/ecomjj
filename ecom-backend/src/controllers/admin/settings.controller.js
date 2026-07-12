const prisma = require('../../lib/prisma');
const { getSettings } = require('../../lib/settings');

async function fetchSettings(req, res) {
  try {
    const settings = await getSettings();
    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

async function updateSettings(req, res) {
  try {
    const { deliveryChargeEnabled, deliveryChargeAmount, packingChargeEnabled, packingChargeAmount } = req.body;

    const current = await getSettings();

    const settings = await prisma.settings.update({
      where: { id: current.id },
      data: {
        ...(deliveryChargeEnabled !== undefined && { deliveryChargeEnabled }),
        ...(deliveryChargeAmount !== undefined && { deliveryChargeAmount }),
        ...(packingChargeEnabled !== undefined && { packingChargeEnabled }),
        ...(packingChargeAmount !== undefined && { packingChargeAmount }),
      },
    });

    res.json({ settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

module.exports = { fetchSettings, updateSettings };