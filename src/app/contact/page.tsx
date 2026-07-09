import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { buildMetadata } from '@/lib/seo';
import { ContactForm } from './contact-form';

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: `Get in touch with the ${siteConfig.name} team — corrections, suggestions, and partnership inquiries.`,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="mt-3 text-muted-foreground">
          Questions, corrections, tool suggestions, or partnership inquiries —
          we read everything. You can also email us directly at{' '}
          <a
            href="mailto:hello@getstackwise.tech"
            className="text-primary underline"
          >
            hello@getstackwise.tech
          </a>
          .
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
