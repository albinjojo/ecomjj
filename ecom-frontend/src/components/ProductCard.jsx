import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { getEffectivePrice, getDiscountPercent, isVariantOnOffer } from '../lib/pricing';
import { getImageUrl } from '../lib/api';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants && product.variants[0];
  if (!variant) return null;

  const onOffer = isVariantOnOffer(variant);
  const price = getEffectivePrice(variant);
  const discount = getDiscountPercent(variant);
  const outOfStock = variant.stock <= 0;

  function decreaseQuantity(e) {
    e.stopPropagation();
    setQuantity((q) => Math.max(1, q - 1));
  }

  function increaseQuantity(e) {
    e.stopPropagation();
    setQuantity((q) => Math.min(variant.stock, q + 1));
  }

  function handleAddToCart(e) {
    e.stopPropagation();
    if (outOfStock) return;
    addItem(
      {
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        name: product.name,
        variantName: variant.variantName,
        thumbnailUrl: product.thumbnailUrl,
        price: variant.price,
        offerPrice: variant.offerPrice,
        offerEnabled: variant.offerEnabled,
        offerStartDate: variant.offerStartDate,
        offerEndDate: variant.offerEndDate,
        stock: variant.stock,
      },
      quantity
    );
    setQuantity(1);
  }

  return (
    <div
      onClick={() => navigate(`/products/${product.slug}`)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-square bg-brand-pink">
        {discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-brand-red px-2 py-1 text-xs font-bold text-white">
            -{discount}%
          </span>
        )}
        {product.thumbnailUrl ? (
          <img
            src={getImageUrl(product.thumbnailUrl)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="text-sm font-semibold text-gray-600">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category?.name && (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-red">
            {product.category.name}
          </span>
        )}
        <h3 className="min-h-[2.5em] text-sm font-semibold leading-snug text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-bold text-gray-900">£{price.toFixed(2)}</span>
          {onOffer && (
            <span className="text-xs text-gray-400 line-through">
              £{Number(variant.price).toFixed(2)}
            </span>
          )}
        </div>

        {!outOfStock && (
          <div className="mt-2 flex items-center justify-center gap-3 self-center rounded-full border border-gray-200 py-1">
            <button
              onClick={decreaseQuantity}
              className="px-2 text-base font-semibold text-gray-600"
            >
              −
            </button>
            <span className="w-4 text-center text-sm font-semibold">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="px-2 text-base font-semibold text-gray-600"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`mt-2 w-full rounded-full py-2 text-sm font-semibold transition-colors ${
            outOfStock
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-brand-red text-white hover:bg-brand-red-dark'
          }`}
        >
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
