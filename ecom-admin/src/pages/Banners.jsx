import { useState, useEffect } from 'react';

function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners', { credentials: 'include' });
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  function openCreateForm() {
    setEditingBanner(null);
    setShowForm(true);
  }

  function openEditForm(banner) {
    setEditingBanner(banner);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingBanner(null);
  }

  function handleSaved() {
    handleClose();
    fetchBanners();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      fetchBanners();
    } catch (err) {
      alert('Failed to delete banner');
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Banners</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Banner
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="border rounded-lg p-3 bg-white shadow-sm flex items-center gap-4">
              <img
                src={`http://localhost:4000${b.imageUrl}`}
                alt={b.title}
                className="w-32 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{b.title}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <button
                onClick={() => openEditForm(b)}
                className="text-blue-600 text-sm hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BannerFormModal
          banner={editingBanner}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function BannerFormModal({ banner, onClose, onSaved }) {
  const [title, setTitle] = useState(banner?.title || '');
  const [isActive, setIsActive] = useState(banner?.isActive ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!banner && !imageFile) {
      setError('An image is required for a new banner.');
      return;
    }

    setSaving(true);

    try {
      if (banner) {
        const res = await fetch(`/api/admin/banners/${banner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, isActive }),
        });
        if (!res.ok) throw new Error('Failed to update banner');
      } else {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', imageFile);
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!res.ok) throw new Error('Failed to create banner');
      }

      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">{banner ? 'Edit Banner' : 'New Banner'}</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        {!banner && (
          <>
            <label className="block text-sm font-medium mb-1">Banner Image (wide, e.g. 1920px)</label>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full mb-4"
              required
            />
          </>
        )}

        {banner && (
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm">Active</span>
          </label>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border rounded py-2 hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Banners;