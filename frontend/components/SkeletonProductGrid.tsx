export default function SkeletonProductGrid({
  count = 12
}: {
  count?: number;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card overflow-hidden">
          <div className="h-48 w-full animate-pulse bg-mist-100 dark:bg-ink-700" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-5/6 animate-pulse rounded bg-mist-100 dark:bg-ink-700" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-mist-100 dark:bg-ink-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-mist-100 dark:bg-ink-700" />
            <div className="h-9 w-full animate-pulse rounded-full bg-mist-100 dark:bg-ink-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

