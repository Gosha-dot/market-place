'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">Welcome back</h1>
        <p className="text-sm text-ink-600 dark:text-mist-200">
          Sign in to track orders, save wishlists, and unlock member pricing.
        </p>
      </div>
      <form
        className="card space-y-4 p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await auth.login({ email, password });
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setError('');
          router.push('/');
        }}
      >
        {error ? <p className="text-sm text-accent-500">{error}</p> : null}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Email</label>
          <input
            className="input px-4 py-3"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Password</label>
          <input
            className="input px-4 py-3"
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button className="btn btn-primary w-full" type="submit">
          {auth.loading ? 'Signing in...' : 'Login'}
        </button>
        <div className="flex items-center justify-between text-xs text-ink-500 dark:text-mist-300">
          <span>Forgot password?</span>
          <Link className="link" href="/auth/register">
            Create account
          </Link>
        </div>
      </form>
    </div>
  );
}

