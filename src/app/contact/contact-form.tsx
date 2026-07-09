'use client';

import { useState } from 'react';

export function ContactForm() {
  const [state, setState] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('loading');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setState('ok');
        form.reset();
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>
      {/* Honeypot for basic spam filtering */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {state === 'loading' ? 'Sending…' : 'Send message'}
      </button>
      {state === 'ok' && (
        <p className="text-sm text-green-600">
          Thanks — we&apos;ll get back to you soon.
        </p>
      )}
      {state === 'error' && (
        <p className="text-sm text-red-600">
          Something went wrong. Please email us directly instead.
        </p>
      )}
    </form>
  );
}
