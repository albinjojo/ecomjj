const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed: ${path}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // response body wasn't JSON; fall back to the generic message
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/products${query ? `?${query}` : ''}`);
}

export function searchProducts(q) {
  return request(`/products/search?q=${encodeURIComponent(q)}`);
}

export function getProductBySlug(slug) {
  return request(`/products/${encodeURIComponent(slug)}`);
}

export function getCategories() {
  return request('/categories');
}

export function getBanners() {
  return request('/banners');
}

export function getMe() {
  return request('/auth/me');
}

export function googleSignIn(credential) {
  return request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function getImageUrl(path) {
  if (!path) return null;
  return path;
}

export function getAddresses() {
  return request('/addresses');
}

export function createAddress(data) {
  return request('/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteAddress(id) {
  return request(`/addresses/${id}`, { method: 'DELETE' });
}

export function createOrder(data) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getOrders() {
  return request('/orders');
}

export function cancelOrder(orderId) {
  return request(`/orders/${orderId}/cancel`, { method: 'POST' });
}

export const queryKeys = {
  banners: ['banners'],
  categories: ['categories'],
  products: (params = {}) => ['products', params],
  productBySlug: (slug) => ['products', 'detail', slug],
  search: (q) => ['products', 'search', q],
  me: ['auth', 'me'],
  addresses: ['addresses'],
  orders: ['orders'],
};
