# 寒影拾光 · 主题更新文件

本次将 msoceo.github.io 博客主题从「寒影·墨迹」更新为「寒影拾光」深夜书房主题。

## 修改清单

| 文件 | 变更 |
|------|------|
| `src/consts.ts` | SITE_TITLE 改为「寒影拾光」，描述改为「在深夜书房里，拾取散落的光」 |
| `src/styles/global.css` | 深夜书房样式：深色背景 #0d0f14、星空/流星效果、靛蓝强调色、旧金点缀 |
| `src/styles/design-tokens.css` | 完整色彩令牌：深色/浅色双模式，靛蓝 #4f8bc9 + 旧金 #d4a373 |
| `src/components/Header.astro` | Logo 居中布局，左侧留空平衡，右侧主题切换按钮 |
| `src/components/Starfield.astro` | **新增** 55 颗动态闪烁星点 |
| `src/components/MeteorEffect.astro` | **新增** 4 颗流星划过效果 |
| `src/components/ReadingProgress.astro` | **新增** 顶部渐变色阅读进度条 |
| `src/components/PostCard.astro` | **新增** 文章卡片：奇偶交替悬停、胶囊标签、日期/阅读时长 |
| `src/components/Footer.astro` | **重写** 寒影拾光标语 |
| `src/components/ThemeToggle.astro` | **新增** 日/月图标主题切换（含 localStorage 持久化） |
| `src/layouts/BaseLayout.astro` | 集成星空、流星、进度条、居中 Header、新 Footer |
| `src/pages/index.astro` | 首页：居中标题 + 文章列表（PostCard 奇偶交替） |

## 需要手动合并的现有组件

以下组件在原博客中存在但此次未覆盖，合并时保留原文件：

- `src/components/RippleEffect.astro` — 涟漪点击效果
- `src/components/CustomCursor.astro` — 自定义光标
- `src/components/SearchModal.astro` — 搜索弹窗
- `src/components/Lightbox.astro` — 图片灯箱
- `src/components/ParallaxBg.astro` — 视差背景
- `src/components/MusicPlayer.astro` — 音乐播放器

如需在 BaseLayout 中恢复这些组件，在 `<body>` 内添加对应的 `<ComponentName />` 标签即可。

## 字体

Google Fonts 加载：Playfair Display + Inter + JetBrains Mono + Noto Serif SC + Noto Sans SC
 
