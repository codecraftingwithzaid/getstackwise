import Link from 'next/link';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

const components = {
  a: ({ href = '', ...props }: React.ComponentProps<'a'>) => {
    const isInternal = href.startsWith('/') || href.startsWith('#');
    if (isInternal) {
      return <Link href={href} {...props} />;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    );
  },
  img: ({ src = '', alt = '' }: React.ComponentProps<'img'>) => (
    <Image
      src={src as string}
      alt={alt}
      width={1200}
      height={675}
      className="rounded-lg border"
      sizes="(max-width: 768px) 100vw, 768px"
    />
  ),
  table: (props: React.ComponentProps<'table'>) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
};

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary">
      <MDXRemote
        source={source}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
            ],
          },
        }}
      />
    </div>
  );
}
