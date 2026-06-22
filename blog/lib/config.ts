export const siteConfig = {
  name: process.env.SITE_NAME || "我的博客",
  description: process.env.SITE_DESCRIPTION || "一个简洁的双模博客",
  url: process.env.SITE_URL || "https://your-blog.vercel.app",
  mode: (process.env.BLOG_MODE || "static") as "static" | "dynamic",
  postsPerPage: 10,
  author: "博客作者",
  year: new Date().getFullYear(),
} as const;

export type SiteConfig = typeof siteConfig;
