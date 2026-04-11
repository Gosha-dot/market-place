import { NextResponse } from 'next/server';
import type { Product } from '@/types/product';
import { mockProducts } from '@/lib/mockData';

export async function GET(_request: Request, ctx: { params: { id: string } }) {
  const all = mockProducts as unknown as Product[];
  const product = all.find((p) => p._id === ctx.params.id);

  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json(product);
}

