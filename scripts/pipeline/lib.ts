/**
 * Shared helpers for the content automation pipeline.
 * These scripts run standalone via `tsx` (Node), independent of Next.js.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const CONTENT_QUEUE_TABLE = 'content_queue';
export const POST_PERFORMANCE_TABLE = 'post_performance';

export type CategorySlug = 'dev-tools' | 'saas' | 'ai-tools' | 'web-dev';

export const CATEGORY_KEYWORDS: Record<CategorySlug, string[]> = {
  'ai-tools': ['ai', 'llm', 'gpt', 'claude', 'copilot', 'openai', 'anthropic', 'model', 'agent', 'rag', 'embedding'],
  'dev-tools': ['cli', 'editor', 'vscode', 'vim', 'ci/cd', 'github actions', 'docker', 'terminal', 'debugger', 'linter', 'build', 'testing'],
  saas: ['saas', 'pricing', 'subscription', 'stripe', 'notion', 'airtable', 'crm', 'analytics', 'platform', 'vs'],
  'web-dev': ['next.js', 'nextjs', 'react', 'vue', 'svelte', 'supabase', 'vercel', 'tailwind', 'typescript', 'node', 'frontend', 'css', 'api'],
};

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[pipeline] Supabase not configured. Set env vars in .env.');
    return null;
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Categorize a topic by keyword overlap; defaults to web-dev. */
export function categorize(text: string): CategorySlug {
  const lower = text.toLowerCase();
  let best: CategorySlug = 'web-dev';
  let bestScore = 0;
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS) as [CategorySlug, string[]][]) {
    const score = kws.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = cat;
    }
  }
  return best;
}

export interface ExistingPost {
  title: string;
  slug: string;
  tags: string[];
  publishDate: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'posts');

/** Reads published post frontmatter for dedup checks. */
export function readExistingPosts(): ExistingPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return {
        title: String(data.title ?? ''),
        slug: String(data.slug ?? ''),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        publishDate: String(data.publishDate ?? ''),
      };
    });
}

/** Was a topic covered within the last `days` days? Checks title + tag overlap. */
export function coveredRecently(topic: string, posts: ExistingPost[], days = 60): boolean {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const topicWords = new Set(
    slugify(topic).split('-').filter((w) => w.length > 3)
  );
  for (const post of posts) {
    const when = new Date(post.publishDate).getTime();
    if (Number.isNaN(when) || when < cutoff) continue;
    const haystack = slugify(post.title + ' ' + post.tags.join(' ')).split('-');
    const overlap = haystack.filter((w) => topicWords.has(w)).length;
    if (overlap >= 2) return true;
  }
  return false;
}

export const CONTENT_POSTS_DIR = CONTENT_DIR;

export function loadEnv() {
  // Minimal .env loader so scripts work without extra deps.
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const k = trimmed.slice(0, eq).trim();
    let v = trimmed.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}
