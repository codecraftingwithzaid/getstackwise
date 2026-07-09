import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { authors } from '@/config/authors';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description: `About ${siteConfig.name}: our mission, our team, and how we test the developer tools we cover.`,
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="container py-12">
      <article className="prose prose-slate dark:prose-invert mx-auto max-w-3xl">
        <h1>About {siteConfig.name}</h1>
        <p>
          {siteConfig.name} is an independent publication covering developer
          tools, SaaS platforms, AI tooling, and modern web development for a US
          audience. We exist to cut through vendor marketing and tell you what
          actually works in real production workflows.
        </p>

        <h2>Our mission</h2>
        <p>
          Developers waste enormous amounts of time evaluating tools that
          promise the world and deliver a landing page. Our goal is simple: give
          you honest, hands-on assessments and practical tutorials so you can
          make faster, better-informed decisions about the software you build
          with.
        </p>

        <h2>What we cover</h2>
        <ul>
          <li>
            <strong>Developer tools</strong> — editors, CLIs, CI/CD, testing,
            and the everyday tooling that speeds up shipping.
          </li>
          <li>
            <strong>SaaS comparisons</strong> — head-to-head breakdowns with US
            pricing in USD and clear recommendations.
          </li>
          <li>
            <strong>AI tools</strong> — coding assistants, LLM platforms, and
            applied AI reviewed against real developer workflows.
          </li>
          <li>
            <strong>Web development</strong> — hands-on tutorials across
            Next.js, Supabase, Vercel, and the modern stack.
          </li>
        </ul>

        <h2>Who writes here</h2>
        {authors.map((a) => (
          <div key={a.slug}>
            <h3>
              <Link href={`/author/${a.slug}`}>{a.name}</Link> — {a.title}
            </h3>
            <p>{a.bio}</p>
          </div>
        ))}

        <h2>How we work</h2>
        <p>
          We use an AI-assisted content workflow with an automated quality gate
          and periodic human review. We believe in being transparent about this
          — read our{' '}
          <Link href="/editorial-policy">editorial policy</Link> for the full
          process, including how we fact-check pricing, version numbers, and
          technical claims.
        </p>

        <h2>Get in touch</h2>
        <p>
          Have a correction, a tool suggestion, or a partnership inquiry? Reach
          us via our <Link href="/contact">contact page</Link>.
        </p>
      </article>
    </div>
  );
}
