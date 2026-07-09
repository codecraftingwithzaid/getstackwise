import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { absoluteUrl } from '@/lib/utils';
import type { Post } from '@/lib/types';
import { getAuthor } from '@/config/authors';

interface SeoParams {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  noindex?: boolean;
}

export function buildMetadata(params: SeoParams): Metadata {
  const url = absoluteUrl(params.path, siteConfig.url);
  // When a page has its own image, use it. Otherwise omit images so the
  // site-wide branded opengraph-image.tsx (with the logo) is inherited.
  const ogImage = params.ogImage
    ? absoluteUrl(params.ogImage, siteConfig.url)
    : undefined;

  return {
    title: params.title,
    description: params.description,
    alternates: {
      canonical: url,
      languages: { 'en-US': url },
    },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: siteConfig.name,
      locale: 'en_US',
      type: params.type ?? 'website',
      ...(ogImage
        ? { images: [{ url: ogImage, width: 1200, height: 630, alt: params.title }] }
        : {}),
      ...(params.type === 'article'
        ? {
            publishedTime: params.publishedTime,
            modifiedTime: params.modifiedTime,
            authors: params.authorName ? [params.authorName] : undefined,
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      ...(ogImage ? { images: [ogImage] } : {}),
      site: siteConfig.social.twitter,
    },
    robots: params.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

// ---------- JSON-LD structured data ----------

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.publisher.logo, siteConfig.url),
    sameAs: [`https://twitter.com/${siteConfig.social.twitter.replace('@', '')}`],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: 'en-US',
  };
}

export function articleJsonLd(post: Post) {
  const author = getAuthor(post.author);
  const url = absoluteUrl(`/blog/${post.category}/${post.slug}`, siteConfig.url);
  const image = post.ogImage
    ? absoluteUrl(post.ogImage, siteConfig.url)
    : absoluteUrl(siteConfig.publisher.logo, siteConfig.url);

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: [image],
    datePublished: post.publishDate,
    dateModified: post.updatedDate || post.publishDate,
    inLanguage: 'en-US',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: {
      '@type': 'Person',
      name: author?.name || post.author,
      url: absoluteUrl(`/author/${post.author}`, siteConfig.url),
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.publisher.name,
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(siteConfig.publisher.logo, siteConfig.url),
      },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path, siteConfig.url),
    })),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function faqJsonLd(entries: FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: { '@type': 'Answer', text: e.answer },
    })),
  };
}

/**
 * Parses an FAQ section out of raw MDX so we can emit FAQPage schema.
 * Recognizes a `## FAQ` (or `## Frequently Asked Questions`) heading followed
 * by `### Question` / answer paragraph pairs.
 */
export function extractFaq(markdown: string): FaqEntry[] {
  const faqHeadingRe = /^##\s+(FAQ|Frequently Asked Questions)\s*$/im;
  const match = faqHeadingRe.exec(markdown);
  if (!match) return [];

  const section = markdown.slice(match.index + match[0].length);
  // Stop at the next H2 to bound the FAQ section.
  const nextH2 = section.search(/^##\s+/m);
  const scoped = nextH2 === -1 ? section : section.slice(0, nextH2);

  const entries: FaqEntry[] = [];
  const qRe = /^###\s+(.+)$/gm;
  const questions: { question: string; contentStart: number }[] = [];
  let q: RegExpExecArray | null;
  while ((q = qRe.exec(scoped)) !== null) {
    questions.push({
      question: q[1].trim(),
      contentStart: q.index + q[0].length,
    });
  }

  for (let i = 0; i < questions.length; i++) {
    const start = questions[i].contentStart;
    const end =
      i + 1 < questions.length
        ? // Answer runs until the next question's heading start.
          scoped.lastIndexOf('###', questions[i + 1].contentStart)
        : scoped.length;
    const answer = scoped
      .slice(start, end)
      .replace(/[#>*_`]/g, '')
      .trim();
    if (questions[i].question && answer) {
      entries.push({ question: questions[i].question, answer: answer.slice(0, 500) });
    }
  }
  return entries;
}
