'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2">
        <h1 className="section-title">Create your account</h1>
        <p className="text-sm text-ink-600 dark:text-mist-200">
          Join NovaMart to access daily flash deals and seller rewards.
        </p>
      </div>
      <form
        className="card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const res = auth.register({ name, email, password });
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
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Full name</label>
          <input
            className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
            placeholder="Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Email</label>
          <input
            className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-600 dark:text-mist-200">Password</label>
          <input
            className="w-full rounded-xl border border-mist-200 bg-white px-4 py-3 dark:border-ink-700 dark:bg-ink-800"
            placeholder="Create a password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Create account
        </button>
        <p className="text-xs text-ink-500 dark:text-mist-300">
          By continuing, you agree to our Terms and Privacy Policy.
        </p>
        <p className="text-xs text-ink-500 dark:text-mist-300">
          Already have an account?{' '}
          <Link className="link" href="/auth/login">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

