#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { generate } = require('./generate');

const args = process.argv.slice(2);
if (!args.length || args.includes('-h') || args.includes('--help')) {
  console.log(`route-tour-map — 从 episodes JSON 生成炫酷路线图页面

用法:
  route-tour-map <input.json> [-o <out.html>]

<input.json> 可以是完整 config 对象，或裸 episodes 数组。
输出默认: route-tour-map.html（当前目录）
配置字段: title/titleHtml/subtitle/collectionUrl/linkLabel/credit + episodes[]
  episode: { title, cover, link, date, durationSec, views, danmaku,
             location:{name,lon,lat,certainty}, note }
  certainty: 1=取景地明确(实心钉) 0=推测(空心钉)；无 location 仅进目录`);
  process.exit(0);
}
const input = args[0];
if (!fs.existsSync(input)) { console.error(`input not found: ${input}`); process.exit(1); }
let out = path.join(process.cwd(), 'route-tour-map.html');
for (let i = 1; i < args.length; i++) if (args[i] === '-o' && args[i + 1]) { out = path.resolve(args[++i]); }
let data = JSON.parse(fs.readFileSync(input, 'utf8'));
if (Array.isArray(data)) data = { episodes: data };
try {
  const html = generate(data);
  fs.writeFileSync(out, html, 'utf8');
  const located = data.episodes.filter(e => e.location).length;
  console.log(`✓ ${path.basename(out)}  ${data.episodes.length} 期（含坐标 ${located}）  ${(html.length / 1024).toFixed(1)} KB`);
} catch (e) { console.error('✗ ' + e.message); process.exit(1); }
