import type { Product, ProductSort } from '@/types/product';

export interface ParsedProductsQuery {
  ids?: string[];
  page: number;
  limit: number;
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  brand?: string[];
  hasDiscount?: boolean;
  discountPercent?: number;
  inStock?: boolean;
  sort: ProductSort;
}

function parseNumber(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseBoolean(raw: string | null): boolean | undefined {
  if (raw === null) return undefined;
  if (raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return undefined;
}

function parseCommaList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const items = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : undefined;
}

export function parseProductsQuery(searchParams: URLSearchParams): ParsedProductsQuery {
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '16', 10) || 16));

  const ids = parseCommaList(searchParams.get('ids'));

  const q = (searchParams.get('q') || '').trim() || undefined;
  const category = searchParams.get('category') || undefined;
  const minPrice = parseNumber(searchParams.get('minPrice'));
  const maxPrice = parseNumber(searchParams.get('maxPrice'));

  const minRating =
    parseNumber(searchParams.get('minRating')) ?? parseNumber(searchParams.get('rating'));

  const brandFromCsv = parseCommaList(searchParams.get('brand'));
  const brandRepeated = searchParams.getAll('brand').flatMap((v) => parseCommaList(v) ?? []);
  const brand = (brandRepeated.length ? brandRepeated : brandFromCsv)?.filter(Boolean);

  const hasDiscount = parseBoolean(searchParams.get('hasDiscount'));
  const discountPercent = parseNumber(searchParams.get('discountPercent'));
  const inStock = parseBoolean(searchParams.get('inStock'));

  const sortRaw = (searchParams.get('sort') || 'newest') as ProductSort;
  const sort: ProductSort =
    sortRaw === 'price_asc' ||
    sortRaw === 'price_desc' ||
    sortRaw === 'rating_desc' ||
    sortRaw === 'newest'
      ? sortRaw
      : 'newest';

  return {
    ids,
    page,
    limit,
    q,
    category,
    minPrice,
    maxPrice,
    minRating,
    brand,
    hasDiscount,
    discountPercent,
    inStock,
    sort
  };
}

export function buildMongoQuery(parsed: ParsedProductsQuery): {
  mongoQuery: Record<string, unknown>;
  mongoSort: Record<string, 1 | -1>;
} {
  const mongoQuery: Record<string, unknown> = {};

  if (parsed.ids?.length) mongoQuery._id = { $in: parsed.ids };
  if (parsed.category) mongoQuery.category = parsed.category;
  if (parsed.q) {
    mongoQuery.$or = [
      { title: { $regex: parsed.q, $options: 'i' } },
      { brand: { $regex: parsed.q, $options: 'i' } },
      { category: { $regex: parsed.q, $options: 'i' } },
      { description: { $regex: parsed.q, $options: 'i' } }
    ];
  }

  if (parsed.minPrice !== undefined || parsed.maxPrice !== undefined) {
    mongoQuery.price = {
      ...(parsed.minPrice !== undefined ? { $gte: parsed.minPrice } : null),
      ...(parsed.maxPrice !== undefined ? { $lte: parsed.maxPrice } : null)
    };
  }

  if (parsed.minRating !== undefined) mongoQuery.rating = { $gte: parsed.minRating };
  if (parsed.brand?.length) mongoQuery.brand = { $in: parsed.brand };

  if (parsed.hasDiscount === true) mongoQuery.discountPercent = { $gt: 0 };
  if (parsed.discountPercent !== undefined) mongoQuery.discountPercent = { $gte: parsed.discountPercent };

  if (parsed.inStock === true) mongoQuery.stockLeft = { $gt: 0 };
  if (parsed.inStock === false) mongoQuery.stockLeft = { $lte: 0 };

  const mongoSort: Record<string, 1 | -1> =
    parsed.sort === 'price_asc'
      ? { price: 1 }
      : parsed.sort === 'price_desc'
        ? { price: -1 }
        : parsed.sort === 'rating_desc'
          ? { rating: -1 }
          : { createdAt: -1 };

  return { mongoQuery, mongoSort };
}

function compareBySort(a: Product, b: Product, sort: ProductSort): number {
  if (sort === 'price_asc') return a.price - b.price;
  if (sort === 'price_desc') return b.price - a.price;
  if (sort === 'rating_desc') return b.rating - a.rating;
  // newest
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export function filterAndSortProducts(products: Product[], parsed: ParsedProductsQuery): Product[] {
  const q = parsed.q?.trim().toLowerCase();
  const qWords = q ? q.split(/\s+/).filter(Boolean) : [];

  const filtered = products.filter((p) => {
    if (parsed.ids?.length && !parsed.ids.includes(p._id)) return false;
    if (qWords.length) {
      const haystack = `${p.title} ${p.brand} ${p.category} ${p.description ?? ''}`.toLowerCase();
      for (const word of qWords) {
        if (!haystack.includes(word)) return false;
      }
    }
    if (parsed.category && p.category !== parsed.category) return false;
    if (parsed.minPrice !== undefined && p.price < parsed.minPrice) return false;
    if (parsed.maxPrice !== undefined && p.price > parsed.maxPrice) return false;
    if (parsed.minRating !== undefined && p.rating < parsed.minRating) return false;
    if (parsed.brand?.length && !parsed.brand.includes(p.brand)) return false;
    if (parsed.hasDiscount === true && p.discountPercent <= 0) return false;
    if (parsed.discountPercent !== undefined && p.discountPercent < parsed.discountPercent) return false;
    if (parsed.inStock === true && p.stockLeft <= 0) return false;
    if (parsed.inStock === false && p.stockLeft > 0) return false;
    return true;
  });

  return filtered.sort((a, b) => compareBySort(a, b, parsed.sort));
}
