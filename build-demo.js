// 用样片日记真实数据构建 demo（dev 脚本，不进 npm 包）
const fs = require('fs');
const path = require('path');
const { generate } = require('./generate');
const BASE = 'D:/lcj/codes/sample-diary-map';
const LIVE = 'https://439436269-ctrl.github.io/sample-diary-map';

const list = JSON.parse(fs.readFileSync(path.join(BASE, 'episodes.json'), 'utf8'));
const src = fs.readFileSync(path.join(BASE, 'index.html'), 'utf8');
const m = src.match(/const EPS=\[([\s\S]*?)\n\];/);
if (!m) { console.error('EPS block not found in sample index.html'); process.exit(1); }
const raw = Function('return [' + m[1] + '\n]')();

const episodes = raw.map(r => {
  const e = list[r.n - 1];
  return {
    title: r.t,
    cover: `${LIVE}/img/e${String(r.n).padStart(2, '0')}.jpg`,
    link: `https://www.bilibili.com/video/${r.bv || e.bv}`,
    date: new Date((r.pub || e.pub) * 1000).toISOString(),
    durationSec: r.dur,
    views: r.view,
    danmaku: r.dan,
    location: r.loc ? { name: r.pl, lon: r.loc[0], lat: r.loc[1], certainty: r.c } : null,
    note: r.nt || undefined
  };
});
const config = {
  title: '影视飓风《样片日记》拍摄路线图',
  titleHtml: '影视飓风 <em>《样片日记》</em>拍摄路线图',
  subtitle: 'B 站合集 · 共 26 期',
  collectionUrl: 'https://space.bilibili.com/946974/lists/2046621?type=season',
  linkLabel: '在 B 站观看 ▶',
  credit: '<a href="https://openfreemap.org" target="_blank" rel="noopener">© OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OSM</a> · 视频数据 © bilibili',
  episodes
};
fs.writeFileSync(path.join(__dirname, 'demo', 'episodes.json'), JSON.stringify(config, null, 1), 'utf8');
fs.writeFileSync(path.join(__dirname, 'demo', 'map.html'), generate(config), 'utf8');
const located = episodes.filter(e => e.location).length;
console.log(`demo ok: ${episodes.length} episodes, ${located} located`);
