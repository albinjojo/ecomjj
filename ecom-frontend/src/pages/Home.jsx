import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBanners, getCategories, getProducts, getImageUrl } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function BannerCarousel() {
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getBanners()
      .then((data) => setBanners(data.banners || []))
      .catch(() => setBanners([]));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) return null;

  return (
    <div
      onClick={() => navigate('/offers')}
      className="relative aspect-[16/6] w-full cursor-pointer overflow-hidden rounded-2xl bg-brand-pink sm:aspect-[16/5]"
    >
      {banners.map((banner, i) => (
        <img
          key={banner.id}
          src={getImageUrl(banner.imageUrl)}
          alt={banner.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((banner, i) => (
            <span
              key={banner.id}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryStrip() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="scrollbar-none flex gap-5 overflow-x-auto pb-1">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${cat.slug}`}
          className="flex shrink-0 flex-col items-center gap-2 text-center"
        >
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-brand-pink bg-brand-pink sm:h-24 sm:w-24">
            {cat.imageUrl ? (
              <img src={getImageUrl(cat.imageUrl)} alt={cat.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-brand-red">
                {cat.name[0]}
              </div>
            )}
          </div>
          <span className="w-20 truncate text-xs font-semibold text-gray-800 sm:w-24">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}

function Section({ title, viewAllHref, products }) {
  if (products.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
        <Link to={viewAllHref} className="text-sm font-semibold text-brand-red hover:underline">
          View all →
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

const TRUST_ITEMS = [
  { icon: '💷', title: 'Cash on Delivery', text: 'Pay in cash when your order arrives.' },
  { icon: '🚚', title: 'Local Delivery', text: 'Fast delivery across our local area.' },
  { icon: '❄️', title: 'Fresh & Frozen Quality', text: 'Carefully stored and quality checked.' },
];

function TrustRow() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TRUST_ITEMS.map((item) => (
        <div key={item.title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="text-3xl">{item.icon}</span>
          <div>
            <p className="font-bold text-gray-900">{item.title}</p>
            <p className="text-sm text-gray-500">{item.text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function Home() {
  const [offerProducts, setOfferProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    getProducts({ onOffer: 'true' })
      .then(setOfferProducts)
      .catch(() => setOfferProducts([]));
    getProducts({ featured: 'true' })
      .then(setFeaturedProducts)
      .catch(() => setFeaturedProducts([]));
    getProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]));
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-6">
      <BannerCarousel />
      <CategoryStrip />
      <Section title="Limited Offers" viewAllHref="/offers" products={offerProducts} />
      <Section title="Featured Products" viewAllHref="/featured" products={featuredProducts} />
      <Section title="All Products" viewAllHref="/products" products={allProducts.slice(0, 12)} />
      <TrustRow />
    </div>
  );
}

export default Home;
