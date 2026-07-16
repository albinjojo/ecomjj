import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Offers from './pages/Offers';
import Featured from './pages/Featured';
import AllProducts from './pages/AllProducts';
import CategoryProducts from './pages/CategoryProducts';
import ComingSoon from './pages/ComingSoon';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/featured" element={<Featured />} />
          <Route path="/products" element={<AllProducts />} />
          <Route path="/category/:slug" element={<CategoryProducts />} />
          <Route path="*" element={<ComingSoon />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
