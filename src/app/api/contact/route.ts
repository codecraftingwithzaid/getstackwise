import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  company: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 });
  }

  // Honeypot: bots fill hidden fields. Silently accept to avoid signaling.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  // TODO: send via email provider (Resend/SES) or store in Supabase `messages`.
  console.log('[contact] message from', parsed.data.email);

  return NextResponse.json({ ok: true });
}
