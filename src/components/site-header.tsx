import Link from 'next/link';
import Image from 'next/image';
import { categories, siteConfig } from '@/config/site';
import { Wordmark } from '@/components/wordmark';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg"
          aria-label={`${siteConfig.name} home`}
        >
          <Image
            src="/logo.svg"
            alt=""
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <Wordmark name={siteConfig.name} />
        </Link>
        <nav
          className="hidden md:flex items-center gap-6 text-sm font-medium"
          aria-label="Primary"
        >
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog/${c.slug}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/blog"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            All Posts
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            About
          </Link>
        </nav>
        <Link
          href="/blog"
          className="md:hidden text-sm font-medium text-primary"
        >
          Articles
        </Link>
      </div>
    </header>
  );
}
