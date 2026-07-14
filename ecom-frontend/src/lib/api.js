const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    ...options,
  });

  if (!res.ok) {
    const error = new Error(`Request failed: ${path}`);
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

export const queryKeys = {
  banners: ['banners'],
  categories: ['categories'],
  products: (params = {}) => ['products', params],
  productBySlug: (slug) => ['products', 'detail', slug],
  search: (q) => ['products', 'search', q],
  me: ['auth', 'me'],
};
