export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">Create your account</h1>
        <p className="text-sm text-ink-600 dark:text-mist-200">
          Join NovaMart to access daily flash deals and seller rewards.
        </p>
      </div>
      <div className="card space-y-4 p-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Full name</label>
          <input className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Alex Morgan" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Email</label>
          <input className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="you@email.com" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Password</label>
          <input className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800" placeholder="Create a password" type="password" />
        </div>
        <button className="btn btn-primary w-full">Create account</button>
        <p className="text-xs text-ink-500 dark:text-mist-300">By continuing, you agree to our Terms and Privacy Policy.</p>
      </div>
    </div>
  );
}
