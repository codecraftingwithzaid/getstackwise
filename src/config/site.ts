export type CategorySlug =
  | 'dev-tools'
  | 'saas'
  | 'ai-tools'
  | 'web-dev';

export interface CategoryDef {
  slug: CategorySlug;
  name: string;
  description: string;
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'Get Stack Wise',
  // Falls back to a sane default for local dev / build without env.
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://getstackwise.tech',
  description:
    'Practical, US-focused coverage of developer tools, SaaS, AI tools, and modern web development — Next.js, Supabase, Vercel and the surrounding stack.',
  locale: 'en-US',
  // hreflang applied site-wide for US targeting
  hreflang: 'en-us',
  author: {
    name: 'Jordan Alvarez',
    handle: 'jordanbuilds',
    bio: 'Full-stack engineer with 10+ years shipping production web apps. Writes about the tools developers actually reach for.',
  },
  tagline: 'Smarter picks for your dev stack',
  publisher: {
    name: process.env.NEXT_PUBLIC_SITE_NAME || 'Get Stack Wise',
    logo: '/logo.svg',
  },
  social: {
    twitter: '@getstackwise',
  },
  adsenseClientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  gscVerification: process.env.NEXT_PUBLIC_GSC_VERIFICATION || '',
  postsPerPage: 9,
} as const;

export const categories: CategoryDef[] = [
  {
    slug: 'dev-tools',
    name: 'Developer Tools',
    description:
      'Editors, CLIs, CI/CD, testing, and the everyday tooling that speeds up shipping software in the US market.',
  },
  {
    slug: 'saas',
    name: 'SaaS Comparisons',
    description:
      'Head-to-head SaaS breakdowns with US pricing in USD, real use cases, and clear recommendations.',
  },
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    description:
      'AI coding assistants, LLM platforms, and applied AI tooling reviewed for real developer workflows.',
  },
  {
    slug: 'web-dev',
    name: 'Web Development',
    description:
      'Hands-on tutorials across Next.js, Supabase, Vercel, and the modern web stack.',
  },
];

export function getCategory(slug: string): CategoryDef | undefined {
  return categories.find((c) => c.slug === slug);
}

export const categorySlugs = categories.map((c) => c.slug);
