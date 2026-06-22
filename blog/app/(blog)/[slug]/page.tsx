import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "404" };
  return {
    title: post.title,
    description: post.description,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const html = await markdownToHtml(post.content);

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <time>{format(new Date(post.date), "yyyy年MM月dd日")}</time>
          {post.category && <span className="text-zinc-400">· {post.category}</span>}
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          ← 返回首页
        </Link>
      </footer>
    </article>
  );
}
