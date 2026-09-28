// 模板泛化手术：把样片日记特化内容替换为 {{TOKEN}} 与 CONFIG 驱动（一次性 dev 脚本）
const fs = require('fs');
const path = require('path');
const F = path.join(__dirname, '..', 'template.html');
let html = fs.readFileSync(F, 'utf8');
const reps = [
  // 标题与头部文案
  ['<title>影视飓风《样片日记》拍摄路线图 · 26 期全球取景地</title>', '<title>{{TITLE}}</title>'],
  ['<h1>影视飓风 <em>《样片日记》</em>拍摄路线图</h1>', '<h1>{{TITLE_HTML}}</h1>'],
  ['<div class="sub" id="hdsub">B 站合集 · 共 <b>26</b> 期 · 累计播放 <b id="hdv">–</b></div>',
   '<div class="sub" id="hdsub">{{SUBTITLE}} · 累计播放 <b id="hdv">–</b></div>'],
  ['<a href="https://space.bilibili.com/946974/lists/2046621?type=season" target="_blank" rel="noopener">前往 B 站合集 ↗</a>', '{{COLLECTION_HTML}}'],
  // 页脚版权
  ['<div id="cred"><a href="https://openfreemap.org" target="_blank" rel="noopener">© OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OSM</a> · 视频数据 © bilibili</div>',
   '<div id="cred">{{CREDIT}}</div>'],
  // 卡片交互泛化（任意链接）
  ['<a id="clink" target="_blank" rel="noopener">在 B 站观看 ▶</a>', '<a id="clink" target="_blank" rel="noopener">{{LINK_LABEL}}</a>'],
  ["$('clink').href='https://www.bilibili.com/video/'+e.bv;",
   "$('clink').href=e.link||'#';$('clink').style.display=e.link?'':'none';"],
  ["$('ccover').onclick=()=>{if(cur>=0)window.open('https://www.bilibili.com/video/'+EPS[cur].bv,'_blank')};",
   "$('ccover').onclick=()=>{if(cur>=0&&EPS[cur].link)window.open(EPS[cur].link,'_blank')};"],
  ['<div class="cover" id="ccover" title="点击在 B 站打开这期视频">', '<div class="cover" id="ccover" title="点击打开本期视频">'],
  // 深链泛化为 #ep=<序号>
  ["history.replaceState(null,'','#ep='+e.bv);", "history.replaceState(null,'','#ep='+e.n);"],
  ['const m=location.hash.match(/ep=(BV\\w+)/);', 'const m=location.hash.match(/ep=(\\d+)/);'],
  ['if(m){const e=EPS.find(x=>x.bv===m[1]);if(e)select(e.n);}', 'if(m){const e=EPS.find(x=>x.n===+m[1]);if(e)select(e.n);}']
];
for (const [from, to] of reps) {
  if (!html.includes(from)) { console.error('MISS: ' + from.slice(0, 70)); process.exit(1); }
  html = html.split(from).join(to);
}
// EPS 数据块 → CONFIG 驱动
const epsBlock = html.match(/const EPS=\[[\s\S]*?\];/);
if (!epsBlock) { console.error('MISS: EPS block'); process.exit(1); }
const runtime = `const CONFIG=__CONFIG_JSON__;
const EPS=(CONFIG.episodes||[]).map((e,i)=>({
  n:i+1,t:e.title,bv:e.bv||'',pub:Math.floor(new Date(e.date||Date.now()).getTime()/1000),
  dur:e.durationSec||0,view:e.views||0,dan:e.danmaku||0,img:e.cover||'',
  loc:e.location?[e.location.lon,e.location.lat]:null,
  pl:e.location?(e.location.name||null):null,
  c:e.location?(e.certainty===undefined?1:e.certainty):-1,
  nt:e.note||null,link:e.link||null
}));`;
html = html.replace(epsBlock[0], runtime);
fs.writeFileSync(F, html, 'utf8');
console.log('patched ok, size=' + html.length);
