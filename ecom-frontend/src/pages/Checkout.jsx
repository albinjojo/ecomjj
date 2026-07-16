import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getAddresses, createAddress, deleteAddress, queryKeys } from '../lib/api';
import { getEffectivePrice } from '../lib/pricing';

function emptyAddressForm() {
  return {
    name: '',
    phone: '',
    houseName: '',
    street: '',
    city: '',
    postcode: '',
    landmark: '',
    deliveryNotes: '',
  };
}

function AddressCard({ address, selected, onSelect, onDelete }) {
  return (
    <label
      className={`relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 pr-16 shadow-sm transition-colors ${
        selected ? 'border-brand-red bg-brand-pink/40' : 'border-black/5 bg-white'
      }`}
    >
      <input
        type="radio"
        name="address"
        checked={selected}
        onChange={() => onSelect(address.id)}
        className="mt-1 accent-brand-red"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">{address.name}</p>
          {address.isDefault && (
            <span className="rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white">
              DEFAULT
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-gray-600">
          {address.houseName}, {address.street}, {address.city}, {address.postcode}
        </p>
        {address.landmark && <p className="text-xs text-gray-500">Near {address.landmark}</p>}
        <p className="mt-0.5 text-sm text-gray-600">{address.phone}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(address.id);
        }}
        className="absolute right-3 top-3 text-xs font-semibold text-gray-400 hover:text-brand-red"
      >
        Delete
      </button>
    </label>
  );
}

function AddressForm({ onCreated, onCancel, showCancel }) {
  const [form, setForm] = useState(emptyAddressForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.phone || !form.houseName || !form.street || !form.city || !form.postcode) {
      setError('Please fill in all required fields.');
      return;
    }

    setSaving(true);
    try {
      const data = await createAddress(form);
      onCreated(data.address);
    } catch (err) {
      console.error(err);
      setError('Something went wrong saving this address. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
    >
      {error && <div className="rounded-lg bg-red-50 p-2 text-sm text-brand-red">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="House name / number"
          value={form.houseName}
          onChange={(e) => update('houseName', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Street"
          value={form.street}
          onChange={(e) => update('street', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="City"
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Postcode"
          value={form.postcode}
          onChange={(e) => update('postcode', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Landmark (optional)"
          value={form.landmark}
          onChange={(e) => update('landmark', e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
        />
        <textarea
          placeholder="Delivery notes (optional)"
          value={form.deliveryNotes}
          onChange={(e) => update('deliveryNotes', e.target.value)}
          rows={2}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm sm:col-span-2"
        />
      </div>

      <div className="flex gap-2">
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-brand-red py-2 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save address'}
        </button>
      </div>
    </form>
  );
}

function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [manualShowForm, setManualShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/cart', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const { data, isLoading: addressesLoading } = useQuery({
    queryKey: queryKeys.addresses,
    queryFn: getAddresses,
    enabled: !!user,
  });

  const addresses = data?.addresses || [];

  if (authLoading || !user) {
    return null;
  }

  const showForm = manualShowForm || (!addressesLoading && addresses.length === 0);
  const defaultAddress = addresses.find((a) => a.isDefault) || null;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || defaultAddress;
  const canPlaceOrder = !!selectedAddress && items.length > 0;

  function handleAddressCreated(address) {
    queryClient.setQueryData(queryKeys.addresses, (old) => ({
      addresses: [...(old?.addresses || []), address],
    }));
    setSelectedAddressId(address.id);
    setManualShowForm(false);
  }

  async function handleDeleteAddress(addressId) {
    if (!window.confirm('Delete this address?')) return;

    try {
      await deleteAddress(addressId);
      queryClient.setQueryData(queryKeys.addresses, (old) => ({
        addresses: (old?.addresses || []).filter((a) => a.id !== addressId),
      }));
    } catch (err) {
      console.error(err);
      window.alert('Something went wrong deleting this address. Please try again.');
    }
  }

  function handlePlaceOrder() {
    if (!canPlaceOrder) return;
    console.log('Place order with:', { address: selectedAddress, items });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-xl font-extrabold text-gray-900">Checkout</h1>

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Delivery Address</h2>

          {addressesLoading ? (
            <p className="text-sm text-gray-500">Loading addresses...</p>
          ) : (
            <div className="flex flex-col gap-3">
              {!showForm &&
                addresses.map((address) => (
                  <AddressCard
                    key={address.id}
                    address={address}
                    selected={address.id === selectedAddress?.id}
                    onSelect={setSelectedAddressId}
                    onDelete={handleDeleteAddress}
                  />
                ))}

              {showForm ? (
                <AddressForm
                  onCreated={handleAddressCreated}
                  onCancel={() => setManualShowForm(false)}
                  showCancel={addresses.length > 0}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setManualShowForm(true)}
                  className="self-start text-sm font-semibold text-brand-red hover:underline"
                >
                  + Add new address
                </button>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">Order Review</h2>

          <div className="flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">Your cart is empty.</p>
            ) : (
              <>
                <div className="flex flex-col gap-3">
                  {items.map((item) => {
                    const unitPrice = getEffectivePrice(item);
                    const lineTotal = unitPrice * item.quantity;
                    return (
                      <div
                        key={item.variantId}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900">
                            {item.name} — {item.variantName}
                          </p>
                          <p className="text-gray-500">
                            Qty {item.quantity} × £{unitPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="shrink-0 font-bold text-gray-900">£{lineTotal.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">£{totalPrice.toFixed(2)}</span>
                </div>

                <p className="text-xs text-gray-500">
                  Delivery and any applicable packing charges will be calculated and shown in your
                  order confirmation.
                </p>
              </>
            )}
          </div>
        </section>

        <button
          onClick={handlePlaceOrder}
          disabled={!canPlaceOrder}
          className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
            canPlaceOrder
              ? 'bg-brand-red text-white hover:bg-brand-red-dark'
              : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

export default Checkout;
