import { notFound } from 'next/navigation';
import { mockProducts } from '@/lib/mockData';
import type { Product } from '@/types/product';
import { fetchProduct } from '@/lib/api';
import ProductClient from './product-client';

export default async function ProductPage({ params }: { params: { id: string } }) {
  let product: Product | undefined;
  try {
    product = await fetchProduct(params.id);
  } catch {
    product = (mockProducts as Product[]).find((p) => p._id === params.id);
  }

  if (!product) notFound();
  return <ProductClient product={product} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const product = await fetchProduct(params.id);
    return { title: product.title, description: product.description };
  } catch {
    const product = (mockProducts as Product[]).find((p) => p._id === params.id);
    if (!product) return { title: 'Product not found' };
    return { title: product.title, description: product.description };
  }
}
