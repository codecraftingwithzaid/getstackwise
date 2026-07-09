import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Pipeline trigger endpoint.
 *
 * The full pipeline writes MDX files and commits them, which must happen in an
 * environment with the repo checked out — i.e. GitHub Actions, not a Vercel
 * serverless function. This route therefore *dispatches* the GitHub Actions
 * workflow (workflow_dispatch) rather than running Stage 4 inline.
 *
 * Auth: accepts either
 *   - Authorization: Bearer <PIPELINE_SECRET>  (used by Vercel Cron / CI), or
 *   - Basic auth matching the admin credentials (used by the dashboard button).
 */
function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization') || '';
  const secret = process.env.PIPELINE_SECRET;

  if (secret && auth === `Bearer ${secret}`) return true;

  if (auth.startsWith('Basic ')) {
    try {
      const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
      const idx = decoded.indexOf(':');
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (
        u === (process.env.ADMIN_USERNAME || 'admin') &&
        p === process.env.ADMIN_PASSWORD &&
        (process.env.ADMIN_PASSWORD?.length ?? 0) > 0
      ) {
        return true;
      }
    } catch {
      /* ignore */
    }
  }
  return false;
}

async function dispatchWorkflow(): Promise<{ ok: boolean; message: string }> {
  const token = process.env.GH_DISPATCH_TOKEN;
  const repo = process.env.GH_REPO; // e.g. "owner/repo"
  if (!token || !repo) {
    return {
      ok: false,
      message:
        'Trigger received, but GH_DISPATCH_TOKEN/GH_REPO are not set. ' +
        'Run the pipeline via GitHub Actions or `npm run pipeline:run` locally.',
    };
  }
  const res = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/pipeline.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  );
  if (res.ok) {
    return { ok: true, message: 'Pipeline workflow dispatched on GitHub Actions.' };
  }
  const text = await res.text();
  return { ok: false, message: `GitHub dispatch failed: ${res.status} ${text}` };
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await dispatchWorkflow();
  return NextResponse.json(
    { ok: result.ok, message: result.message },
    { status: result.ok ? 200 : 202 }
  );
}

// Vercel Cron sends GET requests; support both.
export async function GET(req: Request) {
  return POST(req);
}
