/**
 * Stage 3 — Automated Quality Gate (critical, cannot be bypassed).
 *
 * Verifies each `drafted` item before it can become `approved`:
 *  - word count within target (not thin)
 *  - required structure: headings, FAQ, table/list
 *  - meta description length 140-160 chars
 *  - not a near-duplicate of existing published posts (text-overlap check)
 *  - flags generic/templated phrasing for manual review
 *
 * Passing drafts -> `approved`. Failing drafts -> `flagged` (never discarded).
 *
 * Run: npm run pipeline:gate
 */
import {
  loadEnv,
  getSupabase,
  readExistingPosts,
  CONTENT_QUEUE_TABLE,
} from './lib';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

loadEnv();

const MIN_WORDS = 1100;
const MAX_WORDS = 2200;
const META_MIN = 140;
const META_MAX = 160;

const GENERIC_PATTERNS = [
  /in today'?s (fast-paced|digital|modern) world/i,
  /when it comes to/i,
  /it'?s (important|worth) (to note|noting) that/i,
  /in conclusion,/i,
  /unlock the (power|potential)/i,
  /game[- ]changer/i,
  /dive (deep )?into/i,
];

export interface GateResult {
  passed: boolean;
  flags: string[];
  wordCount: number;
}

function countWords(md: string): number {
  return md.trim().split(/\s+/).filter(Boolean).length;
}

function hasTableOrList(md: string): boolean {
  const hasTable = /\|.*\|.*\n\|[-:\s|]+\|/.test(md);
  const hasList = /^\s*([-*+]|\d+\.)\s+.+(\n\s*([-*+]|\d+\.)\s+.+){2,}/m.test(md);
  return hasTable || hasList;
}

function hasFaq(md: string): boolean {
  return /^##\s+(FAQ|Frequently Asked Questions)/im.test(md) &&
    (md.match(/^###\s+.+/gm)?.length ?? 0) >= 3;
}

function hasHeadings(md: string): boolean {
  return (md.match(/^##\s+/gm)?.length ?? 0) >= 3;
}

/** Jaccard similarity on word shingles — cheap near-duplicate detection. */
function shingleSimilarity(a: string, b: string): number {
  const shingles = (text: string) => {
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    const set = new Set<string>();
    for (let i = 0; i < words.length - 2; i++) set.add(words.slice(i, i + 3).join(' '));
    return set;
  };
  const sa = shingles(a);
  const sb = shingles(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const s of sa) if (sb.has(s)) inter++;
  return inter / (sa.size + sb.size - inter);
}

function readPublishedBodies(): { slug: string; body: string }[] {
  const dir = path.join(process.cwd(), 'content', 'posts');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((f) => {
      const { content, data } = matter(fs.readFileSync(path.join(dir, f), 'utf-8'));
      return { slug: String(data.slug ?? f), body: content };
    });
}

export function runGate(
  markdown: string,
  metaDescription: string,
  published: { slug: string; body: string }[]
): GateResult {
  const flags: string[] = [];
  const wordCount = countWords(markdown);

  if (wordCount < MIN_WORDS) flags.push(`thin-content:${wordCount}w`);
  if (wordCount > MAX_WORDS) flags.push(`over-length:${wordCount}w`);
  if (!hasHeadings(markdown)) flags.push('missing-headings');
  if (!hasFaq(markdown)) flags.push('missing-faq');
  if (!hasTableOrList(markdown)) flags.push('missing-table-or-list');

  const metaLen = metaDescription?.trim().length ?? 0;
  if (metaLen < META_MIN || metaLen > META_MAX) {
    flags.push(`meta-length:${metaLen}`);
  }

  const generic = GENERIC_PATTERNS.filter((re) => re.test(markdown));
  if (generic.length >= 2) flags.push(`generic-phrasing:${generic.length}`);

  for (const post of published) {
    const sim = shingleSimilarity(markdown, post.body);
    if (sim > 0.2) {
      flags.push(`near-duplicate:${post.slug}:${sim.toFixed(2)}`);
      break;
    }
  }

  return { passed: flags.length === 0, flags, wordCount };
}

export async function run() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('[stage3] Supabase required.');
  }

  const { data: rows, error } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .select('id, title, slug, meta_description, draft_markdown')
    .eq('status', 'drafted');
  if (error) throw error;
  if (!rows?.length) {
    console.log('[stage3] No drafted items to check.');
    return;
  }

  const published = readPublishedBodies();
  // Include already-approved drafts from the queue in the dedup set too.
  const { data: approvedRows } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .select('slug, draft_markdown')
    .in('status', ['approved', 'published']);
  for (const r of approvedRows ?? []) {
    if (r.draft_markdown) published.push({ slug: r.slug ?? 'queued', body: r.draft_markdown });
  }

  for (const row of rows) {
    const result = runGate(row.draft_markdown ?? '', row.meta_description ?? '', published);
    const status = result.passed ? 'approved' : 'flagged';
    await supabase
      .from(CONTENT_QUEUE_TABLE)
      .update({ status, flags: result.flags, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    console.log(
      `[stage3] ${row.title ?? row.slug}: ${status}${result.flags.length ? ' (' + result.flags.join(', ') + ')' : ''}`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
