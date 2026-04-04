export default function Rating({ value = 0 }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1 text-xs text-amber-500">
      {stars.map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={star <= Math.round(value) ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m12 3.5 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2-4.6-4.4 6.3-.9L12 3.5Z" />
        </svg>
      ))}
      <span className="ml-2 text-[11px] text-ink-500 dark:text-mist-300">{value.toFixed(1)}</span>
    </div>
  );
}
