import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Post, PostSummary, PostFrontmatter } from '@/lib/types';
import { categorySlugs } from '@/config/site';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

function isValidFrontmatter(data: Record<string, unknown>): boolean {
  return (
    typeof data.title === 'string' &&
    typeof data.slug === 'string' &&
    typeof data.description === 'string' &&
    typeof data.publishDate === 'string' &&
    typeof data.category === 'string' &&
    categorySlugs.includes(data.category as never) &&
    Array.isArray(data.tags) &&
    typeof data.author === 'string'
  );
}

function readAllFiles(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
}

let _cache: Post[] | null = null;

export function getAllPosts(): Post[] {
  if (_cache) return _cache;

  const posts = readAllFiles()
    .map((file) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      if (!isValidFrontmatter(data)) {
        console.warn(`[content] Skipping ${file}: invalid frontmatter`);
        return null;
      }
      const fm = data as unknown as PostFrontmatter;
      const stats = readingTime(content);
      const post: Post = {
        ...fm,
        content,
        readingTimeMinutes: Math.max(1, Math.round(stats.minutes)),
        wordCount: stats.words,
      };
      return post;
    })
    .filter((p): p is Post => p !== null)
    // Hide drafts in production; show in dev for previewing.
    .filter((p) => process.env.NODE_ENV !== 'production' || !p.draft)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );

  _cache = posts;
  return posts;
}

function toSummary(post: Post): PostSummary {
  const { content, ...rest } = post;
  const excerpt =
    post.description ||
    content.replace(/[#>*_`\[\]]/g, '').slice(0, 160).trim() + '…';
  return { ...rest, excerpt };
}

export function getPostSummaries(): PostSummary[] {
  return getAllPosts().map(toSummary);
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostsByCategory(category: string): PostSummary[] {
  return getPostSummaries().filter((p) => p.category === category);
}

export function getPostsByTag(tag: string): PostSummary[] {
  const norm = tag.toLowerCase();
  return getPostSummaries().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === norm)
  );
}

export function getPostsByAuthor(author: string): PostSummary[] {
  return getPostSummaries().filter((p) => p.author === author);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function getFeaturedPosts(limit = 3): PostSummary[] {
  const featured = getPostSummaries().filter((p) => p.featured);
  if (featured.length >= limit) return featured.slice(0, limit);
  // Backfill with latest posts if not enough explicitly featured.
  const rest = getPostSummaries().filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

/**
 * Related-post algorithm: score by shared category (+3) and shared tags (+1 each).
 * No external search dependency, deterministic and fast at build time.
 */
export function getRelatedPosts(slug: string, limit = 5): PostSummary[] {
  const target = getPostBySlug(slug);
  if (!target) return [];
  const targetTags = new Set(target.tags.map((t) => t.toLowerCase()));

  return getPostSummaries()
    .filter((p) => p.slug !== slug)
    .map((p) => {
      let score = 0;
      if (p.category === target.category) score += 3;
      for (const tag of p.tags) {
        if (targetTags.has(tag.toLowerCase())) score += 1;
      }
      return { post: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}
