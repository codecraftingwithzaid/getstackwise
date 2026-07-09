/**
 * Stage 1 — Trend & Topic Detection.
 *
 * Pulls trending developer/tech topics from Hacker News, GitHub Trending, and
 * subreddit RSS feeds, scores them by category relevance + freshness, drops
 * anything covered in the last 60 days, and writes a ranked queue of 5-10
 * candidates to Supabase `content_queue` with status `queued`.
 *
 * Run: npm run pipeline:trends
 */
import {
  loadEnv,
  getSupabase,
  categorize,
  coveredRecently,
  readExistingPosts,
  slugify,
  CONTENT_QUEUE_TABLE,
  type CategorySlug,
} from './lib';

loadEnv();

interface Candidate {
  topic: string;
  source: string;
  score: number;
  category: CategorySlug;
  points?: number;
}

const RELEVANCE = /\b(ai|llm|gpt|claude|next\.?js|react|vue|svelte|supabase|vercel|typescript|node|rust|go|python|api|saas|docker|kubernetes|postgres|database|framework|library|cli|dev\s?tool|open\s?source|self\s?host|serverless|edge)\b/i;

async function fromHackerNews(): Promise<Candidate[]> {
  try {
    const ids: number[] = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json'
    ).then((r) => r.json());
    const top = ids.slice(0, 40);
    const stories = await Promise.all(
      top.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r) =>
          r.json()
        )
      )
    );
    return stories
      .filter((s) => s && s.title && RELEVANCE.test(s.title))
      .map((s) => ({
        topic: s.title as string,
        source: 'hackernews',
        points: s.score ?? 0,
        // Popularity proxy: normalize HN points into a 0-5 boost.
        score: Math.min(5, Math.log10((s.score ?? 1) + 1) * 2),
        category: categorize(s.title),
      }));
  } catch (e) {
    console.warn('[stage1] Hacker News fetch failed:', (e as Error).message);
    return [];
  }
}

async function fromReddit(sub: string): Promise<Candidate[]> {
  try {
    const res = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=week&limit=15`, {
      headers: { 'User-Agent': 'getstackwise-pipeline/1.0' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const children = json?.data?.children ?? [];
    return children
      .map((c: { data: { title: string; ups: number } }) => c.data)
      .filter((d: { title: string }) => d?.title && RELEVANCE.test(d.title))
      .map((d: { title: string; ups: number }) => ({
        topic: d.title,
        source: `reddit:${sub}`,
        points: d.ups ?? 0,
        score: Math.min(4, Math.log10((d.ups ?? 1) + 1) * 1.5),
        category: categorize(d.title),
      }));
  } catch (e) {
    console.warn(`[stage1] Reddit r/${sub} failed:`, (e as Error).message);
    return [];
  }
}

async function fromGitHubTrending(): Promise<Candidate[]> {
  // Uses GitHub search as a lightweight, API-friendly trending proxy:
  // repos created recently, sorted by stars.
  try {
    const since = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(
      `https://api.github.com/search/repositories?q=created:>${since}&sort=stars&order=desc&per_page=20`,
      { headers }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.items ?? [])
      .filter((repo: { description?: string; name: string }) =>
        RELEVANCE.test(`${repo.name} ${repo.description ?? ''}`)
      )
      .map((repo: { full_name: string; description?: string; stargazers_count: number }) => ({
        topic: `${repo.full_name}: ${repo.description ?? 'trending open-source project'}`,
        source: 'github',
        points: repo.stargazers_count,
        score: Math.min(5, Math.log10((repo.stargazers_count ?? 1) + 1) * 1.8),
        category: categorize(`${repo.full_name} ${repo.description ?? ''}`),
      }));
  } catch (e) {
    console.warn('[stage1] GitHub trending failed:', (e as Error).message);
    return [];
  }
}

export async function detectTrends(): Promise<Candidate[]> {
  const existing = readExistingPosts();

  const results = await Promise.all([
    fromHackerNews(),
    fromReddit('webdev'),
    fromReddit('programming'),
    fromReddit('SaaS'),
    fromGitHubTrending(),
  ]);

  const all = results.flat();

  // Dedupe by slugified topic; keep highest score.
  const bySlug = new Map<string, Candidate>();
  for (const c of all) {
    const key = slugify(c.topic).slice(0, 60);
    const prev = bySlug.get(key);
    if (!prev || c.score > prev.score) bySlug.set(key, c);
  }

  const ranked = Array.from(bySlug.values())
    // Freshness guard: skip topics already covered in the last 60 days.
    .filter((c) => !coveredRecently(c.topic, existing, 60))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return ranked;
}

export async function run() {
  console.log('[stage1] Detecting trending topics…');
  const candidates = await detectTrends();
  console.log(`[stage1] ${candidates.length} candidate topics after dedup/freshness.`);
  candidates.forEach((c, i) =>
    console.log(`  ${i + 1}. [${c.category}] (${c.score.toFixed(2)}) ${c.topic}`)
  );

  const supabase = getSupabase();
  if (!supabase) {
    console.log('[stage1] No Supabase — dry run only. Candidates above not persisted.');
    return;
  }

  for (const c of candidates) {
    const slug = slugify(c.topic).slice(0, 80);
    // Skip if an identical topic slug is already in the queue.
    const { data: existingRow } = await supabase
      .from(CONTENT_QUEUE_TABLE)
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (existingRow) continue;

    const { error } = await supabase.from(CONTENT_QUEUE_TABLE).insert({
      topic: c.topic,
      source: c.source,
      score: c.score,
      category: c.category,
      status: 'queued',
      slug,
    });
    if (error) console.warn('[stage1] insert error:', error.message);
  }
  console.log('[stage1] Queue updated.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
