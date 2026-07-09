import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. "/blog" or "/blog/ai-tools"
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageHref = (page: number) =>
    page === 1 ? basePath : `${basePath}/page/${page}`;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="flex items-center justify-center gap-2 py-8"
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
          rel="prev"
        >
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? 'page' : undefined}
          className={
            'rounded-md border px-3 py-2 text-sm ' +
            (page === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent')
          }
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
          rel="next"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
