import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { getBanners, getCategories, getProducts, getImageUrl, queryKeys } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function BannerArrow({ direction, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous banner' : 'Next banner'}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white ${
        direction === 'prev' ? 'left-3' : 'right-3'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {direction === 'prev' ? (
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function BannerCarousel() {
  const { data } = useQuery({
    queryKey: queryKeys.banners,
    queryFn: () => getBanners(),
  });
  const banners = data?.banners || [];

  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  function goToPrev() {
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  }

  function goToNext() {
    setIndex((i) => (i + 1) % banners.length);
  }

  return (
    <div className="relative aspect-[16/6] w-full overflow-hidden bg-brand-pink sm:aspect-[16/5]">
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => navigate('/offers')}
            className="h-full w-full shrink-0 cursor-pointer"
          >
            <img
              src={getImageUrl(banner.imageUrl)}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <BannerArrow direction="prev" onClick={goToPrev} />
          <BannerArrow direction="next" onClick={goToNext} />

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((banner, i) => (
              <span
                key={banner.id}
                className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CategoryStrip() {
  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(),
  });

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
  const { data: offerProducts = [] } = useQuery({
    queryKey: queryKeys.products({ onOffer: 'true' }),
    queryFn: () => getProducts({ onOffer: 'true' }),
  });
  const { data: featuredProducts = [] } = useQuery({
    queryKey: queryKeys.products({ featured: 'true' }),
    queryFn: () => getProducts({ featured: 'true' }),
  });
  const { data: allProducts = [] } = useQuery({
    queryKey: queryKeys.products({}),
    queryFn: () => getProducts(),
  });

  return (
    <div className="flex flex-col gap-10 py-6">
      <BannerCarousel />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4">
        <CategoryStrip />
        <Section title="Limited Offers" viewAllHref="/offers" products={offerProducts} />
        <Section title="Featured Products" viewAllHref="/featured" products={featuredProducts} />
        <Section title="All Products" viewAllHref="/products" products={allProducts.slice(0, 12)} />
        <TrustRow />
      </div>
    </div>
  );
}

export default Home;
