import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getProductBySlug, getImageUrl, queryKeys } from '../lib/api';
import { useCart } from '../hooks/useCart';
import { isVariantOnOffer, getEffectivePrice, getDiscountPercent } from '../lib/pricing';

const LOW_STOCK_THRESHOLD = 20;

function ImageGallery({ images, thumbnailUrl, name }) {
  const gallery =
    images && images.length > 0
      ? images
      : thumbnailUrl
        ? [{ id: 'thumbnail', imageUrl: thumbnailUrl }]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);

  if (gallery.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-brand-pink text-sm text-gray-400">
        No image
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-brand-pink">
        <img
          src={getImageUrl(gallery[activeIndex].imageUrl)}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === activeIndex ? 'border-brand-red' : 'border-transparent'
              }`}
            >
              <img src={getImageUrl(img.imageUrl)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function defaultVariantId(variants) {
  const firstInStock = variants.find((v) => v.stock > 0);
  return (firstInStock || variants[0])?.id ?? null;
}

function ProductDetailView({ product }) {
  const { addItem } = useCart();
  const variants = product.variants || [];

  const [selectedVariantId, setSelectedVariantId] = useState(() => defaultVariantId(variants));
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (!addedMessage) return;
    const timer = setTimeout(() => setAddedMessage(false), 2000);
    return () => clearTimeout(timer);
  }, [addedMessage]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  if (!selectedVariant) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500">
        This product is currently unavailable.
      </div>
    );
  }

  const onOffer = isVariantOnOffer(selectedVariant);
  const price = getEffectivePrice(selectedVariant);
  const discount = getDiscountPercent(selectedVariant);
  const outOfStock = selectedVariant.stock <= 0;

  function selectVariant(variant) {
    if (variant.stock <= 0) return;
    setSelectedVariantId(variant.id);
    setQuantity(1);
  }

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant.id,
        slug: product.slug,
        name: product.name,
        variantName: selectedVariant.variantName,
        thumbnailUrl: product.thumbnailUrl,
        price: selectedVariant.price,
        offerPrice: selectedVariant.offerPrice,
        offerEnabled: selectedVariant.offerEnabled,
        offerStartDate: selectedVariant.offerStartDate,
        offerEndDate: selectedVariant.offerEndDate,
        stock: selectedVariant.stock,
      },
      quantity
    );
    setAddedMessage(true);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={product.images} thumbnailUrl={product.thumbnailUrl} name={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            {product.category?.slug && (
              <Link
                to={`/category/${product.category.slug}`}
                className="text-xs font-semibold uppercase tracking-wide text-brand-red hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 sm:text-3xl">{product.name}</h1>
          </div>

          {product.description && (
            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
          )}

          <div>
            <p className="mb-2 text-sm font-semibold text-gray-900">Size</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const variantOutOfStock = variant.stock <= 0;
                const isSelected = variant.id === selectedVariant.id;
                const variantOnOffer = isVariantOnOffer(variant);
                const variantPrice = getEffectivePrice(variant);

                return (
                  <button
                    key={variant.id}
                    onClick={() => selectVariant(variant)}
                    disabled={variantOutOfStock}
                    className={`rounded-xl border-2 px-4 py-2 text-left text-sm transition-colors ${
                      variantOutOfStock
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                        : isSelected
                          ? 'border-brand-red bg-brand-pink text-gray-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-brand-red/50'
                    }`}
                  >
                    <span className="block font-semibold">{variant.variantName}</span>
                    <span className="block text-xs">
                      £{variantPrice.toFixed(2)}
                      {variantOnOffer && (
                        <span className="ml-1 text-[10px] font-bold text-brand-red">OFFER</span>
                      )}
                    </span>
                    {variantOutOfStock && (
                      <span className="block text-[10px] font-semibold text-gray-400">Out of stock</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-gray-900">£{price.toFixed(2)}</span>
            {onOffer && (
              <>
                <span className="text-base text-gray-400 line-through">
                  £{Number(selectedVariant.price).toFixed(2)}
                </span>
                <span className="rounded-full bg-brand-red px-2 py-0.5 text-xs font-bold text-white">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          {!outOfStock && (
            <p className="text-xs text-gray-500">
              {selectedVariant.stock < LOW_STOCK_THRESHOLD ? `${selectedVariant.stock} in stock` : 'In stock'}
            </p>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-full border border-gray-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="px-3 py-2 text-lg font-semibold text-gray-600 disabled:text-gray-300"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                disabled={outOfStock || quantity >= selectedVariant.stock}
                className="px-3 py-2 text-lg font-semibold text-gray-600 disabled:text-gray-300"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`flex-1 rounded-full py-3 text-sm font-semibold transition-colors ${
                outOfStock
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-brand-red text-white hover:bg-brand-red-dark'
              }`}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {addedMessage && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              Added to cart
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductDetail() {
  const { slug } = useParams();

  const { data: product, isLoading, error } = useQuery({
    queryKey: queryKeys.productBySlug(slug),
    queryFn: () => getProductBySlug(slug),
  });

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500">Loading...</div>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This product may have been removed or is no longer available.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return <ProductDetailView key={product.id} product={product} />;
}

export default ProductDetail;
