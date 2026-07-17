import { useState, useEffect } from 'react';
import FileUploadButton from '../components/FileUploadButton';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreateForm() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function openEditForm(category) {
    setEditingCategory(category);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditingCategory(null);
  }

  function handleSaved() {
    handleClose();
    fetchCategories();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Categories</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg"
              onClick={() => openEditForm(cat)}
            >
              <div className="flex h-32 items-center justify-center bg-brand-pink">
                {cat.imageUrl ? (
                  <img
                    src={`http://localhost:4000${cat.imageUrl}`}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-brand-red/50">No image</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900">{cat.name}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {cat.requiresPacking && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      Packing Charge
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function CategoryFormModal({ category, onClose, onSaved }) {
  const [name, setName] = useState(category?.name || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [requiresPacking, setRequiresPacking] = useState(category?.requiresPacking || false);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let categoryId = category?.id;

      if (category) {
        const res = await fetch(`/api/admin/categories/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, isActive, requiresPacking }),
        });
        if (!res.ok) throw new Error('Failed to update category');
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, requiresPacking }),
        });
        if (!res.ok) throw new Error('Failed to create category');
        const data = await res.json();
        categoryId = data.category.id;
      }

      if (imageFile && categoryId) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const imgRes = await fetch(`/api/admin/categories/${categoryId}/image`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!imgRes.ok) throw new Error('Category saved, but image upload failed');
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
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6"
      >
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {category ? 'Edit Category' : 'New Category'}
        </h2>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-brand-red">{error}</div>}

        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          required
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Category Image</label>
        <div className="mb-4">
          <FileUploadButton
            id="category-image-upload"
            accept="image/*,.heic,.heif"
            onChange={(e) => setImageFile(e.target.files[0])}
            label="Choose Image"
            existingImageUrl={category?.imageUrl ? `http://localhost:4000${category.imageUrl}` : null}
          />
        </div>

        {category && (
          <label className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-brand-red"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        )}

        <label className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={requiresPacking}
            onChange={(e) => setRequiresPacking(e.target.checked)}
            className="accent-brand-red"
          />
          <span className="text-sm text-gray-700">Requires packing charge (e.g. frozen items)</span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
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

export default Categories;
