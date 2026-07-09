import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} collects, uses, and protects your data, including cookies, Google AdSense, and Google Analytics.`,
  path: '/privacy-policy',
});

const EFFECTIVE = 'January 1, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: {EFFECTIVE}</em>
        </p>
        <p>
          This Privacy Policy describes how {siteConfig.name} (&quot;we,&quot;
          &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
          information when you visit {siteConfig.url}. By using this site, you
          agree to the practices described here.
        </p>

        <h2>Information we collect</h2>
        <h3>Information you provide</h3>
        <ul>
          <li>
            Email address, when you subscribe to our newsletter or contact us.
          </li>
          <li>
            Any content you include in a message sent through our contact form.
          </li>
        </ul>
        <h3>Information collected automatically</h3>
        <p>
          When you visit the site, we and our third-party providers may
          automatically collect: your IP address, browser type, device
          information, pages visited, referring URLs, and interaction data. This
          is collected through cookies and similar technologies.
        </p>

        <h2>Cookies and advertising</h2>
        <p>
          We use cookies to operate the site, understand traffic, and serve
          advertising. Specifically:
        </p>
        <ul>
          <li>
            <strong>Google Analytics 4</strong> — we use GA4 to understand how
            visitors use the site. GA4 sets cookies that collect usage data in
            an aggregated and, where configured, IP-anonymized form.
          </li>
          <li>
            <strong>Google AdSense</strong> — we display ads served by Google
            and its partners. Google uses cookies (including the DoubleClick
            cookie) to serve ads based on your prior visits to this and other
            websites. Third-party vendors, including Google, use cookies to
            serve ads based on a user&apos;s prior visits.
          </li>
        </ul>
        <p>
          You may opt out of personalized advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          . You can also opt out of third-party vendor cookies at{' '}
          <a
            href="https://www.aboutads.info"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>
          . For more information, see Google&apos;s{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            partner sites policy
          </a>
          .
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>To operate, maintain, and improve the site.</li>
          <li>To send newsletters you have requested.</li>
          <li>To respond to your inquiries.</li>
          <li>To measure traffic and content performance.</li>
          <li>To serve and measure advertising.</li>
        </ul>

        <h2>Your rights (GDPR)</h2>
        <p>
          If you are in the European Economic Area or the UK, you have the right
          to access, correct, delete, restrict, or object to our processing of
          your personal data, and the right to data portability. You may also
          withdraw consent for cookie-based processing at any time using our
          cookie banner. To exercise these rights, contact us via the details
          below.
        </p>

        <h2>Your rights (CCPA/CPRA)</h2>
        <p>
          If you are a California resident, you have the right to know what
          personal information we collect, to request deletion, to opt out of
          the &quot;sale&quot; or &quot;sharing&quot; of personal information
          (which, under California law, can include the use of advertising
          cookies), and not to be discriminated against for exercising these
          rights. We do not sell personal information for money. To opt out of
          interest-based advertising, use the cookie controls described above.
        </p>

        <h2>Data retention</h2>
        <p>
          We retain personal information only as long as necessary for the
          purposes described in this policy or as required by law. Analytics
          data is retained according to our Google Analytics configuration.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          This site is not directed to children under 13, and we do not
          knowingly collect personal information from children under 13.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated effective date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Email{' '}
          <a href="mailto:privacy@getstackwise.tech">privacy@getstackwise.tech</a>{' '}
          or use our contact page.
        </p>
      </article>
    </div>
  );
}
