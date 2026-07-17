import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  useEffect(() => {
    if (!order) {
      navigate('/', { replace: true });
    }
  }, [order, navigate]);

  if (!order) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl">✅</span>
        <h1 className="text-2xl font-extrabold text-gray-900">Order Placed Successfully!</h1>
        <p className="text-sm text-gray-500">
          Order <span className="font-semibold text-gray-900">{order.orderNumber}</span>
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Order Items</h2>

        <div className="flex flex-col gap-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">
                  {item.productName} — {item.variantName}
                </p>
                <p className="text-gray-500">
                  Qty {item.quantity} × £{Number(item.price).toFixed(2)}
                </p>
              </div>
              <div className="shrink-0 font-bold text-gray-900">£{Number(item.total).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-gray-100 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold text-gray-900">£{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Delivery</span>
            <span className="font-semibold text-gray-900">£{Number(order.deliveryCharge).toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Packing</span>
            <span className="font-semibold text-gray-900">£{Number(order.packingCharge).toFixed(2)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-gray-100 pt-2 text-base">
            <span className="font-bold text-gray-900">Grand Total</span>
            <span className="font-bold text-gray-900">£{Number(order.grandTotal).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        You can track your order status anytime from your My Orders page
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/orders"
          className="flex-1 rounded-full bg-brand-red py-3 text-center text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          View My Orders
        </Link>
        <Link
          to="/"
          className="flex-1 rounded-full border border-gray-200 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;
