import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic-auth gate for /admin. Credentials come from env (ADMIN_USERNAME /
 * ADMIN_PASSWORD). This runs on the Edge runtime before the page renders.
 */
export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const user = process.env.ADMIN_USERNAME || 'admin';
  const pass = process.env.ADMIN_PASSWORD || '';

  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded);
      const idx = decoded.indexOf(':');
      const u = decoded.slice(0, idx);
      const p = decoded.slice(idx + 1);
      if (u === user && p === pass && pass.length > 0) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const config = {
  matcher: ['/admin/:path*'],
};
