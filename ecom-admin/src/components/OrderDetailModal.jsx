import { useState } from 'react';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

function OrderDetailModal({ order, onClose, onUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const isCancelled = order.orderStatus === 'CANCELLED';

  async function handleUpdate() {
    if (selectedStatus === order.orderStatus) {
      onClose();
      return;
    }

    let markPaid = false;

    if (selectedStatus === 'DELIVERED') {
      markPaid = window.confirm('Did the customer pay for this order?');
    }

    setError(null);
    setSaving(true);
    try {
      const body = { orderStatus: selectedStatus };
      if (selectedStatus === 'DELIVERED' && markPaid) {
        body.paymentStatus = 'PAID';
      }

      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      onUpdated(data.order);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-900">{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-700">
            &times;
          </button>
        </div>

        <div className="mb-4 text-sm">
          <p><strong>{order.address?.name}</strong> — {order.address?.phone}</p>
          <p className="text-gray-600">
            {order.address?.houseName}, {order.address?.street}, {order.address?.city}, {order.address?.postcode}
          </p>
          {order.address?.landmark && <p className="text-gray-500">Landmark: {order.address.landmark}</p>}
          {order.address?.deliveryNotes && (
            <p className="italic text-gray-500">Note: {order.address.deliveryNotes}</p>
          )}
        </div>

        <div className="mb-4 border-y border-gray-100 py-3 text-sm">
          {order.items?.map((item) => (
            <div key={item.id} className="mb-1 flex justify-between gap-2">
              <span className="min-w-0 truncate">{item.quantity} × {item.productName} ({item.variantName})</span>
              <span className="shrink-0">£{item.total}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 text-gray-600">
            <span>Subtotal</span><span>£{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span><span>£{order.deliveryCharge}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Packing</span><span>£{order.packingCharge}</span>
          </div>
          <div className="mt-1 flex justify-between font-bold text-gray-900">
            <span>Total</span><span>£{order.grandTotal}</span>
          </div>
        </div>

        <div className="mb-4">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              order.paymentStatus === 'PAID'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            Payment: {order.paymentStatus}
          </span>
        </div>

        <label className="mb-2 block text-sm font-medium text-gray-700">Order Status</label>
        {isCancelled ? (
          <div className="mb-4">
            <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
              CANCELLED
            </span>
            <p className="mt-1 text-xs text-gray-500">
              This order has been cancelled and its status can no longer be changed.
            </p>
          </div>
        ) : (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {error && <p className="mb-4 text-sm text-brand-red">{error}</p>}

        <div className="flex gap-2">
          {isCancelled ? (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 rounded-lg bg-brand-red py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Status'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailModal;
