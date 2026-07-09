import type { Metadata } from 'next';
import { getPostSummaries } from '@/lib/content';
import { siteConfig } from '@/config/site';
import { PostCard } from '@/components/post-card';
import { Pagination } from '@/components/pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'All Articles',
  description:
    'Every article on developer tools, SaaS comparisons, AI tools, and web development tutorials.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const all = getPostSummaries();
  const perPage = siteConfig.postsPerPage;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  const posts = all.slice(0, perPage);

  return (
    <div className="container py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ]}
      />
      <h1 className="mt-4 mb-8 text-3xl font-bold">All Articles</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No articles published yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
      <Pagination currentPage={1} totalPages={totalPages} basePath="/blog" />
    </div>
  );
}
