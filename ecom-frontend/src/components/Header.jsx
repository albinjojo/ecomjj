import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { getCategories } from '../lib/api';
import GoogleSignInButton from './GoogleSignInButton';

function CategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-brand-pink"
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
    return <GoogleSignInButton onSignedIn={setUser} />;
  }

  const firstName = user.name?.split(' ')[0] || 'Account';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-full bg-brand-pink px-3 py-1.5 text-sm font-semibold text-brand-red"
      >
        Hi, {firstName}
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
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

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="scrollbar-none overflow-x-auto whitespace-nowrap bg-brand-red px-4 py-1.5 text-xs font-medium text-white">
        <span className="mr-6">📞 Support: 0800 123 4567</span>
        <span>Trusted. Quality. Fast Delivery.</span>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link to="/" className="shrink-0 text-2xl font-extrabold tracking-tight text-brand-red">
          JJ Stores
        </Link>

        <form onSubmit={handleSearch} className="order-3 flex w-full min-w-0 flex-1 sm:order-none">
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

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <Link to="/cart" className="flex items-center gap-2 rounded-full px-3 py-1.5 hover:bg-brand-pink">
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
            <span className="text-sm font-semibold text-gray-800">
              {totalItems} · £{totalPrice.toFixed(2)}
            </span>
          </Link>

          <AccountMenu />
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center gap-2 px-4 pb-3">
        <CategoriesDropdown />
        <Link
          to="/offers"
          className="rounded-full bg-brand-red px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-red-dark"
        >
          Offers
        </Link>
        <Link
          to="/featured"
          className="rounded-full px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-brand-pink"
        >
          Featured
        </Link>
      </nav>
    </header>
  );
}

export default Header;
