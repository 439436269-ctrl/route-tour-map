'use strict';
const fs = require('fs');
const path = require('path');

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/**
 * 生成路线图页面 HTML（单文件，运行时依赖 maplibre CDN + OpenFreeMap 瓦片，需联网）。
 * @param {object} config
 *   title / titleHtml / subtitle / collectionUrl / collectionLabel / linkLabel / credit
 *   episodes: [{ title, cover, link, date, durationSec, views, danmaku,
 *                location: { name, lon, lat, certainty? }, note? }]
 *     certainty: 1=标题明确(实心钉，默认) 0=推测(空心钉)；无 location 的条目仅进目录
 * @returns {string} 完整 HTML
 */
function generate(config) {
  if (!config || !Array.isArray(config.episodes) || !config.episodes.length) {
    throw new Error('config.episodes must be a non-empty array');
  }
  config.episodes.forEach((e, i) => {
    if (!e || typeof e.title !== 'string' || !e.title) throw new Error(`episodes[${i}].title is required`);
    if (e.location && (typeof e.location.lon !== 'number' || typeof e.location.lat !== 'number')) {
      throw new Error(`episodes[${i}].location needs numeric lon/lat`);
    }
  });
  const title = esc(config.title || '路线图');
  const subtitle = esc(config.subtitle || `共 ${config.episodes.length} 期`);
  const credit = config.credit != null ? config.credit
    : '<a href="https://openfreemap.org" target="_blank" rel="noopener">© OpenFreeMap</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OSM</a>';
  const coll = config.collectionUrl
    ? `<a href="${esc(config.collectionUrl)}" target="_blank" rel="noopener">${esc(config.collectionLabel || '前往合集 ↗')}</a>` : '';
  const tokens = {
    '{{TITLE}}': title,
    '{{TITLE_HTML}}': config.titleHtml != null ? config.titleHtml : esc(config.title || '路线图'),
    '{{SUBTITLE}}': subtitle,
    '{{COLLECTION_HTML}}': coll,
    '{{CREDIT}}': credit,
    '{{LINK_LABEL}}': esc(config.linkLabel || '在 B 站观看 ▶'),
    '__CONFIG_JSON__': JSON.stringify(config).replace(/</g, '\\u003c')
  };
  let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  for (const k of Object.keys(tokens)) html = html.split(k).join(tokens[k]);
  if (html.includes('__CONFIG_JSON__') || /\{\{(TITLE|SUBTITLE|CREDIT|LINK|COLLECTION)/.test(html)) {
    throw new Error('template tokens were not fully replaced');
  }
  return html;
}

module.exports = { generate };
