export default function Pagination({ page, totalPages, onPage }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        className="btn btn-ghost"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        Prev
      </button>
      <span className="text-sm text-ink-600 dark:text-mist-200">
        Page {page} of {totalPages}
      </span>
      <button
        className="btn btn-ghost"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
}
