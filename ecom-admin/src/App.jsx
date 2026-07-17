import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Orders from './pages/Orders';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Products from './pages/Products';
import Banners from './pages/Banners';

const NAV_ITEMS = [
  { path: '/', label: 'Orders' },
  { path: '/categories', label: 'Categories' },
  { path: '/products', label: 'Products' },
  { path: '/settings', label: 'Settings' },
  { path: '/banners', label: 'Banners' },
];

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function NavLinks({ onNavigate }) {
  const location = useLocation();

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            className={`mb-1 flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-brand-pink hover:text-brand-red'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function AdminIdentity({ admin, onSignOut }) {
  return (
    <div className="border-t border-gray-100 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-pink text-sm font-bold text-brand-red">
          {admin.name?.[0]?.toUpperCase() || 'A'}
        </div>
        <p className="min-w-0 truncate text-sm font-semibold text-gray-900">{admin.name}</p>
      </div>
      <button
        onClick={onSignOut}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
      >
        Sign Out
      </button>
    </div>
  );
}

function Sidebar({ admin, onSignOut }) {
  return (
    <aside className="hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="border-b border-gray-100 px-5 py-5">
        <span className="text-xl font-extrabold tracking-tight text-brand-red">JJ Spices</span>
        <p className="text-xs font-medium text-gray-400">Admin</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </nav>

      <AdminIdentity admin={admin} onSignOut={onSignOut} />
    </aside>
  );
}

function MobileTopBar({ onOpenDrawer }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
      <button
        onClick={onOpenDrawer}
        aria-label="Open menu"
        className="rounded-full p-2 text-gray-700 hover:bg-brand-pink"
      >
        <HamburgerIcon />
      </button>
      <span className="text-lg font-extrabold tracking-tight text-brand-red">JJ Spices</span>
      <div className="w-9" />
    </div>
  );
}

function MobileDrawer({ open, onClose, admin, onSignOut }) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 md:hidden ${open ? '' : 'pointer-events-none'}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div
        className={`absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <div>
            <span className="text-xl font-extrabold tracking-tight text-brand-red">JJ Spices</span>
            <p className="text-xs font-medium text-gray-400">Admin</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-2 text-gray-600 hover:bg-brand-pink"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks onNavigate={onClose} />
        </nav>

        <AdminIdentity admin={admin} onSignOut={onSignOut} />
      </div>
    </div>
  );
}

function AdminLayout({ admin, onSignOut, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-cream">
      <Sidebar admin={admin} onSignOut={onSignOut} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        admin={admin}
        onSignOut={onSignOut}
      />
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

  async function handleSignOut() {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setAdmin(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream text-gray-500">
        Loading...
      </div>
    );
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
    <AdminLayout admin={admin} onSignOut={handleSignOut}>
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
