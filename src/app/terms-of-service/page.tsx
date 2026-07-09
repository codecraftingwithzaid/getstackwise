import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: `The terms governing your use of ${siteConfig.name}.`,
  path: '/terms-of-service',
});

export default function TermsPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
        <h1>Terms of Service</h1>
        <p>
          <em>Last updated: January 1, 2026</em>
        </p>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your access to and
          use of {siteConfig.name} (the &quot;Site&quot;). By accessing or using
          the Site, you agree to be bound by these Terms.
        </p>

        <h2>Use of the site</h2>
        <p>
          You may use the Site for lawful, personal, and non-commercial
          purposes. You agree not to misuse the Site, including by attempting to
          gain unauthorized access, scraping content at scale without
          permission, or interfering with its normal operation.
        </p>

        <h2>Intellectual property</h2>
        <p>
          All content on the Site, including articles, graphics, and logos, is
          owned by {siteConfig.name} or its licensors and is protected by
          copyright and other laws. You may share links to our content and quote
          brief excerpts with attribution, but you may not republish full
          articles without written permission.
        </p>

        <h2>Editorial content and accuracy</h2>
        <p>
          Our content is produced with AI assistance and editorial review, as
          described in our editorial policy. We strive for accuracy, but
          technical details such as pricing, version numbers, and feature sets
          change frequently. Content is provided &quot;as is&quot; for
          informational purposes and does not constitute professional advice.
          Always verify critical details with the official source before making
          decisions.
        </p>

        <h2>Third-party links and advertising</h2>
        <p>
          The Site contains links to third-party websites and displays
          third-party advertising. We are not responsible for the content,
          policies, or practices of third parties. Some links may be affiliate
          links, meaning we may earn a commission if you make a purchase, at no
          additional cost to you. This does not influence our editorial
          assessments.
        </p>

        <h2>Disclaimer of warranties</h2>
        <p>
          The Site is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis without warranties of any kind, whether express
          or implied, including fitness for a particular purpose and
          non-infringement.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} shall not be
          liable for any indirect, incidental, or consequential damages arising
          from your use of the Site or reliance on its content.
        </p>

        <h2>Changes to these terms</h2>
        <p>
          We may modify these Terms at any time. Continued use of the Site after
          changes constitutes acceptance of the revised Terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms? Reach us through our contact page.
        </p>
      </article>
    </div>
  );
}
