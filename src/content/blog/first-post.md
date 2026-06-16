---
title: '初墨：博客上线记'
description: '在Astro的帮助下，寒影博客正式上线。记录搭建过程中的选择与思考。'
pubDate: 2026-05-15
category: '技术'
tags: ['Astro', '前端', '博客']
heroImage: '/blog-placeholder-1.jpg'
---

## 缘起

一直想有一个属于自己的文字空间。不是公众号，不是知乎，不是任何平台——而是一块完全属于自己的数字土地。

## 为什么选择 Astro

在比较了 Next.js、Hugo、Hexo 等方案后，我最终选择了 Astro：

- **静态优先**：博客内容不需要 JS 运行时，生成纯 HTML 最好
- **组件化**：像写 React 一样写模板，但输出零 JS
- **Content Collections**：完美的 Markdown 管理方案
- **View Transitions**：页面切换动画开箱即用

## 技术栈

```typescript
const stack = {
  framework: 'Astro',
  styling: 'TailwindCSS',
  content: 'MDX + Markdown',
  deploy: 'GitHub Pages',
  theme: '寒影 · 墨迹',
};
```

## 设计理念

墨迹主题的灵感来自中国传统书法。纸纹背景、不规则圆角、双层阴影、衬线标题——每一个细节都在致敬"书写"这件事。

> 墨痕未干，字里行间皆是风景。

## 下一步

- [ ] Giscus 评论区
- [ ] 文章搜索
- [ ] RSS 订阅
- [ ] 多语言支持

博客刚起步，慢慢来。
