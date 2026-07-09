import type { MetadataRoute } from 'next';
import { getAllPosts, getAllTags } from '@/lib/content';
import { categories, siteConfig } from '@/config/site';
import { authors } from '@/config/authors';
import { absoluteUrl, slugify } from '@/lib/utils';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticPages = [
    '',
    '/blog',
    '/about',
    '/contact',
    '/editorial-policy',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
  ].map((path) => ({
    url: absoluteUrl(path || '/', base),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.6,
  }));

  const categoryPages = categories.map((c) => ({
    url: absoluteUrl(`/blog/${c.slug}`, base),
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const postPages = getAllPosts().map((p) => ({
    url: absoluteUrl(`/blog/${p.category}/${p.slug}`, base),
    lastModified: new Date(p.updatedDate || p.publishDate),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const tagPages = getAllTags().map(({ tag }) => ({
    url: absoluteUrl(`/tags/${slugify(tag)}`, base),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }));

  const authorPages = authors.map((a) => ({
    url: absoluteUrl(`/author/${a.slug}`, base),
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    ...staticPages,
    ...categoryPages,
    ...postPages,
    ...tagPages,
    ...authorPages,
  ];
}
