# 寒影博客模板

这是由 [云笺](https://yunjian.cloud) 平台的**寒影博客引擎**驱动的个人博客模板仓库。

## 特性

- 自研 Markdown 解析器，支持 GFM 表格、任务列表、KaTeX 数学公式、Mermaid 图表
- 6 套自研主题：default / ink / glass / paper / mono / aurora
- 全静态输出，零运行时依赖
- RSS / Atom / Sitemap 自动生成
- 客户端全文搜索
- GitHub Actions 一键部署到 GitHub Pages

## 快速开始

1. Fork 本仓库
2. 修改 `config.json`：设置博客标题、主题、社交链接
3. 在 `posts/` 目录创建 Markdown 文章
4. Push 到 `main` 分支，GitHub Actions 自动构建并部署到 GitHub Pages

## 本地开发

```bash
npm install
npm run build   # 构建静态站点到 public/
npm run serve   # 本地预览（http://localhost:3000）
```

## 文章格式

每篇文章以 `.md` 结尾，使用 YAML Front Matter：

```yaml
---
title: 文章标题
date: 2026-06-16
tags: [标签1, 标签2]
category: 分类
---
```

## 主题切换

在 `config.json` 中修改 `theme` 字段为以下任一值：

- `default` — 极简白底黑字（Bear Blog 风格）
- `ink` — 墨迹风格，深色底 + 暖金色点缀
- `glass` — 玻璃态深色主题
- `paper` — 纸张纹理暖色主题
- `mono` — 等宽字体极客主题
- `aurora` — 渐变炫彩主题

## 许可

MIT
