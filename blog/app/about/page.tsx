import { getPostBySlug } from "@/lib/posts";
import { markdownToHtml } from "@/lib/markdown";
import { notFound } from "next/navigation";

export default async function AboutPage() {
  const post = getPostBySlug("about");

  if (!post) notFound();

  const html = await markdownToHtml(post.content);

  return (
    <article>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
      </header>

      <div
        className="prose prose-zinc dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800" />
    </article>
  );
}
