import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

// Edge runtime is the supported/optimized runtime for ImageResponse and avoids
// a Node-runtime font-path resolution bug on Windows during static export.
export const runtime = 'edge';

// Default social share image for the whole site. Next generates a real PNG at
// build/request time, so the logo + brand appear on every share card and in
// SEO meta (og:image / twitter:image) unless a page sets its own image.
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function nameParts(name: string): [string, string] {
  const trimmed = name.trim();
  if (trimmed.includes(' ')) {
    const idx = trimmed.lastIndexOf(' ');
    return [trimmed.slice(0, idx), trimmed.slice(idx + 1)];
  }
  const m = /^([A-Z][a-z0-9]*)([A-Z].*)$/.exec(trimmed);
  return m ? [m[1], m[2]] : [trimmed, ''];
}

export default function OpengraphImage() {
  const [head, tail] = nameParts(siteConfig.name);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#0b1220',
          color: '#e8eef5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Logo mark: stacked tiers + badge */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{ width: 130, height: 40, borderRadius: 14, background: '#12996b' }} />
            <div style={{ width: 180, height: 40, borderRadius: 14, background: '#0d6b4a' }} />
            <div style={{ width: 230, height: 40, borderRadius: 14, background: '#0a3d2c' }} />
            <div style={{ width: 210, height: 12, borderRadius: 6, background: '#12b981', marginTop: 6 }} />
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: -6,
                width: 56,
                height: 56,
                borderRadius: 56,
                background: '#f5a623',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 34,
                color: '#0b1220',
              }}
            >
              ✓
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, letterSpacing: -2 }}>
              <span style={{ color: '#e8eef5' }}>{head}</span>
              {tail ? <span style={{ color: '#12b981' }}>&nbsp;{tail}</span> : null}
            </div>
            <div style={{ fontSize: 34, color: '#9fb0c3', marginTop: 8 }}>
              {siteConfig.tagline}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 30,
            color: '#7f92a6',
            maxWidth: 900,
          }}
        >
          Developer tools · SaaS comparisons · AI tools · Web development
        </div>
      </div>
    ),
    { ...size }
  );
}
