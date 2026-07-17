import { useState, useEffect } from 'react';
import OrderDetailModal from '../components/OrderDetailModal';

const STATUS_TABS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/orders?${params}`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function handleOrderUpdated(updatedOrder) {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
  }

  const counts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const visibleOrders = orders.filter((o) => o.orderStatus === statusFilter);

  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900">Orders</h1>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Search by order #, name, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/20"
        />
        <button
          onClick={fetchOrders}
          className="rounded-lg bg-brand-red px-4 py-2 font-semibold text-white transition-colors hover:bg-brand-red-dark"
        >
          Search
        </button>
      </div>

      <div className="scrollbar-none mb-6 flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const count = counts[tab.value] || 0;
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? 'bg-brand-red text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-brand-pink hover:text-brand-red'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : visibleOrders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full rounded-xl border border-gray-200 bg-white p-4 text-left shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 truncate text-sm text-gray-700">{order.address?.name} — {order.address?.phone}</p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-lg font-bold text-gray-900">£{order.grandTotal}</p>
                  <span className="mt-1 inline-block rounded-full bg-brand-pink px-2 py-0.5 text-xs font-semibold text-brand-red">
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}

export default Orders;
