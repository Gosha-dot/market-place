'use client';

import ProductList from '@/components/ProductList';

export default function ProductGrid({ products, layout = 'grid' }) {
  return <ProductList products={products} layout={layout} />;
}
