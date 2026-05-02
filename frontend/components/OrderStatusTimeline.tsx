'use client';

import type { OrderStatus } from '@/types/order';

const STEPS: Array<{ status: OrderStatus; label: string; help: string }> = [
  { status: 'pending', label: 'Order placed', help: 'We received your order.' },
  { status: 'shipped', label: 'Shipped', help: 'Your items are on the way.' },
  { status: 'delivered', label: 'Delivered', help: 'Package delivered.' }
];

function stepIndex(status: OrderStatus) {
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx === -1 ? 0 : idx;
}

export default function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const current = stepIndex(status);

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="font-display text-xl">Tracking</h2>
        <span className="badge badge-muted">{status}</span>
      </div>

      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((s, i) => {
          const isDone = i < current;
          const isCurrent = i === current;

          const circleClass =
            isDone || isCurrent
              ? 'bg-accent-500 text-white'
              : 'bg-mist-100 text-ink-700 dark:bg-ink-700 dark:text-mist-100';
          const titleClass = isCurrent ? 'text-ink-900 dark:text-white' : 'text-ink-700 dark:text-mist-200';
          const helpClass = isCurrent ? 'text-ink-600 dark:text-mist-200' : 'text-ink-500 dark:text-mist-300';

          return (
            <li key={s.status} className="relative">
              {i !== 0 ? (
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-4 hidden h-px w-full -translate-x-1/2 bg-mist-200 sm:block dark:bg-ink-700"
                />
              ) : null}

              <div className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${circleClass}`}>
                  {i + 1}
                </div>
                <div className="space-y-0.5">
                  <div className={`text-sm font-semibold ${titleClass}`}>{s.label}</div>
                  <div className={`text-xs ${helpClass}`}>{s.help}</div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

