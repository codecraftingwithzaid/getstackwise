'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent-v1';

/**
 * GDPR/CCPA cookie consent banner. Required for EU visitors even though the
 * site targets the US primarily. Choice is persisted to localStorage.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      /* localStorage unavailable — fail open, don't block content */
    }
  }, []);

  function decide(choice: 'accepted' | 'rejected') {
    try {
      localStorage.setItem(CONSENT_KEY, choice);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 inset-x-0 z-50 border-t bg-background/95 backdrop-blur p-4"
    >
      <div className="container flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <p className="text-sm text-muted-foreground max-w-2xl">
          We use cookies for analytics and to serve personalized ads via Google
          AdSense and Google Analytics. See our{' '}
          <Link href="/cookie-policy" className="underline">
            Cookie Policy
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => decide('rejected')}
            className="px-4 py-2 text-sm rounded-md border hover:bg-accent"
          >
            Reject
          </button>
          <button
            onClick={() => decide('accepted')}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
