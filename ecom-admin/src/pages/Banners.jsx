import { useState, useEffect } from 'react';
import FileUploadButton from '../components/FileUploadButton';

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
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Banners</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark"
        >
          + Add Banner
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-md sm:flex-row sm:items-center sm:gap-4"
            >
              <img
                src={`http://localhost:4000${b.imageUrl}`}
                alt={b.title}
                className="h-32 w-full rounded-lg object-cover sm:h-16 sm:w-32"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{b.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    b.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-4 sm:gap-2">
                <button
                  onClick={() => openEditForm(b)}
                  className="text-sm font-semibold text-gray-600 hover:text-brand-red"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">{banner ? 'Edit Banner' : 'New Banner'}</h2>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-brand-red">{error}</div>}

        <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          required
        />

        {!banner && (
          <>
            <label className="mb-1 block text-sm font-medium text-gray-700">Banner Image (wide, e.g. 1920px)</label>
            <div className="mb-4">
              <FileUploadButton
                id="banner-image-upload"
                accept="image/*,.heic,.heif"
                onChange={(e) => setImageFile(e.target.files[0])}
                label="Choose Image"
              />
            </div>
          </>
        )}

        {banner && (
          <label className="mb-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-brand-red"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-lg bg-brand-red py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Banners;
