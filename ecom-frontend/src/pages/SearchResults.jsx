import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { searchProducts, queryKeys } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const { data: products = [], isLoading } = useQuery({
    queryKey: queryKeys.search(q),
    queryFn: () => searchProducts(q),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-xl font-extrabold text-gray-900">
        {q ? (
          <>
            Search results for <span className="text-brand-red">&ldquo;{q}&rdquo;</span>
          </>
        ) : (
          'Search'
        )}
      </h1>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-500">No results found for &ldquo;{q}&rdquo;.</p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default SearchResults;
