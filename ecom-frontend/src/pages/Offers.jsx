import { useQuery } from '@tanstack/react-query';
import { getProducts, queryKeys } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function Offers() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.products({ onOffer: 'true' }),
    queryFn: () => getProducts({ onOffer: 'true' }),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-extrabold text-gray-900">Limited Offers</h1>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No current offers — check back soon!</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default Offers;
