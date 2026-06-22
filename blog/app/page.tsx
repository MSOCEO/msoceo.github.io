import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/config";
import { format } from "date-fns";
import Link from "next/link";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div>
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-2">{siteConfig.name}</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{siteConfig.description}</p>
        <p className="text-xs text-zinc-400 mt-2">当前模式：{siteConfig.mode === "static" ? "静态" : "动态"}</p>
      </section>

      <section>
        {posts.length === 0 ? (
          <p className="text-zinc-500">还没有文章，在 content/ 目录下创建 .md 文件开始写作。</p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link href={`/${post.slug}`} className="block">
                  <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                    <time>{format(new Date(post.date), "yyyy-MM-dd")}</time>
                    {post.category && <span className="text-zinc-400">· {post.category}</span>}
                  </div>
                  {post.description && (
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                </Link>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
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
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
