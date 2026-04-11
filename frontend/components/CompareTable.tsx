'use client';

import Link from 'next/link';
import type { Product } from '@/types/product';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  return String(value);
}

function uniqueCount(values: string[]) {
  return new Set(values).size;
}

export default function CompareTable({
  products,
  onRemove
}: {
  products: Product[];
  onRemove: (id: string) => void;
}) {
  const { currency } = useCurrency();

  const specKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs ?? {})))
  ).sort((a, b) => a.localeCompare(b));

  const rows: Array<{
    label: string;
    values: (p: Product) => string;
  }> = [
    { label: 'Price', values: (p) => formatCurrency(p.price, currency) },
    { label: 'Discount', values: (p) => `${p.discountPercent}%` },
    { label: 'Brand', values: (p) => p.brand },
    { label: 'Rating', values: (p) => String(p.rating) },
    { label: 'In stock', values: (p) => (p.stockLeft > 0 ? 'Yes' : 'No') },
    ...specKeys.map((key) => ({
      label: key,
      values: (p: Product) => formatValue(p.specs?.[key])
    }))
  ];

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-[720px] w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-mist-200 dark:border-ink-700">
            <th className="p-4 text-left font-semibold text-ink-700 dark:text-mist-200">Feature</th>
            {products.map((p) => (
              <th key={p._id} className="p-4 text-left font-semibold text-ink-700 dark:text-mist-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/products/${p._id}`} className="link block truncate font-semibold">
                      {p.title}
                    </Link>
                    <span className="mt-1 block text-xs text-ink-500 dark:text-mist-300">
                      {p.brand}
                    </span>
                  </div>
                  <button onClick={() => onRemove(p._id)} className="btn btn-ghost px-3 py-1 text-xs">
                    Remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const values = products.map((p) => row.values(p));
            const different = uniqueCount(values) > 1;
            return (
              <tr
                key={row.label}
                className={
                  different
                    ? 'bg-accent-500/10 dark:bg-accent-500/15'
                    : ''
                }
              >
                <td className="p-4 font-medium text-ink-700 dark:text-mist-200">{row.label}</td>
                {values.map((v, idx) => (
                  <td key={`${row.label}-${products[idx]._id}`} className="p-4 text-ink-700 dark:text-mist-200">
                    {v}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

