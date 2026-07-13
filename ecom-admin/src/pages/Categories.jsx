import { useState, useEffect } from 'react';

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-md"
              onClick={() => openEditForm(cat)}
            >
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {cat.imageUrl ? (
                  <img
                    src={`http://localhost:4000${cat.imageUrl}`}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold">{cat.name}</p>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {cat.requiresPacking && (
                    <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg max-w-md w-full p-6"
      >
        <h2 className="text-xl font-bold mb-4">
          {category ? 'Edit Category' : 'New Category'}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />

        <label className="block text-sm font-medium mb-1">Category Image</label>
        <input
          type="file"
          accept="image/*,.heic,.heif"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="w-full mb-4"
        />

        {category && (
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="text-sm">Active</span>
          </label>
        )}

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={requiresPacking}
            onChange={(e) => setRequiresPacking(e.target.checked)}
          />
          <span className="text-sm">Requires packing charge (e.g. frozen items)</span>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border rounded py-2 hover:bg-gray-50"
          >
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

export default Categories;