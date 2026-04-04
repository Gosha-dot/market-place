export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">Welcome back</h1>
        <p className="text-sm text-ink-600 dark:text-mist-200">
          Sign in to track orders, save wishlists, and unlock member pricing.
        </p>
      </div>
      <div className="card space-y-4 p-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Email</label>
          <input
            className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
            placeholder="you@email.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Password</label>
          <input
            className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
            placeholder="••••••••"
            type="password"
          />
        </div>
        <button className="btn btn-primary w-full">Login</button>
        <button className="btn btn-ghost w-full">Continue with Google</button>
        <div className="flex items-center justify-between text-xs text-ink-500 dark:text-mist-300">
          <span>Forgot password?</span>
          <span>Create account</span>
        </div>
      </div>
    </div>
  );
}
