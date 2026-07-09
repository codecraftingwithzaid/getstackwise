import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  // TODO: forward to your ESP (Mailchimp/ConvertKit/Resend Audiences) or
  // persist to Supabase `subscribers`. Kept dependency-free for the MVP.
  console.log('[newsletter] subscribe:', parsed.data.email);

  return NextResponse.json({ ok: true });
}
