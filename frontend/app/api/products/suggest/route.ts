import { NextResponse } from 'next/server';
import type { Product } from '@/types/product';
import { mockProducts } from '@/lib/mockData';

function normalizeQuery(q: string | null): string {
  return (q || '').trim().toLowerCase();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = normalizeQuery(url.searchParams.get('q'));

  if (!q || q.length < 2) return NextResponse.json({ suggestions: [] });

  const products = mockProducts as unknown as Product[];
  const seen = new Set<string>();
  const suggestions: string[] = [];

  const add = (value: string | undefined) => {
    const normalized = (value || '').trim();
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    if (!key.includes(q)) return;
    seen.add(key);
    suggestions.push(normalized);
  };

  for (const p of products) {
    add(p.title);
    add(p.brand);
    add(p.category);
    if (suggestions.length >= 10) break;
  }

  return NextResponse.json({ suggestions });
}

