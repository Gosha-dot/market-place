export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="section-title">Admin dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-lg">Manage products</h2>
          <p className="text-sm text-ink-600 dark:text-mist-200">Add, edit, or remove listings.</p>
          <button className="btn btn-ghost mt-4">Open catalog</button>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg">Manage users</h2>
          <p className="text-sm text-ink-600 dark:text-mist-200">Review sellers and customer accounts.</p>
          <button className="btn btn-ghost mt-4">Open users</button>
        </div>
      </div>
    </div>
  );
}
