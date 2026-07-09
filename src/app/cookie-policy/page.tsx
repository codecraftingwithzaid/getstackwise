import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Cookie Policy',
  description: `How ${siteConfig.name} uses cookies and how you can control them.`,
  path: '/cookie-policy',
});

export default function CookiePolicyPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
        <h1>Cookie Policy</h1>
        <p>
          <em>Last updated: January 1, 2026</em>
        </p>
        <p>
          This Cookie Policy explains what cookies are, how {siteConfig.name}{' '}
          uses them, and how you can manage your preferences. It supplements our
          Privacy Policy.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help the site function, remember your preferences, and
          understand how the site is used. Similar technologies include local
          storage and pixels.
        </p>

        <h2>Types of cookies we use</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Purpose</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Strictly necessary</td>
              <td>Core site functionality and remembering your consent choice.</td>
              <td>Consent preference (local storage)</td>
            </tr>
            <tr>
              <td>Analytics</td>
              <td>Measure traffic and understand content performance.</td>
              <td>Google Analytics 4 (_ga, _gid)</td>
            </tr>
            <tr>
              <td>Advertising</td>
              <td>Serve and measure ads, including personalized ads.</td>
              <td>Google AdSense, DoubleClick</td>
            </tr>
          </tbody>
        </table>

        <h2>Managing cookies</h2>
        <p>
          When you first visit, we present a consent banner where you can accept
          or reject non-essential cookies. You can change your choice at any
          time by clearing the site&apos;s stored data in your browser, which
          will prompt the banner again.
        </p>
        <p>
          You can also control cookies through your browser settings and opt out
          of personalized advertising at{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>{' '}
          and{' '}
          <a
            href="https://www.aboutads.info/choices"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info/choices
          </a>
          .
        </p>

        <h2>Changes</h2>
        <p>
          We may update this Cookie Policy periodically. Please revisit this
          page to stay informed.
        </p>
      </article>
    </div>
  );
}
