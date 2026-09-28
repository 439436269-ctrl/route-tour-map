# @vfvrpq/route-tour-map

把「视频合集 / 旅行记录」一键生成为**电影感暗色路线图网页**：地球投影、大圆弧线轨迹、时间轴自动巡游、点击节点弹卡片直达原视频。零构建，输出单文件 HTML。

在线实例（本模板生成）：https://439436269-ctrl.github.io/sample-diary-map/

## 安装

```bash
npm i -D @vfvrpq/route-tour-map
# 或直接用 CLI（无需安装进项目）
npx @vfvrpq/route-tour-map episodes.json -o map.html
```

## 配置（`episodes.json`）

```jsonc
{
  "title": "我的系列视频路线图",
  "titleHtml": "我的系列 <em>视频</em> 路线图",   // 可选，支持内联高亮标签
  "subtitle": "共 12 期",                        // 可选
  "collectionUrl": "https://space.bilibili.com/...",  // 右上角合集链接，可省略
  "linkLabel": "在 B 站观看 ▶",                  // 卡片按钮文案
  "episodes": [
    {
      "title": "第一期标题",
      "cover": "https://example.com/cover.jpg",
      "link": "https://www.bilibili.com/video/BVxxxx",
      "date": "2026-01-10",
      "durationSec": 974,
      "views": 3235727,
      "danmaku": 15163,
      "location": { "name": "新疆 · 阿勒泰", "lon": 88.14, "lat": 47.84, "certainty": 0 },
      "note": "坐标为推测（可选说明）"
    }
  ]
}
```

- `location.certainty`：`1` 标题明确（实心钉，默认）/ `0` 据标题推测（空心钉）；**不传 `location` 的条目只进目录**，不进路线
- 也可以直接给裸数组 `[episode, ...]`

## 编程调用

```js
const { generate } = require('@vfvrpq/route-tour-map');
require('fs').writeFileSync('map.html', generate(require('./episodes.json')));
```

## 生成页面的能力

- 🌐 地球 / 平面双投影切换；暗色底图 + 琥珀色大圆弧线
- ▶ 巡游：按时间自动飞行，放大到城市级 + 图钉旁地名标签
- 🕐 底部时间轴：年份分组、任意跳集；目录抽屉；← → 键切换
- 🃏 节点卡片：封面、日期、时长、播放量、自定义说明，点封面/按钮直达 `link`
- 📱 移动端竖屏布局（卡片变底部抽屉）；`#ep=<序号>` 深链

生成的 HTML 运行时需要联网加载 maplibre-gl CDN 与 OpenFreeMap 瓦片（页脚版权已按其要求保留）。

## License

MIT
