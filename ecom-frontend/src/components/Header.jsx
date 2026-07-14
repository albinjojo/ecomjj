import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getCategories, queryKeys } from '../lib/api';
import GoogleSignInButton from './GoogleSignInButton';

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
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

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.05L2 22l5.05-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm5.2 14.2c-.22.62-1.28 1.18-1.77 1.24-.45.06-.96.09-1.55-.1-.36-.11-.82-.26-1.4-.5-2.47-1.07-4.08-3.58-4.2-3.75-.12-.16-1-1.33-1-2.54 0-1.21.63-1.8.86-2.05.22-.24.48-.3.64-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.2.49.68 1.68.74 1.8.06.12.1.27.02.43-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.49.14.24.62 1.02 1.33 1.65.91.81 1.68 1.06 1.92 1.18.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.16 1.2z" />
    </svg>
  );
}

const WHATSAPP_NUMBER = '44800123456'; // placeholder UK number — replace with the real business number

function MobileDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(),
  });

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

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
          <span className="text-xl font-extrabold tracking-tight text-brand-red">JJ Stores</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-full p-2 text-gray-600 hover:bg-brand-pink"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 border-b border-gray-100 px-4 py-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products..."
            className="min-w-0 flex-1 rounded-full border border-gray-200 bg-brand-cream px-4 py-2 text-sm focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
          >
            Go
          </button>
        </form>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
          <div>
            <button
              onClick={() => setCategoriesOpen((o) => !o)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-brand-pink"
            >
              Shop by Categories
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
              >
                <path
                  d="M5 8l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {categoriesOpen && (
              <div className="flex flex-col pl-4">
                {categories.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">No categories</p>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={onClose}
                      className="rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-brand-pink hover:text-brand-red"
                    >
                      {cat.name}
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <Link
            to="/offers"
            onClick={onClose}
            className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-brand-pink"
          >
            Offers
          </Link>
          <Link
            to="/featured"
            onClick={onClose}
            className="rounded-lg px-3 py-3 text-sm font-semibold text-gray-800 hover:bg-brand-pink"
          >
            Featured
          </Link>
        </nav>

        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="m-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:bg-[#20b858]"
        >
          <WhatsAppIcon />
          Chat with us
        </a>
      </div>
    </div>
  );
}

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(),
  });

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-brand-pink"
      >
        Shop by Categories
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 max-h-80 w-56 overflow-y-auto rounded-xl border border-black/5 bg-white py-2 shadow-lg">
          {categories.length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-400">No categories</p>
          ) : (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-pink hover:text-brand-red"
              >
                {cat.name}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { user, setUser, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <>
        <div className="md:hidden">
          <GoogleSignInButton onSignedIn={setUser} compact />
        </div>
        <div className="hidden md:block">
          <GoogleSignInButton onSignedIn={setUser} />
        </div>
      </>
    );
  }

  const firstName = user.name?.split(' ')[0] || 'Account';
  const initial = firstName[0]?.toUpperCase() || 'A';

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pink text-sm font-bold text-brand-red md:h-auto md:w-auto md:gap-1 md:rounded-full md:px-3 md:py-1.5 md:font-semibold"
      >
        <span className="md:hidden">{initial}</span>
        <span className="hidden md:inline">Hi, {firstName}</span>
        <svg className="hidden md:block" width="14" height="14" viewBox="0 0 20 20" fill="none">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-40 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-lg">
          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-pink hover:text-brand-red"
          >
            My Orders
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
              navigate('/');
            }}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-brand-pink hover:text-brand-red"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Header() {
  const navigate = useNavigate();
  const { totalItems, totalPrice } = useCart();
  const [query, setQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      setMobileSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="scrollbar-none overflow-x-auto whitespace-nowrap bg-brand-red px-4 py-1.5 text-xs font-medium text-white">
        <span className="mr-6">📞 Support: 0800 123 4567</span>
        <span>Trusted. Quality. Fast Delivery.</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:gap-3">
        {mobileSearchOpen ? (
          <form onSubmit={handleSearch} className="flex w-full items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              aria-label="Close search"
              className="shrink-0 rounded-full p-2 text-gray-600 hover:bg-brand-pink"
            >
              <CloseIcon />
            </button>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-brand-cream px-4 py-2 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
            >
              Go
            </button>
          </form>
        ) : (
          <>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="shrink-0 rounded-full p-2 text-gray-700 hover:bg-brand-pink md:hidden"
            >
              <HamburgerIcon />
            </button>

            <Link to="/" className="shrink-0 text-xl font-extrabold tracking-tight text-brand-red md:text-2xl">
              JJ Stores
            </Link>

            <form onSubmit={handleSearch} className="hidden min-w-0 flex-1 md:flex">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full min-w-0 rounded-l-full border border-r-0 border-gray-200 bg-brand-cream px-4 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-r-full bg-brand-red px-5 py-2 text-sm font-semibold text-white hover:bg-brand-red-dark"
              >
                Search
              </button>
            </form>

            <button
              onClick={() => setMobileSearchOpen(true)}
              aria-label="Search"
              className="ml-auto shrink-0 rounded-full p-2 text-gray-700 hover:bg-brand-pink md:hidden"
            >
              <SearchIcon />
            </button>

            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex shrink-0 items-center gap-2 rounded-full p-2 hover:bg-brand-pink md:px-3 md:py-1.5"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 4h2l2.4 12.2A2 2 0 0 0 9.36 18h7.28a2 2 0 0 0 1.96-1.6L20 8H6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9.5" cy="21" r="1.4" fill="currentColor" />
                <circle cx="17" cy="21" r="1.4" fill="currentColor" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold leading-none text-white md:hidden">
                  {totalItems}
                </span>
              )}
              <span className="hidden text-sm font-semibold text-gray-800 md:inline">
                {totalItems} · £{totalPrice.toFixed(2)}
              </span>
            </Link>

            <AccountMenu />
          </>
        )}
      </div>

      <nav className="scrollbar-none mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-3">
        <CategoriesDropdown />
        <Link
          to="/offers"
          className="shrink-0 rounded-full bg-brand-red px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          Offers
        </Link>
        <Link
          to="/featured"
          className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-brand-pink"
        >
          Featured
        </Link>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </header>
  );
}

export default Header;
