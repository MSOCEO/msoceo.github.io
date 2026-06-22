import { siteConfig } from "@/lib/config";

export default function AdminPage() {
  if (siteConfig.mode === "static") {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">管理后台</h1>
        <p className="text-zinc-500 mb-4">当前运行在静态模式，管理后台不可用。</p>
        <p className="text-sm text-zinc-400">
          如需启用管理后台，请在环境变量中设置 <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">BLOG_MODE=dynamic</code>
        </p>
        <p className="text-sm text-zinc-400 mt-2">
          并配置数据库连接后重新部署。
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">管理后台</h1>
      <p className="text-zinc-500">动态模式管理后台 - 开发中</p>
    </div>
  );
}
