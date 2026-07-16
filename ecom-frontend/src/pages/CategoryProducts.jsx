import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getCategories, getProducts, queryKeys } from '../lib/api';
import ProductGrid from '../components/ProductGrid';

function CategoryProducts() {
  const { slug } = useParams();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => getCategories(),
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: queryKeys.products({}),
    queryFn: () => getProducts(),
  });

  const isLoading = categoriesLoading || productsLoading;
  const category = categories.find((c) => c.slug === slug) || null;
  const products = category ? allProducts.filter((p) => p.category?.slug === slug) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : !category ? (
        <>
          <h1 className="mb-4 text-xl font-extrabold text-gray-900">Category not found</h1>
          <p className="text-sm text-gray-500">We couldn&rsquo;t find that category.</p>
        </>
      ) : (
        <>
          <h1 className="mb-4 text-xl font-extrabold text-gray-900">{category.name}</h1>
          {products.length === 0 ? (
            <p className="text-sm text-gray-500">No products in this category yet — check back soon!</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </>
      )}
    </div>
  );
}

export default CategoryProducts;
