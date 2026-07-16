import { useQuery } from '@tanstack/react-query';
import { getProducts, queryKeys } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function Featured() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.products({ featured: 'true' }),
    queryFn: () => getProducts({ featured: 'true' }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-extrabold text-gray-900">Featured Products</h1>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No featured products — check back soon!</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default Featured;
