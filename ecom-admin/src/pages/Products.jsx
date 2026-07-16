import { useState, useEffect } from 'react';

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:shadow-md"
              onClick={() => setSelectedProduct(p)}
            >
              <div className="h-32 bg-gray-100 flex items-center justify-center">
                {p.thumbnailUrl ? (
                  <img
                    src={`http://localhost:4000${p.thumbnailUrl}`}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No image</span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category?.name}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {p.isFeatured && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">Featured</span>
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

function ProductDetailModal({ product, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>

        {product.thumbnailUrl && (
          <img
            src={`http://localhost:4000${product.thumbnailUrl}`}
            alt={product.name}
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}

        <p className="text-sm text-gray-500 mb-1">{product.category?.name}</p>
        {product.description && <p className="text-sm mb-3">{product.description}</p>}

        <div className="flex gap-1 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
          {product.isFeatured && (
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">Featured</span>
          )}
        </div>

        <h3 className="font-semibold mb-2">Variants</h3>
        <div className="space-y-2 mb-4">
          {product.variants?.map((v) => (
            <div key={v.id} className="border rounded p-2 text-sm flex justify-between items-center">
              <span>{v.variantName}</span>
              <span>
                {v.offerEnabled && v.offerPrice ? (
                  <>
                    <span className="line-through text-gray-400 mr-2">£{v.price}</span>
                    <span className="text-red-600 font-semibold">£{v.offerPrice}</span>
                  </>
                ) : (
                  <span>£{v.price}</span>
                )}
              </span>
              <span className="text-gray-500">Stock: {v.stock}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 border rounded py-2 hover:bg-gray-50">
            Close
          </button>
          <button
            onClick={onEdit}
            className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
          >
            Edit
          </button>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <h2 className="text-xl font-bold mb-4">{product ? 'Edit Product' : 'New Product'}</h2>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        />

        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-3"
          rows={2}
        />

        {product && existingImages.length > 0 && (
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Current Images ({existingImages.length}/{MAX_IMAGES})
            </label>
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((img) => {
                const thumbUrl = thumbFor(img.imageUrl);
                const isMain = thumbUrl === mainImageUrl;
                return (
                  <div key={img.id} className="relative w-20 h-20 border rounded overflow-hidden">
                    <img
                      src={`http://localhost:4000${thumbUrl}`}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                    {isMain && (
                      <span className="absolute top-0 left-0 bg-yellow-400 text-[10px] px-1 rounded-br">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(img.id, img.imageUrl)}
                      disabled={isMain}
                      title="Set as main"
                      className="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-1 leading-4 disabled:opacity-40"
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(img.id)}
                      title="Delete image"
                      className="absolute top-0 right-0 bg-black/60 text-white text-xs w-5 h-5 flex items-center justify-center hover:bg-red-600"
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <label className="block text-sm font-medium mb-1">
          {product ? 'Add More Images' : 'Product Images'} ({existingImages.length + imageFiles.length}/{MAX_IMAGES})
        </label>
        <input
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          disabled={remainingImageSlots <= 0}
          onChange={handleImageFilesChange}
          className="w-full mb-3"
        />
        {imageActionError && <p className="text-red-600 text-xs -mt-2 mb-3">{imageActionError}</p>}

        <div className="flex gap-4 mb-4">
          {product && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span className="text-sm">Active</span>
            </label>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <span className="text-sm">Featured</span>
          </label>
        </div>

        <h3 className="font-semibold mb-2">Variants</h3>
        {variants.map((v, i) => (
          <div key={i} className="border rounded p-3 mb-3 bg-gray-50">
            <div className="grid grid-cols-4 gap-2 mb-2">
              <input
                type="number"
                step="0.01"
                placeholder="Qty"
                value={v.quantity}
                onChange={(e) => updateVariant(i, 'quantity', e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
              <select
                value={v.unit}
                onChange={(e) => updateVariant(i, 'unit', e.target.value)}
                className="border rounded px-2 py-1"
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
                className="border rounded px-2 py-1"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                className="border rounded px-2 py-1"
                required
              />
            </div>

            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={v.offerEnabled}
                onChange={(e) => updateVariant(i, 'offerEnabled', e.target.checked)}
              />
              <span className="text-sm">Offer active</span>
            </label>

            {v.offerEnabled && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Offer price (£)"
                  value={v.offerPrice}
                  onChange={(e) => updateVariant(i, 'offerPrice', e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="date"
                  value={v.offerStartDate}
                  onChange={(e) => updateVariant(i, 'offerStartDate', e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <input
                  type="date"
                  value={v.offerEndDate}
                  onChange={(e) => updateVariant(i, 'offerEndDate', e.target.value)}
                  className="border rounded px-2 py-1"
                />
              </div>
            )}

            {variants.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariant(i)}
                className="text-red-600 text-sm hover:underline"
              >
                Remove variant
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addVariant}
          className="text-blue-600 text-sm hover:underline mb-4"
        >
          + Add another variant
        </button>

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

export default Products;