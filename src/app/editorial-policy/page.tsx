import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Editorial Policy',
  description: `How ${siteConfig.name} researches, writes, reviews, and fact-checks its content, including our transparent use of AI assistance.`,
  path: '/editorial-policy',
});

export default function EditorialPolicyPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
        <h1>Editorial Policy</h1>
        <p>
          <em>Last updated: January 1, 2026</em>
        </p>
        <p>
          We believe transparency about how content is made is a feature, not a
          disclaimer. This page explains exactly how articles on{' '}
          {siteConfig.name} are researched, drafted, reviewed, and maintained.
        </p>

        <h2>Our use of AI assistance</h2>
        <p>
          We use a semi-automated content pipeline. Trending developer and tech
          topics are detected automatically from sources such as Hacker News,
          GitHub trending, and developer communities. Candidate topics are then
          drafted with the assistance of large language models (Anthropic&apos;s
          Claude).
        </p>
        <p>
          <strong>
            AI assistance does not mean unreviewed publishing.
          </strong>{' '}
          Every draft passes through an automated quality gate before it is
          eligible to publish, and our team performs periodic human spot-checks
          focused on factual accuracy.
        </p>

        <h2>Our quality gate</h2>
        <p>Before any article can be published, it must pass automated checks:</p>
        <ul>
          <li>Meets our length and depth standards (no thin content).</li>
          <li>
            Is not a duplicate or near-duplicate of existing published content.
          </li>
          <li>
            Contains the required structure: clear headings, a comparison table
            or structured list, an FAQ section, and a recommendation.
          </li>
          <li>
            Has a meta description within search-friendly length limits.
          </li>
          <li>
            Is flagged for human review if it reads as generic or templated.
          </li>
        </ul>
        <p>
          Drafts that fail any check are routed to a manual review queue rather
          than discarded or auto-published, so we can monitor quality over time.
        </p>

        <h2>Publishing standards</h2>
        <ul>
          <li>
            We publish a maximum of one to two new articles per day to maintain
            quality and a natural cadence.
          </li>
          <li>
            No configuration can bypass the quality gate. There is no
            &quot;auto-publish anything&quot; mode.
          </li>
          <li>
            Content is written in US English, with pricing in USD and examples
            relevant to a US developer audience.
          </li>
        </ul>

        <h2>Fact-checking and corrections</h2>
        <p>
          Technical details — pricing, version numbers, and feature claims —
          change quickly. Any article containing such claims is flagged for a
          periodic manual spot-check. We also re-review our top traffic-driving
          articles on a recurring schedule to catch outdated information, and we
          update the &quot;last updated&quot; date whenever an article is
          revised.
        </p>
        <p>
          Found something wrong? Please tell us via our{' '}
          <Link href="/contact">contact page</Link>. We correct errors promptly
          and transparently.
        </p>

        <h2>Independence and affiliate disclosure</h2>
        <p>
          Our editorial assessments are independent. Some articles contain
          affiliate links, and we may earn a commission from qualifying
          purchases at no additional cost to you. Affiliate relationships never
          determine our recommendations or scores.
        </p>
      </article>
    </div>
  );
}
