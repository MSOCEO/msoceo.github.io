/**
 * 寒影博客引擎 — 构建入口脚本
 * 用法: node build.js
 */

import { build } from './lib/blog-engine/builder.js';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve('config.json');
if (!fs.existsSync(configPath)) {
  console.error('config.json 未找到，请先创建配置文件');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
config.sourceDir = path.resolve('posts');
config.outputDir = path.resolve('public');

await build(config);
console.log('构建完成！输出目录: public/');
