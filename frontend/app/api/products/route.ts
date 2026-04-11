import { NextResponse } from 'next/server';
import type { Product, ProductsListResponse } from '@/types/product';
import { buildMongoQuery, filterAndSortProducts, parseProductsQuery } from '@/services/productQuery';
import { mockProducts } from '@/lib/mockData';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = parseProductsQuery(url.searchParams);

  const all = mockProducts as unknown as Product[];
  const { mongoQuery, mongoSort } = buildMongoQuery(parsed);

  const filtered = filterAndSortProducts(all, parsed);
  const total = filtered.length;

  // When fetching a compare list by ids, returning the full set is usually what you want.
  const shouldPaginate = !parsed.ids?.length;
  const start = shouldPaginate ? (parsed.page - 1) * parsed.limit : 0;
  const end = shouldPaginate ? start + parsed.limit : filtered.length;
  const items = filtered.slice(start, end);

  const payload: ProductsListResponse = {
    items,
    total,
    page: parsed.page,
    limit: parsed.limit,
    mongoQuery,
    mongoSort
  };

  return NextResponse.json(payload);
}

