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
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSave}>
        <div className="border rounded-lg p-4 mb-4 bg-white">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={settings.deliveryChargeEnabled}
              onChange={(e) =>
                setSettings({ ...settings, deliveryChargeEnabled: e.target.checked })
              }
            />
            <span className="font-semibold">Delivery Charge Enabled</span>
          </label>

          <label className="block text-sm font-medium mb-1">Amount (£)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={settings.deliveryChargeAmount}
            onChange={(e) =>
              setSettings({ ...settings, deliveryChargeAmount: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="border rounded-lg p-4 mb-4 bg-white">
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={settings.packingChargeEnabled}
              onChange={(e) =>
                setSettings({ ...settings, packingChargeEnabled: e.target.checked })
              }
            />
            <span className="font-semibold">Packing Charge Enabled</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Applies to any order containing an item from a category marked "Requires packing charge" (e.g. Frozen Foods).
          </p>

          <label className="block text-sm font-medium mb-1">Amount (£)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={settings.packingChargeAmount}
            onChange={(e) =>
              setSettings({ ...settings, packingChargeAmount: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

export default Settings;