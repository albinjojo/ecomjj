import { useEffect, useState } from 'react';
import { getEffectivePrice } from '../lib/pricing';
import { CartContext } from './cart-context';

const STORAGE_KEY = 'jj-stores-cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(variantId) {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }

  function updateQuantity(variantId, quantity) {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)));
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + getEffectivePrice(i) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}
