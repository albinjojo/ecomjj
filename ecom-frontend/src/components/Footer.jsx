import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-10 bg-white text-gray-700">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h4 className="mb-3 text-lg font-bold text-brand-red">JJ Stores</h4>
          <p className="text-sm">📞 0800 123 4567</p>
          <p className="text-sm">✉️ support@jjstores.example</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/categories" className="hover:text-brand-red">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/offers" className="hover:text-brand-red">
                Offers
              </Link>
            </li>
            <li>
              <Link to="/featured" className="hover:text-brand-red">
                Featured
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/terms" className="hover:text-brand-red">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-brand-red">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-brand-red">
                Returns
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-4 text-center text-xs text-gray-500">
        Cash on Delivery available · © {new Date().getFullYear()} JJ Stores
      </div>
    </footer>
  );
}

export default Footer;
