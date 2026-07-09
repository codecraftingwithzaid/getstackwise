import Script from 'next/script';
import { siteConfig } from '@/config/site';

/** Google Analytics 4 — loaded after interactive so it never blocks LCP. */
export function GoogleAnalytics() {
  const id = siteConfig.gaMeasurementId;
  if (!id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}

/** Google AdSense loader — afterInteractive so it doesn't block content paint. */
export function AdSenseScript() {
  const client = siteConfig.adsenseClientId;
  if (!client) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
