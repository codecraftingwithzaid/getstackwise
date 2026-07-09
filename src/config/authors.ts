import type { Author } from '@/lib/types';

export const authors: Author[] = [
  {
    slug: 'jordan-alvarez',
    name: 'Jordan Alvarez',
    title: 'Founder & Lead Engineer',
    bio: 'Jordan is a full-stack engineer with over a decade of experience shipping production web applications for US startups and enterprises. He specializes in the React/Next.js ecosystem, serverless architectures on Vercel, and Postgres-backed products on Supabase. He founded this site to cut through marketing noise and test developer tools against real workflows.',
    credentials: [
      '10+ years building production web apps',
      'Former staff engineer at a US-based SaaS company',
      'Open-source contributor across the Next.js ecosystem',
    ],
    avatar: '/authors/jordan.png',
    social: {
      twitter: 'jordanbuilds',
      github: 'jordanbuilds',
    },
  },
  {
    slug: 'editorial-team',
    name: 'Editorial Team',
    title: 'Research & Review',
    bio: 'The editorial team researches trending developer topics, drafts articles with AI assistance, and runs every piece through an automated quality gate plus periodic human spot-checks for factual accuracy. See our editorial policy for the full process.',
    credentials: [
      'Automated quality gate on every published post',
      'Periodic human fact-checking of pricing, versions, and claims',
    ],
    avatar: '/authors/team.png',
  },
];

export function getAuthor(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export const authorSlugs = authors.map((a) => a.slug);
