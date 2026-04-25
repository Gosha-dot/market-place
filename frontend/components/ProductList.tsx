'use client';

import { memo } from 'react';
import type { Product } from '@/types/product';
import ProductCard from '@/components/ProductCard';

type Props = {
  products: Product[];
  layout?: 'grid' | 'list';
};

function ProductList({ products, layout = 'grid' }: Props) {
  const isList = layout === 'list';

  return (
    <div className={isList ? 'grid grid-cols-1 gap-4' : 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} layout={layout} />
      ))}
    </div>
  );
}

export default memo(ProductList);

