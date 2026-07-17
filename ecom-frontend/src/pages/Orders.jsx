import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getOrders, cancelOrder, queryKeys } from '../lib/api';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function StatusBadge({ label }) {
  return (
    <span className="rounded-full bg-brand-pink px-2 py-0.5 text-xs font-semibold text-brand-red">
      {label.replace(/_/g, ' ')}
    </span>
  );
}

function OrderCard({ order, onCancel, cancelling, cancelError }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900">{order.orderNumber}</p>
          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge label={order.orderStatus} />
          <StatusBadge label={order.paymentStatus} />
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <p className="min-w-0 flex-1 truncate text-gray-700">
              {item.productName} — {item.variantName}
              <span className="text-gray-400"> × {item.quantity}</span>
            </p>
            <p className="shrink-0 font-semibold text-gray-900">£{Number(item.total).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm font-semibold text-gray-600">Grand Total</span>
        <span className="text-base font-bold text-gray-900">£{Number(order.grandTotal).toFixed(2)}</span>
      </div>

      {order.orderStatus === 'PENDING' && (
        <div className="border-t border-gray-100 pt-3">
          {cancelError && <p className="mb-2 text-sm text-brand-red">{cancelError}</p>}
          <button
            type="button"
            onClick={() => onCancel(order.id)}
            disabled={cancelling}
            className="text-sm font-semibold text-brand-red hover:underline disabled:opacity-50"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
}

function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cancellingId, setCancellingId] = useState(null);
  const [cancelErrors, setCancelErrors] = useState({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.orders,
    queryFn: getOrders,
    enabled: !!user,
  });

  if (authLoading || !user) {
    return null;
  }

  const orders = data?.orders || [];

  async function handleCancelOrder(orderId) {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelErrors((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      queryClient.setQueryData(queryKeys.orders, (old) => ({
        orders: (old?.orders || []).map((o) =>
          o.id === orderId ? { ...o, orderStatus: 'CANCELLED' } : o
        ),
      }));
    } catch (err) {
      console.error(err);
      setCancelErrors((prev) => ({ ...prev, [orderId]: err.message }));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-6 text-xl font-extrabold text-gray-900">My Orders</h1>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-gray-500">You haven&rsquo;t placed any orders yet</p>
          <Link to="/" className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={handleCancelOrder}
              cancelling={cancellingId === order.id}
              cancelError={cancelErrors[order.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
