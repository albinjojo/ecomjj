import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [result, setResult] = useState({ query: null, products: [] });

  useEffect(() => {
    let cancelled = false;

    searchProducts(q)
      .then((products) => {
        if (!cancelled) setResult({ query: q, products });
      })
      .catch(() => {
        if (!cancelled) setResult({ query: q, products: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [q]);

  const loading = result.query !== q;

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

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : result.products.length === 0 ? (
        <p className="text-sm text-gray-500">No results found for &ldquo;{q}&rdquo;.</p>
      ) : (
        <ProductGrid products={result.products} />
      )}
    </div>
  );
}

export default SearchResults;
