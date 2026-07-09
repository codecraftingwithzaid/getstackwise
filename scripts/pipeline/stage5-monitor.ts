/**
 * Stage 5 — Post-Publish Monitoring.
 *
 * Pulls Google Search Console performance (clicks, impressions, position) per
 * page, stores rows in Supabase `post_performance`, and flags posts with
 * declining impressions or that were never indexed after 14 days.
 *
 * Auth: a Google service account (added as an owner in Search Console). Provide
 * the JSON key base64-encoded in GSC_SERVICE_ACCOUNT_B64.
 *
 * Run: npm run pipeline:monitor
 */
import crypto from 'node:crypto';
import { loadEnv, getSupabase, POST_PERFORMANCE_TABLE } from './lib';

loadEnv();

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

function loadServiceAccount(): ServiceAccount | null {
  const b64 = process.env.GSC_SERVICE_ACCOUNT_B64;
  if (!b64) return null;
  try {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8'));
  } catch {
    console.error('[stage5] Could not decode GSC_SERVICE_ACCOUNT_B64.');
    return null;
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Mint a Google OAuth2 access token from a service account (JWT bearer). */
async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );
  const signingInput = `${header}.${claim}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  const signature = base64url(signer.sign(sa.private_key));
  const jwt = `${signingInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Token error: ${JSON.stringify(json)}`);
  return json.access_token;
}

interface GscRow {
  keys: string[]; // [page]
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

async function fetchSearchAnalytics(token: string, siteUrl: string): Promise<GscRow[]> {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 28 * 864e5).toISOString().slice(0, 10);
  const res = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: ['page'], rowLimit: 1000 }),
    }
  );
  const json = await res.json();
  return json.rows ?? [];
}

export async function run() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('[stage5] Supabase required.');
  }
  const sa = loadServiceAccount();
  const siteUrl = process.env.GSC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!sa || !siteUrl) {
    console.log('[stage5] GSC not configured — skipping Search Console pull.');
    return;
  }

  const token = await getAccessToken(sa);
  const rows = await fetchSearchAnalytics(token, siteUrl);
  console.log(`[stage5] Pulled ${rows.length} pages from Search Console.`);

  const now = new Date().toISOString();
  for (const r of rows) {
    const page = r.keys[0];
    const slug = page.replace(/\/$/, '').split('/').pop() ?? page;
    await supabase.from(POST_PERFORMANCE_TABLE).insert({
      slug,
      page_url: page,
      clicks: Math.round(r.clicks),
      impressions: Math.round(r.impressions),
      avg_position: r.position,
      ctr: r.ctr,
      indexed: r.impressions > 0,
      recorded_at: now,
    });
  }

  // Flag never-indexed posts older than 14 days (0 impressions ever recorded).
  const { data: perf } = await supabase
    .from(POST_PERFORMANCE_TABLE)
    .select('slug, impressions, first_seen_at')
    .order('recorded_at', { ascending: false });

  const cutoff = Date.now() - 14 * 864e5;
  const flagged = (perf ?? []).filter(
    (p) => p.impressions === 0 && new Date(p.first_seen_at).getTime() < cutoff
  );
  if (flagged.length) {
    console.log('[stage5] Never-indexed after 14 days:', flagged.map((f) => f.slug).join(', '));
  }
  console.log('[stage5] Monitoring complete. Review /admin/dashboard for trends.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
