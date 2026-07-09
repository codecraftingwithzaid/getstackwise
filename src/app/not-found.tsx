import Link from 'next/link';
import { categories } from '@/config/site';
import { getPostSummaries } from '@/lib/content';
import { PostCard } from '@/components/post-card';

export default function NotFound() {
  const suggestions = getPostSummaries().slice(0, 3);

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-primary">404</p>
        <h1 className="mt-2 text-4xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Try one of these instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go home
          </Link>
          <Link href="/blog" className="rounded-md border px-4 py-2 text-sm">
            Browse all articles
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/${c.slug}`}
              className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mx-auto mt-14 max-w-5xl">
          <h2 className="mb-6 text-center text-xl font-semibold">
            Popular reads
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {suggestions.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
