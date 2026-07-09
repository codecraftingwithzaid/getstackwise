import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CookieBanner } from '@/components/cookie-banner';
import { GoogleAnalytics, AdSenseScript } from '@/components/analytics';
import { JsonLd } from '@/components/json-ld';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo';

// Self-hosted via next/font — no render-blocking font request.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Developer Tools, SaaS & AI Reviews`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  publisher: siteConfig.publisher.name,
  formatDetection: { telephone: false },
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/' },
  },
  verification: siteConfig.gscVerification
    ? { google: siteConfig.gscVerification }
    : undefined,
  robots: { index: true, follow: true },
  // Favicon (icon.svg) and Apple touch icon are emitted automatically from the
  // app/icon.svg and app/apple-icon.svg file conventions.
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} — Developer Tools, SaaS & AI Reviews`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.social.twitter,
    title: `${siteConfig.name} — Developer Tools, SaaS & AI Reviews`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US" className={inter.variable} suppressHydrationWarning>
      <head>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieBanner />
        <GoogleAnalytics />
        <AdSenseScript />
      </body>
    </html>
  );
}
