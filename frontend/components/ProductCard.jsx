import Link from 'next/link';
import Rating from '@/components/ui/Rating';
import { useCurrency } from '@/components/CurrencyProvider';
import { formatCurrency } from '@/lib/currency';

export default function ProductCard({ product, onAdd }) {
  const { currency } = useCurrency();
  const discounted = product.price * (1 - product.discountPercent / 100);

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.title}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-semibold text-white">
          -{product.discountPercent}%
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/products/${product._id}`} className="font-semibold text-ink-900 dark:text-mist-100">
          {product.title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-ink-900 dark:text-white">
            {formatCurrency(discounted, currency)}
          </span>
          <span className="text-xs text-ink-500 line-through dark:text-mist-300">
            {formatCurrency(product.price, currency)}
          </span>
        </div>
        <Rating value={product.rating} />
        <div className="mt-auto flex items-center justify-between text-xs text-ink-500 dark:text-mist-300">
          <span>Seller: {product.seller?.name}</span>
          <span>Only {product.stockLeft} left</span>
        </div>
        <button onClick={() => onAdd?.(product)} className="btn btn-primary mt-3 w-full">
          Add to cart
        </button>
      </div>
    </div>
  );
}
