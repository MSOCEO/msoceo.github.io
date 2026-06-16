---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: d487d246f9ee1859d7c4ecb338bff0a3_f527c735697711f1a0095254002afed2
    ReservedCode1: ljDdt0dPbNSoiNzOb58mCkG6NllEreNw0Cf2x5J5ht0HFoGmfTJE/9lmwDDTRZHtu4NWIGm1mtIdsU/6f+T6U+SbsdJgtO9veY+amZls7qUHIGzYhCbEqoWhjEXiMMWE0sj9NwSSB8hyi5naYd6W0xi7uH1qgYFdeDsMdhG7rN04IF1XRmwmHGpcb3U=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: d487d246f9ee1859d7c4ecb338bff0a3_f527c735697711f1a0095254002afed2
    ReservedCode2: ljDdt0dPbNSoiNzOb58mCkG6NllEreNw0Cf2x5J5ht0HFoGmfTJE/9lmwDDTRZHtu4NWIGm1mtIdsU/6f+T6U+SbsdJgtO9veY+amZls7qUHIGzYhCbEqoWhjEXiMMWE0sj9NwSSB8hyi5naYd6W0xi7uH1qgYFdeDsMdhG7rN04IF1XRmwmHGpcb3U=
---

# 星迹互联 StarTrails — 设计系统

## 一、品牌定位

一个连接独立博客的宇宙。每位博主是一颗星，博客互联构成星轨。

| 维度 | 定义 |
|------|------|
| 品牌名 | 星迹互联 / StarTrails |
| 核心隐喻 | 宇宙星辰 — 每颗星 = 一个独立博客，星轨 = 互联网络 |
| 情感调性 | 探索感、归属感、专业信赖 |
| 目标用户 | 独立博主、技术写作者、内容创作者 |

## 二、配色体系

| Token | Hex | 用途 |
|-------|-----|------|
| `--color-brand` | `#6366f1` | 主品牌色（靛蓝），按钮、链接、强调 |
| `--color-brand-glow` | `rgba(99,102,241,0.15)` | 品牌光晕 |
| `--color-accent` | `#10b981` | 强调色（青绿），在线状态、成功、CTA |
| `--color-accent-glow` | `rgba(16,185,129,0.2)` | 青绿光晕 |
| `--color-bg-primary` | `#0a0a0f` | 主背景（深空黑） |
| `--color-bg-secondary` | `#12121a` | 次级背景（卡片区） |
| `--color-bg-card` | `rgba(255,255,255,0.03)` | 卡片磨砂底 |
| `--color-bg-card-hover` | `rgba(255,255,255,0.06)` | 卡片悬停 |
| `--color-border` | `rgba(255,255,255,0.06)` | 卡片边框 |
| `--color-border-hover` | `rgba(99,102,241,0.3)` | 卡片悬停边框（品牌色） |
| `--color-text-primary` | `#f1f1f3` | 主文字 |
| `--color-text-secondary` | `#9ca3af` | 次级文字 |
| `--color-text-muted` | `#6b7280` | 弱化文字 |

## 三、字体系统

| 层级 | 字体 | 大小 | 字重 | 行高 |
|------|------|------|------|------|
| Display | Space Grotesk | 56px / 3.5rem | 700 | 1.1 |
| H1 | Space Grotesk | 40px / 2.5rem | 700 | 1.2 |
| H2 | Space Grotesk | 32px / 2rem | 600 | 1.3 |
| H3 | Space Grotesk | 24px / 1.5rem | 600 | 1.4 |
| H4 | Space Grotesk | 20px / 1.25rem | 500 | 1.4 |
| Body L | DM Sans | 18px / 1.125rem | 400 | 1.6 |
| Body | DM Sans | 16px / 1rem | 400 | 1.6 |
| Body S | DM Sans | 14px / 0.875rem | 400 | 1.5 |
| Caption | DM Sans | 12px / 0.75rem | 400 | 1.5 |
| Mono | JetBrains Mono | 14px / 0.875rem | 400 | 1.6 |

Google Fonts:
```
Space Grotesk: 400,500,600,700
DM Sans: 400,500,700
JetBrains Mono: 400
```

## 四、间距规范

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | 4px | 紧密间距 |
| `--space-sm` | 8px | 小间距 |
| `--space-md` | 16px | 标准间距 |
| `--space-lg` | 24px | 大间距 |
| `--space-xl` | 32px | 区块间距 |
| `--space-2xl` | 48px | 区块大间距 |
| `--space-3xl` | 64px | 区域间距 |
| `--space-4xl` | 96px | Hero 间距 |

## 五、圆角与阴影

| Token | 值 |
|-------|-----|
| `--radius-sm` | 6px |
| `--radius-md` | 10px |
| `--radius-lg` | 16px |
| `--radius-xl` | 24px |
| `--radius-full` | 9999px |

阴影层次：
- 卡片: `0 1px 2px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)` 
- 卡片悬停: `0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)`
- 弹窗: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)`
- 品牌辉光: `0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1)`

## 六、特效体系

### 6.1 磨砂玻璃
```
background: rgba(255,255,255,0.03);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.06);
```

### 6.2 轨道光晕（背景装饰）
页面顶部/底部放置径向渐变圆形光斑：
- 品牌色光斑: `radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)`
- 青绿色光斑: `radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)`

### 6.3 粒子背景
Canvas 绘制微妙星点粒子，缓慢漂移，数量控制在 60-100 个。

### 6.4 过渡动画
- 默认过渡: `transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`
- 入场动画: 使用 `@keyframes fadeInUp` — opacity + translateY
- 错开延迟: 卡片列表使用 `animation-delay: calc(var(--index) * 0.05s)`

### 6.5 按钮
- 主按钮: 品牌色实底 + 辉光悬停
- 次按钮: 边框 + 透明底
- Ghost: 纯文字 + hover 底

## 七、页面结构

| 页面 | 路由 | 核心组件 |
|------|------|----------|
| 首页 | `/` | Hero 统计、特性卡片、最新收录、CTA |
| 随机跳转 | `/go` | 星轨穿越动画、倒计时、跳转 |
| 成员目录 | `/members` | 搜索栏、标签筛选、状态筛选、卡片网格 |
| 文章聚合 | `/feed` | 时间排序列表、分类筛选、无限滚动 |
| 申请加入 | `/join` | 表单、审核流程、标准说明 |
| 成员详情 | `/blog?id=xxx` | 博客信息卡片、文章列表、统计 |

## 八、组件状态

每个交互组件覆盖：
- **Default**: 静态初始状态
- **Hover**: 150ms cubic-bezier 过渡
- **Active/Focus**: 键盘焦点环 + 按压微缩放
- **Loading**: 骨架屏(Skeleton) — 脉冲动画灰色条
- **Empty**: 空状态插图 + 引导文案
- **Error**: 错误提示 + 重试按钮

## 九、响应式断点

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| Mobile | < 768px | 单列，导航折叠汉堡菜单 |
| Tablet | 768px - 1024px | 两列卡片网格 |
| Desktop | 1024px - 1440px | 三列卡片网格，侧边栏 |
| Wide | > 1440px | 最大宽度 1280px 居中 |

## 十、数据模型 (Supabase)

### members 表
```sql
id: uuid (PK)
name: text          -- 博客名称
url: text           -- 博客地址
description: text   -- 简介
tags: text[]        -- 标签数组
rss_url: text       -- RSS 地址
status: text        -- 'online' | 'offline' | 'pending'
favicon: text       -- 网站图标
joined_at: timestamptz
last_checked: timestamptz
```

### posts 表 (聚合文章)
```sql
id: uuid (PK)
member_id: uuid (FK → members)
title: text
url: text
summary: text
published_at: timestamptz
fetched_at: timestamptz
```

### applications 表 (申请)
```sql
id: uuid (PK)
blog_name: text
blog_url: text
description: text
tags: text[]
rss_url: text
applicant_email: text
status: text        -- 'pending' | 'approved' | 'rejected'
created_at: timestamptz
```
*（内容由AI生成，仅供参考）*
