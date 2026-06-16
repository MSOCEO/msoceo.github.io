---
title: '在 Linux 上搭建开发环境完全指南'
description: '从零开始在 Linux 上配置开发环境，涵盖终端美化、编辑器配置、Docker 使用等。'
pubDate: 2026-05-20
category: '技术'
tags: ['Linux', '开发环境', 'Docker']
heroImage: '/blog/images/cover-lake.jpg'
---

## 前言

一个舒适的开发环境能极大提升效率。本文记录我在 Linux 上的开发环境配置。

## 终端配置

### Zsh + Starship

```bash
# 安装 Zsh
sudo apt install zsh

# 安装 Starship 提示符
curl -sS https://starship.rs/install.sh | sh

# 在 .zshrc 中添加
eval "$(starship init zsh)"
```

### 常用别名

```bash
alias ll='ls -lah'
alias gs='git status'
alias gc='git commit'
alias gp='git push'
alias docker-clean='docker system prune -af'
```

## 编辑器：VS Code / Neovim

VS Code 作为主力编辑器，配合以下插件：

- **GitLens**：Git 增强
- **Tailwind CSS IntelliSense**
- **Prettier**
- **GitHub Copilot**

## Docker 开发环境

使用 Docker Compose 统一管理服务：

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: devpass
    ports:
      - '5432:5432'
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
```

## 小结

环境是工具，工具服务于创造。找到适合自己的配置，然后专注写代码。
