import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByCategory } from '@/lib/content';
import { categorySlugs, getCategory } from '@/config/site';
import { PostCard } from '@/components/post-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata, breadcrumbJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

export const revalidate = 3600;
export const dynamicParams = false;

interface Props {
  params: { category: string };
}

export function generateStaticParams() {
  return categorySlugs.map((category) => ({ category }));
}

export function generateMetadata({ params }: Props): Metadata {
  const category = getCategory(params.category);
  if (!category) return {};
  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/blog/${category.slug}`,
  });
}

export default function CategoryPage({ params }: Props) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const posts = getPostsByCategory(category.slug);

  return (
    <div className="container py-10">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: category.name, path: `/blog/${category.slug}` },
        ])}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: category.name, path: `/blog/${category.slug}` },
        ]}
      />
      <header className="mt-4 mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="mt-2 text-muted-foreground">{category.description}</p>
      </header>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No articles in this category yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
