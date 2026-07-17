import { useState, useEffect } from 'react';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      const data = await res.json();
      setSettings(data.settings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  function handleDeliveryToggle(e) {
    const nextEnabled = e.target.checked;
    const confirmText = nextEnabled
      ? 'Enable delivery charge for all future orders?'
      : 'Disable delivery charge? Orders will no longer include a delivery fee.';

    if (!window.confirm(confirmText)) return;

    setSettings({ ...settings, deliveryChargeEnabled: nextEnabled });
  }

  function handlePackingToggle(e) {
    const nextEnabled = e.target.checked;
    const confirmText = nextEnabled
      ? 'Enable packing charge for eligible products?'
      : 'Disable packing charge?';

    if (!window.confirm(confirmText)) return;

    setSettings({ ...settings, packingChargeEnabled: nextEnabled });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deliveryChargeEnabled: settings.deliveryChargeEnabled,
          deliveryChargeAmount: parseFloat(settings.deliveryChargeAmount) || 0,
          packingChargeEnabled: settings.packingChargeEnabled,
          packingChargeAmount: parseFloat(settings.packingChargeAmount) || 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      const data = await res.json();
      setSettings(data.settings);
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <div className="p-4 text-gray-500 md:p-8">Loading...</div>;
  }

  return (
    <div className="max-w-lg p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Settings</h1>

      {message && <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-brand-red">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
          <label className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.deliveryChargeEnabled}
              onChange={handleDeliveryToggle}
              className="accent-brand-red"
            />
            <span className="font-semibold text-gray-900">Delivery Charge Enabled</span>
          </label>

          <label className="mb-1 block text-sm font-medium text-gray-700">Amount (£)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={settings.deliveryChargeAmount}
            onChange={(e) =>
              setSettings({ ...settings, deliveryChargeAmount: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          />
        </div>

        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
          <label className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.packingChargeEnabled}
              onChange={handlePackingToggle}
              className="accent-brand-red"
            />
            <span className="font-semibold text-gray-900">Packing Charge Enabled</span>
          </label>
          <p className="mb-3 text-xs text-gray-500">
            Applies to any order containing an item from a category marked "Requires packing charge" (e.g. Frozen Foods).
          </p>

          <label className="mb-1 block text-sm font-medium text-gray-700">Amount (£)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={settings.packingChargeAmount}
            onChange={(e) =>
              setSettings({ ...settings, packingChargeAmount: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-brand-red px-6 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default Settings;
