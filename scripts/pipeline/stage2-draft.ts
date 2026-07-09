/**
 * Stage 2 — Draft Generation.
 *
 * Picks `queued` topics and calls the Anthropic API (Claude) to produce a
 * structured first draft: title, meta description, outline-driven H2/H3 body
 * (1200-1800 words), at least one comparison table/structured list, a 3-4 item
 * FAQ section, and a clear verdict. Stores the result with status `drafted`.
 *
 * Run: npm run pipeline:draft
 */
import Anthropic from '@anthropic-ai/sdk';
import { loadEnv, getSupabase, slugify, CONTENT_QUEUE_TABLE } from './lib';

loadEnv();

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';
const MAX_PER_RUN = 5;

interface QueueRow {
  id: string;
  topic: string;
  category: string;
}

function buildPrompt(topic: string, category: string): string {
  return `You are a senior software engineer writing for a US developer audience on a site covering ${category}.

Write a complete, publish-ready article about this trending topic:
"${topic}"

Hard requirements:
- US English spelling; any prices in USD; examples relevant to US developers.
- 1200-1800 words of specific, concrete content. No generic filler, no "in today's fast-paced world" intros.
- Real comparisons, real use cases, real trade-offs.
- Include at least one Markdown comparison table OR a clearly structured list.
- Include an FAQ section titled exactly "## FAQ" with 3-4 "### Question" headings each followed by a concise answer.
- Include a clear verdict/recommendation section near the end.
- Use H2 (##) and H3 (###) headings to structure the body.

Return STRICT JSON only (no prose, no code fences) with this shape:
{
  "title": "working headline, <= 60 chars",
  "meta_description": "140-160 characters, compelling, includes primary keyword",
  "markdown": "the full article body in Markdown, starting at the first H2 (do NOT repeat the title as H1)"
}`;
}

function safeParseJson(text: string): { title: string; meta_description: string; markdown: string } | null {
  // Strip accidental code fences.
  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to locate the first {...} block.
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function draftOne(
  client: Anthropic,
  row: QueueRow
): Promise<{ title: string; meta_description: string; markdown: string; slug: string } | null> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(row.topic, row.category) }],
  });
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  const parsed = safeParseJson(text);
  if (!parsed?.title || !parsed.markdown) {
    console.warn(`[stage2] Failed to parse draft for topic: ${row.topic}`);
    return null;
  }
  return { ...parsed, slug: slugify(parsed.title).slice(0, 80) };
}

export async function run() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('[stage2] ANTHROPIC_API_KEY not set.');
  }
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('[stage2] Supabase required for this stage.');
  }
  const client = new Anthropic({ apiKey });

  const { data: rows, error } = await supabase
    .from(CONTENT_QUEUE_TABLE)
    .select('id, topic, category')
    .eq('status', 'queued')
    .order('score', { ascending: false })
    .limit(MAX_PER_RUN);

  if (error) throw error;
  if (!rows?.length) {
    console.log('[stage2] No queued topics to draft.');
    return;
  }

  for (const row of rows as QueueRow[]) {
    console.log(`[stage2] Drafting: ${row.topic}`);
    const draft = await draftOne(client, row);
    if (!draft) {
      await supabase
        .from(CONTENT_QUEUE_TABLE)
        .update({ status: 'flagged', flags: ['draft-parse-failed'], updated_at: new Date().toISOString() })
        .eq('id', row.id);
      continue;
    }
    await supabase
      .from(CONTENT_QUEUE_TABLE)
      .update({
        status: 'drafted',
        title: draft.title,
        slug: draft.slug,
        meta_description: draft.meta_description,
        draft_markdown: draft.markdown,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    console.log(`[stage2] Drafted -> ${draft.title}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
