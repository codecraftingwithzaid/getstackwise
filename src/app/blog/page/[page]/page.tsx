import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostSummaries } from '@/lib/content';
import { siteConfig } from '@/config/site';
import { PostCard } from '@/components/post-card';
import { Pagination } from '@/components/pagination';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: { page: string };
}

export function generateStaticParams() {
  const total = Math.ceil(getPostSummaries().length / siteConfig.postsPerPage);
  // Pages 2..N (page 1 is /blog).
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    page: String(i + 2),
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  return buildMetadata({
    title: `All Articles — Page ${params.page}`,
    description:
      'Every article on developer tools, SaaS comparisons, AI tools, and web development tutorials.',
    path: `/blog/page/${params.page}`,
  });
}

export default function BlogPaginatedPage({ params }: Props) {
  const page = Number(params.page);
  if (!Number.isInteger(page) || page < 2) notFound();

  const all = getPostSummaries();
  const perPage = siteConfig.postsPerPage;
  const totalPages = Math.max(1, Math.ceil(all.length / perPage));
  if (page > totalPages) notFound();

  const posts = all.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: `Page ${page}`, path: `/blog/page/${page}` },
        ]}
      />
      <h1 className="mt-4 mb-8 text-3xl font-bold">All Articles</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
    </div>
  );
}
