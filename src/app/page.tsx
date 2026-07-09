import Link from 'next/link';
import { getFeaturedPosts, getPostSummaries } from '@/lib/content';
import { categories } from '@/config/site';
import { PostCard } from '@/components/post-card';
import { NewsletterSignup } from '@/components/newsletter-signup';

export const revalidate = 3600; // ISR: newly auto-published posts appear within 1h

export default function HomePage() {
  const featured = getFeaturedPosts(3);
  const latest = getPostSummaries().slice(0, 6);

  return (
    <div className="container py-10 md:py-14">
      {/* Hero */}
      <section className="mb-14 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          The developer tools and AI releases worth your time.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Hands-on reviews and tutorials across the modern web stack — Next.js,
          Supabase, Vercel, and the SaaS and AI tools US developers actually use.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/${c.slug}`}
              className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Featured</h2>
            <Link href="/blog" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((post, i) => (
              <PostCard key={post.slug} post={post} priority={i === 0} />
            ))}
          </div>
        </section>
      )}

      {/* Latest */}
      {latest.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold">Latest Articles</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="mx-auto max-w-2xl">
        <NewsletterSignup />
      </section>
    </div>
  );
}
