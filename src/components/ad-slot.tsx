'use client';

import { useEffect, useRef } from 'react';
import { siteConfig } from '@/config/site';

/**
 * AdSense display slot with reserved height to prevent CLS.
 * Renders nothing when no AdSense client is configured (e.g. before approval).
 */
export function AdSlot({ slotId }: { slotId: string }) {
  const ref = useRef<HTMLModElement>(null);
  const client = siteConfig.adsenseClientId;

  useEffect(() => {
    if (!client) return;
    try {
      // @ts-expect-error - adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ignore push errors during navigation */
    }
  }, [client]);

  if (!client) return null;

  return (
    <ins
      ref={ref}
      className="adsbygoogle ad-slot"
      style={{ display: 'block' }}
      data-ad-client={client}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
