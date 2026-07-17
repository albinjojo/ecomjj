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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">{order.orderNumber}</h2>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="text-sm mb-4">
          <p><strong>{order.address?.name}</strong> — {order.address?.phone}</p>
          <p className="text-gray-600">
            {order.address?.houseName}, {order.address?.street}, {order.address?.city}, {order.address?.postcode}
          </p>
          {order.address?.landmark && <p className="text-gray-500">Landmark: {order.address.landmark}</p>}
          {order.address?.deliveryNotes && (
            <p className="text-gray-500 italic">Note: {order.address.deliveryNotes}</p>
          )}
        </div>

        <div className="border-t border-b py-3 mb-4 text-sm">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between mb-1">
              <span>{item.quantity} × {item.productName} ({item.variantName})</span>
              <span>£{item.total}</span>
            </div>
          ))}
          <div className="flex justify-between mt-2 pt-2 border-t text-gray-600">
            <span>Subtotal</span><span>£{order.subtotal}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery</span><span>£{order.deliveryCharge}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Packing</span><span>£{order.packingCharge}</span>
          </div>
          <div className="flex justify-between font-bold mt-1">
            <span>Total</span><span>£{order.grandTotal}</span>
          </div>
        </div>

        <div className="mb-4">
          <span
            className={`text-xs px-2 py-1 rounded ${
              order.paymentStatus === 'PAID'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            Payment: {order.paymentStatus}
          </span>
        </div>

        <label className="block text-sm font-medium mb-2">Order Status</label>
        {isCancelled ? (
          <div className="mb-4">
            <span className="inline-block text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-semibold">
              CANCELLED
            </span>
            <p className="text-xs text-gray-500 mt-1">
              This order has been cancelled and its status can no longer be changed.
            </p>
          </div>
        ) : (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="flex gap-2">
          {isCancelled ? (
            <button
              onClick={onClose}
              className="flex-1 border rounded py-2 hover:bg-gray-50"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 border rounded py-2 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
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