import { Suspense } from 'react';
import ProductsClient from './products-client';

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="card p-6 text-sm text-ink-600 dark:text-mist-200">Loading...</div>}>
      <ProductsClient />
    </Suspense>
  );
}

