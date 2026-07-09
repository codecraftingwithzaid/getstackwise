import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllTags, getPostsByTag } from '@/lib/content';
import { PostCard } from '@/components/post-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { slugify } from '@/lib/utils';

export const revalidate = 3600;

interface Props {
  params: { tag: string };
}

export function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag: slugify(tag) }));
}

export function generateMetadata({ params }: Props): Metadata {
  const tag = decodeURIComponent(params.tag);
  return buildMetadata({
    title: `#${tag}`,
    description: `Articles tagged ${tag}.`,
    path: `/tags/${params.tag}`,
  });
}

export default function TagPage({ params }: Props) {
  const decoded = decodeURIComponent(params.tag);
  // Match against slugified tag so "Next.js" -> "nextjs" works both ways.
  const posts = getAllTags()
    .filter(({ tag }) => slugify(tag) === decoded || tag.toLowerCase() === decoded)
    .flatMap(({ tag }) => getPostsByTag(tag));

  if (posts.length === 0) notFound();

  return (
    <div className="container py-10">
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Tags', path: '/blog' },
          { name: `#${decoded}`, path: `/tags/${params.tag}` },
        ]}
      />
      <h1 className="mt-4 mb-8 text-3xl font-bold">Tagged: {decoded}</h1>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
