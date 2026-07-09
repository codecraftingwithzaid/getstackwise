import type { CategorySlug } from '@/config/site';

/** Raw frontmatter as authored in MDX files. */
export interface PostFrontmatter {
  title: string;
  slug: string;
  description: string;
  publishDate: string; // ISO date
  updatedDate?: string; // ISO date
  tags: string[];
  category: CategorySlug;
  author: string; // author slug
  canonicalUrl?: string;
  ogImage?: string;
  heroImageAlt?: string;
  featured?: boolean;
  draft?: boolean;
}

/** A fully-resolved post ready for rendering. */
export interface Post extends PostFrontmatter {
  content: string; // raw MDX body
  readingTimeMinutes: number;
  wordCount: number;
}

export interface PostSummary
  extends Omit<Post, 'content'> {
  excerpt: string;
}

export interface Author {
  slug: string;
  name: string;
  bio: string;
  title: string;
  avatar?: string;
  credentials: string[];
  social?: {
    twitter?: string;
    github?: string;
    website?: string;
  };
}

/** Content automation queue row (Supabase `content_queue`). */
export type QueueStatus =
  | 'queued'
  | 'drafted'
  | 'approved'
  | 'published'
  | 'flagged'
  | 'rejected';

export interface QueueItem {
  id: string;
  topic: string;
  source: string; // hackernews | github | google-trends | reddit
  score: number;
  category: CategorySlug;
  status: QueueStatus;
  title?: string;
  slug?: string;
  meta_description?: string;
  draft_markdown?: string;
  flags?: string[]; // quality-gate flags / reasons
  created_at: string;
  updated_at: string;
  published_at?: string;
}
