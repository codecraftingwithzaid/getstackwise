import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllPosts, getPostBySlug, getRelatedPosts } from '@/lib/content';
import { getCategory } from '@/config/site';
import { getAuthor } from '@/config/authors';
import { formatDate } from '@/lib/utils';
import { PostCard } from '@/components/post-card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { MdxContent } from '@/components/mdx-content';
import { AdSlot } from '@/components/ad-slot';
import { JsonLd } from '@/components/json-ld';
import {
  buildMetadata,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  extractFaq,
} from '@/lib/seo';

export const revalidate = 3600;
export const dynamicParams = true; // allow ISR for newly auto-published posts

interface Props {
  params: { category: string; slug: string };
}

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ category: p.category, slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: post.canonicalUrl || `/blog/${post.category}/${post.slug}`,
    ogImage: post.ogImage,
    type: 'article',
    publishedTime: post.publishDate,
    modifiedTime: post.updatedDate || post.publishDate,
    authorName: getAuthor(post.author)?.name,
  });
}

export default function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post || post.category !== params.category) notFound();

  const category = getCategory(post.category)!;
  const author = getAuthor(post.author);
  const related = getRelatedPosts(post.slug, 5);
  const faq = extractFaq(post.content);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: category.name, path: `/blog/${category.slug}` },
    { name: post.title, path: `/blog/${post.category}/${post.slug}` },
  ];

  return (
    <article className="container py-10">
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      {faq.length > 0 && <JsonLd data={faqJsonLd(faq)} />}

      <div className="mx-auto max-w-3xl">
        <Breadcrumbs items={crumbs} />

        <header className="mt-4">
          <Link
            href={`/blog/${category.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {category.name}
          </Link>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {author && (
              <Link
                href={`/author/${author.slug}`}
                className="font-medium text-foreground hover:underline"
              >
                {author.name}
              </Link>
            )}
            <span aria-hidden>·</span>
            <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
            {post.updatedDate && post.updatedDate !== post.publishDate && (
              <>
                <span aria-hidden>·</span>
                <span>Updated {formatDate(post.updatedDate)}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{post.readingTimeMinutes} min read</span>
          </div>
        </header>

        {post.ogImage && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-lg border">
            <Image
              src={post.ogImage}
              alt={post.heroImageAlt || post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <div className="my-8">
          <MdxContent source={post.content} />
        </div>

        {/* In-content ad, reserved height to avoid CLS */}
        <AdSlot slotId="article-footer" />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag.toLowerCase())}`}
                className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Author box for E-E-A-T */}
        {author && (
          <div className="mt-10 rounded-lg border bg-card p-6">
            <div className="text-sm font-semibold">Written by {author.name}</div>
            <div className="text-xs text-muted-foreground">{author.title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{author.bio}</p>
            <Link
              href={`/author/${author.slug}`}
              className="mt-2 inline-block text-sm text-primary hover:underline"
            >
              More from {author.name} →
            </Link>
          </div>
        )}
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mx-auto mt-14 max-w-5xl">
          <h2 className="mb-6 text-2xl font-bold">Related Reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {related.slice(0, 3).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
