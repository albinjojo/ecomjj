import { useState, useEffect } from 'react';
import FileUploadButton from '../components/FileUploadButton';

const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'pack', 'box'];
const MAX_IMAGES = 4;

function thumbFor(imageUrl) {
  return imageUrl.replace('.webp', '-thumb.webp');
}

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProducts(prodData || []);
      setCategories(catData.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openCreateForm() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function openEditForm(product) {
    setSelectedProduct(null);
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProduct(null);
  }

  function handleSaved() {
    handleFormClose();
    fetchData();
  }

  function handleProductDeleted() {
    setSelectedProduct(null);
    fetchData();
  }

  function handleProductToggled() {
    fetchData();
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
        <button
          onClick={openCreateForm}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg"
              onClick={() => setSelectedProduct(p)}
            >
              <div className="flex h-32 items-center justify-center bg-brand-pink">
                {p.thumbnailUrl ? (
                  <img
                    src={`http://localhost:4000${p.thumbnailUrl}`}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-brand-red/50">No image</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category?.name}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {p.isFeatured && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Featured</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => openEditForm(selectedProduct)}
          onDeleted={handleProductDeleted}
          onToggled={handleProductToggled}
        />
      )}

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={handleFormClose}
          onSaved={handleSaved}
          onImagesChanged={fetchData}
        />
      )}
    </div>
  );
}

function ProductDetailModal({ product, onClose, onEdit, onDeleted, onToggled }) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isActive, setIsActive] = useState(product.isActive);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to permanently delete this product? This cannot be undone.')) {
      return;
    }

    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');

      onDeleted();
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  async function handleToggleActive() {
    const nextActive = !isActive;
    const confirmText = nextActive
      ? 'Activate this product? It will become visible to customers again.'
      : 'Deactivate this product? It will no longer be visible to customers.';

    if (!window.confirm(confirmText)) return;

    setToggleError(null);
    setToggling(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: nextActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');

      setIsActive(nextActive);
      onToggled?.();
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-700">
            &times;
          </button>
        </div>

        {product.thumbnailUrl && (
          <img
            src={`http://localhost:4000${product.thumbnailUrl}`}
            alt={product.name}
            className="mb-4 h-48 w-full rounded-lg object-cover"
          />
        )}

        <p className="mb-1 text-sm text-gray-500">{product.category?.name}</p>
        {product.description && <p className="mb-3 text-sm text-gray-700">{product.description}</p>}

        <div className="mb-4 flex gap-1">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {product.isFeatured && (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">Featured</span>
          )}
        </div>

        <h3 className="mb-2 font-semibold text-gray-900">Variants</h3>
        <div className="mb-4 space-y-2">
          {product.variants?.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border border-gray-200 p-2 text-sm">
              <span>{v.variantName}</span>
              <span>
                {v.offerEnabled && v.offerPrice ? (
                  <>
                    <span className="mr-2 text-gray-400 line-through">£{v.price}</span>
                    <span className="font-semibold text-brand-red">£{v.offerPrice}</span>
                  </>
                ) : (
                  <span>£{v.price}</span>
                )}
              </span>
              <span className="text-gray-500">Stock: {v.stock}</span>
            </div>
          ))}
        </div>

        {toggleError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{toggleError}</div>
        )}

        {deleteError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{deleteError}</div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleToggleActive}
              disabled={toggling}
              className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {toggling ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              Close
            </button>
            <button
              onClick={onEdit}
              className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function emptyVariant() {
  return {
    quantity: '',
    unit: 'g',
    price: '',
    stock: '',
    offerEnabled: false,
    offerPrice: '',
    offerStartDate: '',
    offerEndDate: '',
  };
}

function parseVariantName(variantName) {
  const match = variantName.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  if (match) {
    return { quantity: match[1], unit: match[2] };
  }
  return { quantity: '', unit: 'g' };
}

function ProductFormModal({ product, categories, onClose, onSaved, onImagesChanged }) {
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || '');
  const [description, setDescription] = useState(product?.description || '');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [variants, setVariants] = useState(
    product?.variants?.length
      ? product.variants.map((v) => {
          const { quantity, unit } = parseVariantName(v.variantName);
          return {
            quantity,
            unit,
            price: v.price,
            stock: v.stock,
            offerEnabled: v.offerEnabled,
            offerPrice: v.offerPrice || '',
            offerStartDate: v.offerStartDate ? v.offerStartDate.slice(0, 10) : '',
            offerEndDate: v.offerEndDate ? v.offerEndDate.slice(0, 10) : '',
          };
        })
      : [emptyVariant()]
  );
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [mainImageUrl, setMainImageUrl] = useState(product?.thumbnailUrl || null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageActionError, setImageActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const remainingImageSlots = MAX_IMAGES - existingImages.length;

  function handleImageFilesChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length > remainingImageSlots) {
      setImageActionError(`You can only have up to ${MAX_IMAGES} images per product. Only the first ${remainingImageSlots} selected file(s) will be uploaded.`);
      setImageFiles(files.slice(0, remainingImageSlots));
    } else {
      setImageActionError(null);
      setImageFiles(files);
    }
  }

  async function handleDeleteImage(imageId) {
    setImageActionError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete image');

      setExistingImages((prev) => {
        const deleted = prev.find((img) => img.id === imageId);
        const next = prev.filter((img) => img.id !== imageId);
        if (deleted && thumbFor(deleted.imageUrl) === mainImageUrl) {
          setMainImageUrl(next[0] ? thumbFor(next[0].imageUrl) : null);
        }
        return next;
      });
      onImagesChanged?.();
    } catch (err) {
      setImageActionError(err.message);
    }
  }

  async function handleSetMainImage(imageId, imageUrl) {
    setImageActionError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/images/${imageId}/main`, {
        method: 'PUT',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to set main image');
      setMainImageUrl(thumbFor(imageUrl));
      onImagesChanged?.();
    } catch (err) {
      setImageActionError(err.message);
    }
  }

  function updateVariant(index, field, value) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
  }

  function removeVariant(index) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (variants.length === 0) {
      setError('At least one variant is required.');
      return;
    }

    for (const v of variants) {
      if (!v.quantity || !v.unit) {
        setError('Every variant needs a quantity and unit.');
        return;
      }
    }

    setSaving(true);

    try {
      const payload = {
        name,
        categoryId,
        description,
        isFeatured,
        ...(product && { isActive }),
        variants: variants.map((v) => ({
          variantName: `${v.quantity}${v.unit}`,
          price: parseFloat(v.price),
          stock: parseInt(v.stock) || 0,
          offerEnabled: v.offerEnabled,
          offerPrice: v.offerEnabled ? parseFloat(v.offerPrice) : null,
          offerStartDate: v.offerEnabled && v.offerStartDate ? new Date(v.offerStartDate).toISOString() : null,
          offerEndDate: v.offerEnabled && v.offerEndDate ? new Date(v.offerEndDate).toISOString() : null,
        })),
      };

      let productId = product?.id;

      if (product) {
        const res = await fetch(`/api/admin/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create product');
        const data = await res.json();
        productId = data.product.id;
      }

      if (imageFiles.length && productId) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append('images', file));
        const imgRes = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!imgRes.ok) throw new Error('Product saved, but image upload failed');
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6"
      >
        <h2 className="mb-4 text-xl font-bold text-gray-900">{product ? 'Edit Product' : 'New Product'}</h2>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-brand-red">{error}</div>}

        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          required
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          rows={2}
        />

        {product && existingImages.length > 0 && (
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Current Images ({existingImages.length}/{MAX_IMAGES})
            </label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => {
                const thumbUrl = thumbFor(img.imageUrl);
                const isMain = thumbUrl === mainImageUrl;
                return (
                  <div key={img.id} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={`http://localhost:4000${thumbUrl}`}
                      alt="Product"
                      className="h-full w-full object-cover"
                    />
                    {isMain && (
                      <span className="absolute left-0 top-0 rounded-br bg-yellow-400 px-1 text-[10px] font-semibold">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(img.id, img.imageUrl)}
                      disabled={isMain}
                      title="Set as main"
                      className="absolute bottom-0 left-0 bg-black/60 px-1 text-xs leading-4 text-white disabled:opacity-40"
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      title="Delete image"
                      className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-black/60 text-xs text-white hover:bg-brand-red"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-gray-700">
          {product ? 'Add More Images' : 'Product Images'} ({existingImages.length + imageFiles.length}/{MAX_IMAGES})
        </label>
        <div className="mb-3">
          <FileUploadButton
            id="product-images-upload"
            accept="image/*,.heic,.heif"
            multiple
            disabled={remainingImageSlots <= 0}
            onChange={handleImageFilesChange}
            label="Choose Images"
          />
        </div>
        {imageActionError && <p className="-mt-2 mb-3 text-xs text-brand-red">{imageActionError}</p>}

        <div className="mb-4 flex gap-4">
          {product && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="accent-brand-red" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="accent-brand-red" />
            <span className="text-sm text-gray-700">Featured</span>
          </label>
        </div>

        <h3 className="mb-2 font-semibold text-gray-900">Variants</h3>
        {variants.map((v, i) => (
          <div key={i} className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input
                type="number"
                step="0.01"
                placeholder="Qty"
                value={v.quantity}
                onChange={(e) => updateVariant(i, 'quantity', e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
                required
              />
              <select
                value={v.unit}
                onChange={(e) => updateVariant(i, 'unit', e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Price (£)"
                value={v.price}
                onChange={(e) => updateVariant(i, 'price', e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
                required
              />
            </div>

            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={v.offerEnabled}
                onChange={(e) => updateVariant(i, 'offerEnabled', e.target.checked)}
                className="accent-brand-red"
              />
              <span className="text-sm text-gray-700">Offer active</span>
            </label>

            {v.offerEnabled && (
              <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Offer price (£)"
                  value={v.offerPrice}
                  onChange={(e) => updateVariant(i, 'offerPrice', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
                />
                <input
                  type="date"
                  value={v.offerStartDate}
                  onChange={(e) => updateVariant(i, 'offerStartDate', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
                />
                <input
                  type="date"
                  value={v.offerEndDate}
                  onChange={(e) => updateVariant(i, 'offerEndDate', e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1 focus:border-brand-red focus:outline-none"
                />
              </div>
            )}

            {variants.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Remove variant
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="mb-4 text-sm font-semibold text-brand-red hover:underline"
        >
          + Add another variant
        </button>

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

export default Products;
