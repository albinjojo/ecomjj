import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { getEffectivePrice, isVariantOnOffer } from '../lib/pricing';
import { getImageUrl } from '../lib/api';

function CartItemRow({ item, updateQuantity, removeItem }) {
  const onOffer = isVariantOnOffer(item);
  const unitPrice = getEffectivePrice(item);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-brand-pink">
        {item.thumbnailUrl ? (
          <img
            src={getImageUrl(item.thumbnailUrl)}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-[10rem] flex-1">
        <p className="font-semibold text-gray-900">
          {item.name} — {item.variantName}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          £{unitPrice.toFixed(2)}
          {onOffer && <span className="ml-1 text-xs font-bold text-brand-red">OFFER</span>}
        </p>
      </div>

      <div className="flex items-center rounded-full border border-gray-200">
        <button
          onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
          className="px-3 py-1.5 text-lg font-semibold text-gray-600"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.variantId, Math.min(item.stock, item.quantity + 1))}
          className="px-3 py-1.5 text-lg font-semibold text-gray-600"
        >
          +
        </button>
      </div>

      <div className="w-20 shrink-0 text-right font-bold text-gray-900">£{lineTotal.toFixed(2)}</div>

      <button
        onClick={() => removeItem(item.variantId)}
        className="text-sm font-semibold text-gray-400 hover:text-brand-red"
      >
        Remove
      </button>
    </div>
  );
}

function Cart() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-sm text-gray-500">Looks like you haven&rsquo;t added anything yet.</p>
        <Link
          to="/"
          className="mt-2 rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-extrabold text-gray-900">Your Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow
              key={item.variantId}
              item={item}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-900">£{totalPrice.toFixed(2)}</span>
            </div>

            <p className="text-xs text-gray-500">
              Delivery and any applicable packing charges will be calculated at checkout.
            </p>

            <button
              onClick={() => navigate('/checkout')}
              disabled={items.length === 0}
              className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
                items.length === 0
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-brand-red text-white hover:bg-brand-red-dark'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
