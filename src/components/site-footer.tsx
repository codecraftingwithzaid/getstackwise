import Link from 'next/link';
import { categories, siteConfig } from '@/config/site';

const legalLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/editorial-policy', label: 'Editorial Policy' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-bold text-lg mb-2">{siteConfig.name}</div>
          <p className="text-sm text-muted-foreground max-w-sm">
            {siteConfig.description}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm">Categories</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/blog/${c.slug}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-sm">Site</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-6 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </span>
          <span>
            Content is AI-assisted and editorially reviewed. See our{' '}
            <Link href="/editorial-policy" className="underline">
              editorial policy
            </Link>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
