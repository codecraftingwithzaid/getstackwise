import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="border-b bg-background">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-semibold">Admin · Content Ops</span>
          <span className="text-xs text-muted-foreground">Internal · noindex</span>
        </div>
      </div>
      <div className="container py-8">{children}</div>
    </div>
  );
}
