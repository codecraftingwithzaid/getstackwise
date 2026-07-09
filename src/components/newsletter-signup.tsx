'use client';

import { useState } from 'react';

/**
 * Newsletter signup. Posts to /api/newsletter (wire to your ESP).
 * Progressive enhancement: shows success/error inline without a page reload.
 */
export function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? 'ok' : 'error');
      if (res.ok) setEmail('');
    } catch {
      setState('error');
    }
  }

  return (
    <div className={compact ? '' : 'rounded-lg border bg-card p-6'}>
      {!compact && (
        <>
          <h3 className="font-semibold text-lg">Get the weekly signal</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            One email a week: the developer tools and AI releases worth your time.
            No spam.
          </p>
        </>
      )}
      <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {state === 'loading' ? 'Joining…' : 'Subscribe'}
        </button>
      </form>
      {state === 'ok' && (
        <p className="mt-2 text-sm text-green-600">You&apos;re in. Check your inbox.</p>
      )}
      {state === 'error' && (
        <p className="mt-2 text-sm text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
