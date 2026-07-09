import Link from 'next/link';
import Image from 'next/image';
import type { PostSummary } from '@/lib/types';
import { getCategory } from '@/config/site';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
  post: PostSummary;
  priority?: boolean;
}

export function PostCard({ post, priority = false }: PostCardProps) {
  const category = getCategory(post.category);
  const href = `/blog/${post.category}/${post.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Link href={href} className="relative aspect-[16/9] overflow-hidden bg-muted">
        {post.ogImage ? (
          <Image
            src={post.ogImage}
            alt={post.heroImageAlt || post.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform group-hover:scale-105"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            {category?.name}
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          {category && (
            <Link
              href={`/blog/${category.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {category.name}
            </Link>
          )}
          <span aria-hidden>·</span>
          <time dateTime={post.publishDate}>{formatDate(post.publishDate)}</time>
        </div>
        <h2 className="mb-2 text-lg font-semibold leading-snug">
          <Link href={href} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        <p className="mb-4 flex-1 text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
        <div className="text-xs text-muted-foreground">
          {post.readingTimeMinutes} min read
        </div>
      </div>
    </article>
  );
}
