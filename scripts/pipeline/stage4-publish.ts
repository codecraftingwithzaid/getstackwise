/**
 * Stage 4 — Auto-Publish.
 *
 * Picks `approved` posts (HARD CAP: 1-2 per day) and:
 *  - generates the MDX file with full frontmatter
 *  - selects a relevant hero image (Unsplash) with generated alt text
 *  - inserts internal links to 3-5 related existing posts
 *  - marks the queue row `published`
 *  - pings Google to re-crawl the sitemap
 *
 * Commit + redeploy (or Supabase ISR) happens via the CI job that runs this.
 *
 * Run: npm run pipeline:publish
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  loadEnv,
  getSupabase,
  slugify,
  readExistingPosts,
  CONTENT_POSTS_DIR,
  CONTENT_QUEUE_TABLE,
  type ExistingPost,
} from './lib';

loadEnv();

// GUARDRAIL: never publish more than this many posts in a single day.
const MAX_PER_DAY = 2;

interface ApprovedRow {
  id: string;
  topic: string;
  title: string;
  slug: string;
  meta_description: string;
  draft_markdown: string;
  category: string;
}

async function selectHeroImage(query: string): Promise<{ url: string; alt: string }> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const alt = `Illustration for an article about ${query}`;
  if (!key) {
    // Deterministic fallback that still yields a real, optimizable image.
    return {
      url: `https://source.unsplash.com/1200x675/?${encodeURIComponent(query + ',technology,code')}`,
      alt,
    };
  }
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' technology')}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${key}` } }
    );
    const json = await res.json();
    const photo = json?.results?.[0];
    if (photo?.urls?.regular) {
      return {
        url: photo.urls.regular,
        alt: photo.alt_description ? `${photo.alt_description}` : alt,
      };
    }
  } catch {
    /* fall through to fallback */
  }
  return { url: `https://source.unsplash.com/1200x675/?${encodeURIComponent(query)}`, alt };
}

/** Insert one contextual in-body link into a relevant older post. */
function insertContextualLink(markdown: string, related: ExistingPost[], category: string): string {
  if (related.length === 0) return markdown;
  const target = related[0];
  const url = `/blog/${category}/${target.slug}`;
  const paras = markdown.split('\n\n');
  // Insert after the 2nd paragraph if possible.
  const idx = Math.min(2, paras.length - 1);
  const sentence = ` For more context, see our guide on [${target.title}](${url}).`;
  paras[idx] = paras[idx] + sentence;
  return paras.join('\n\n');
}

function buildRelatedSection(related: ExistingPost[], category: string): string {
  if (related.length === 0) return '';
  const items = related
    .slice(0, 5)
    .map((p) => `- [${p.title}](/blog/${category}/${p.slug})`)
    .join('\n');
  return `\n\n## Related Reading\n\n${items}\n`;
}

/** Score existing posts by tag/keyword overlap with the new topic. */
function findRelated(topic: string, existing: ExistingPost[], limit = 5): ExistingPost[] {
  const words = new Set(slugify(topic).split('-').filter((w) => w.length > 3));
  return existing
    .map((p) => {
      const hay = slugify(p.title + ' ' + p.tags.join(' ')).split('-');
      const score = hay.filter((w) => words.has(w)).length;
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

function deriveTags(topic: string): string[] {
  const stop = new Set(['the', 'and', 'for', 'with', 'your', 'from', 'this', 'that', 'best', 'vs']);
  return Array.from(
    new Set(
      slugify(topic)
        .split('-')
        .filter((w) => w.length > 3 && !stop.has(w))
        .slice(0, 5)
    )
  );
}

async function publishOne(row: ApprovedRow, existing: ExistingPost[]): Promise<string> {
  const slug = row.slug || slugify(row.title).slice(0, 80);
  const related = findRelated(row.topic, existing, 5);
  const hero = await selectHeroImage(row.title);
  const now = new Date().toISOString();

  let body = row.draft_markdown;
  body = insertContextualLink(body, related, row.category);
  body += buildRelatedSection(related, row.category);

  const frontmatter = {
    title: row.title,
    slug,
    description: row.meta_description,
    publishDate: now,
    updatedDate: now,
    tags: deriveTags(row.topic),
    category: row.category,
    author: 'editorial-team',
    ogImage: hero.url,
    heroImageAlt: hero.alt,
    draft: false,
  };

  const file = matter.stringify(body, frontmatter);
  const filePath = path.join(CONTENT_POSTS_DIR, `${slug}.mdx`);
  fs.mkdirSync(CONTENT_POSTS_DIR, { recursive: true });
  fs.writeFileSync(filePath, file, 'utf-8');
  return filePath;
}

async function pingGoogleSitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return;
  const sitemap = `${siteUrl.replace(/\/$/, '')}/sitemap.xml`;
  // Note: Google deprecated the ping endpoint in 2023; resubmission is handled
  // via the Search Console API in Stage 5. We still hit Bing's ping here.
  try {
    await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`);
    console.log('[stage4] Pinged Bing sitemap endpoint.');
  } catch {
    /* non-fatal */
  }
}

async function countPublishedToday(supabase: NonNullable<ReturnType<typeof getSupabase>>): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .gte('published_at', startOfDay.toISOString());
  return count ?? 0;
}

export async function run() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('[stage4] Supabase required.');
  }

  const publishedToday = await countPublishedToday(supabase);
  const remaining = MAX_PER_DAY - publishedToday;
  if (remaining <= 0) {
    console.log(`[stage4] Daily cap reached (${publishedToday}/${MAX_PER_DAY}). Nothing to do.`);
    return;
  }

  const { data: rows, error } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .select('id, topic, title, slug, meta_description, draft_markdown, category')
    .eq('status', 'approved')
    .order('score', { ascending: false })
    .limit(remaining);
  if (error) throw error;
  if (!rows?.length) {
    console.log('[stage4] No approved posts ready to publish.');
    return;
  }

  const existing = readExistingPosts();

  for (const row of rows as ApprovedRow[]) {
    const filePath = await publishOne(row, existing);
    await supabase
      .from(CONTENT_QUEUE_TABLE)
      .update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', row.id);
    console.log(`[stage4] Published -> ${filePath}`);
    // Add just-published post so subsequent posts in this run can link to it.
    existing.push({ title: row.title, slug: row.slug, tags: deriveTags(row.topic), publishDate: new Date().toISOString() });
  }

  await pingGoogleSitemap();
  console.log('[stage4] Done. Commit content/ and redeploy to publish live.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
