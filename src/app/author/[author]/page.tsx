import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPostsByAuthor } from '@/lib/content';
import { authors, getAuthor } from '@/config/authors';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/utils';
import { PostCard } from '@/components/post-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { buildMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';

export const revalidate = 3600;
export const dynamicParams = false;

interface Props {
  params: { author: string };
}

export function generateStaticParams() {
  return authors.map((a) => ({ author: a.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const author = getAuthor(params.author);
  if (!author) return {};
  return buildMetadata({
    title: `${author.name} — ${author.title}`,
    description: author.bio.slice(0, 160),
    path: `/author/${author.slug}`,
  });
}

export default function AuthorPage({ params }: Props) {
  const author = getAuthor(params.author);
  if (!author) notFound();

  const posts = getPostsByAuthor(author.slug);

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.title,
    description: author.bio,
    url: absoluteUrl(`/author/${author.slug}`, siteConfig.url),
    knowsAbout: author.credentials,
  };

  return (
    <div className="container py-10">
      <JsonLd data={personJsonLd} />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: author.name, path: `/author/${author.slug}` },
        ]}
      />

      <header className="mt-4 flex flex-col sm:flex-row gap-6 items-start">
        {author.avatar && (
          <Image
            src={author.avatar}
            alt={author.name}
            width={96}
            height={96}
            className="rounded-full border bg-muted"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{author.name}</h1>
          <div className="text-muted-foreground">{author.title}</div>
          <p className="mt-3 max-w-2xl text-muted-foreground">{author.bio}</p>
          {author.credentials.length > 0 && (
            <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
              {author.credentials.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <h2 className="mt-12 mb-6 text-2xl font-bold">
        Articles by {author.name}
      </h2>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No articles yet.</p>
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
