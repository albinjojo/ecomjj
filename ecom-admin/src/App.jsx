import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import './App.css';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Banners from './pages/Banners';

function AdminLayout({ admin, children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Orders' },
    { path: '/categories', label: 'Categories' },
    { path: '/settings', label: 'Settings' },
    { path: '/products', label: 'Products' },
    { path: '/banners', label: 'Banners' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <span className="font-bold">JJ Stores Admin</span>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm ${
                location.pathname === item.path ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <span className="text-sm text-gray-500">{admin.name}</span>
      </div>
      {children}
    </div>
  );
}

function App() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/admin/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!admin) {
    return (
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login onLoginSuccess={setAdmin} />} />
      </Routes>
    );
  }

  return (
    <AdminLayout admin={admin}>
      <Routes>
        <Route path="/" element={<Orders />} />
        <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/products" element={<Products />} />
          <Route path="/banners" element={<Banners />} />
      </Routes>
    </AdminLayout>
  );
}

export default App;