// ============================================================
// 生成 7 个国家攻略页（仿 thesilkloop.com 国家页结构）
// 用法：node _dev/build-site.js
// 数据源：site/travel-data.js（真实旅行资料）
// 说明：每国页 = 页头徽章行 + 签证/保险/sim 信息行 + 城市示意地图联动 +
//       编号城市卡（简介+著名景点）+ 交通怎么走 + 避坑/评价 + 实际花费
// ============================================================

const fs = require('fs');
const path = require('path');

// 读取数据源（在 Node 中执行，模拟浏览器全局）
const dataJs = fs.readFileSync(path.join(__dirname, '..', 'site', 'travel-data.js'), 'utf8');
const sandbox = { window: {}, module: { exports: {} }, console };
eval(dataJs);
const T = sandbox.window.TRAVEL || module.exports;

const OUT = path.join(__dirname, '..', 'site', 'destinations');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// 每国城市在示意地图上的布局（x, y 为 viewBox 0..400 / 0..220 内的点；纯示意）
const MAP_LAYOUT = {
  cn:  { w: 400, h: 180, pts: [['乌鲁木齐', 150, 60], ['伊犁', 205, 90], ['杭州', 330, 130]] },
  kz:  { w: 400, h: 180, pts: [['阿拉木图', 310, 70], ['阿克套', 60, 90]] },
  ge:  { w: 400, h: 180, pts: [['第比利斯', 210, 70], ['西格纳吉', 320, 60], ['姆兹赫塔', 170, 45], ['巴统', 55, 90]] },
  am:  { w: 400, h: 180, pts: [['久姆里', 120, 60], ['埃里温', 190, 100], ['塞凡镇', 260, 70]] },
  tr:  { w: 400, h: 180, pts: [['格雷梅', 280, 60], ['安塔利亚', 200, 120], ['卡什', 170, 135], ['费特希耶', 140, 125], ['伊斯坦布尔', 90, 40]] },
  eg:  { w: 400, h: 200, pts: [['达哈卜', 250, 120], ['亚历山大', 110, 40], ['马特鲁', 130, 75], ['锡瓦', 190, 110], ['开罗', 200, 55]] },
  ae:  { w: 400, h: 160, pts: [['迪拜', 200, 80]] }
};

function cityMap(c) {
  const lay = MAP_LAYOUT[c.id] || { w: 400, h: 180, pts: [] };
  const pts = lay.pts.map(([name, x, y]) => ({ name, x, y }));
  const dots = pts.map((p, i) =>
    `<a href="#city-${encodeURIComponent(p.name)}" class="map-city" data-city="${esc(p.name)}">` +
    `<circle class="map-dot" cx="${p.x}" cy="${p.y}" r="7"/>` +
    `<text class="map-num" x="${p.x}" y="${p.y}">${i + 1}</text>` +
    `<text class="map-label" x="${p.x}" y="${p.y + 22}" text-anchor="middle">${esc(p.name)}</text></a>`
  ).join('');
  const list = pts.map((p, i) =>
    `<a class="city-list-item" href="#city-${encodeURIComponent(p.name)}" data-city="${esc(p.name)}">` +
    `<span class="cl-no">${String(i + 1).padStart(2, '0')}</span>` +
    `<span class="cl-name">${esc(p.name)}</span>` +
    `<span class="cl-days">${cityDays(c, p.name)}</span></a>`
  ).join('');
  return `
  <div class="card" style="padding:18px;">
    <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
      <span class="eyebrow">INTERACTIVE · 城市示意</span>
      <span style="font-size:12px;color:var(--soft);">点击地图或列表开始探索（点位为示意布局）</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;align-items:start;">
      <div class="city-map-wrap"><svg viewBox="0 0 ${lay.w} ${lay.h}" class="city-map">${dots}</svg></div>
      <div class="city-list">${list}</div>
    </div>
  </div>`;
}

function cityDays(c, name) {
  const city = c.cities.find(x => x.name === name);
  return city && city.days ? city.days + ' 天' : '';
}

function pageFor(c) {
  const badgeRow = [`<span class="badge">${c.region}</span>`, `<span class="badge">${c.days} 天</span>`]
    .concat((c.tags || []).map(t => `<span class="badge soft">${esc(t)}</span>`))
    .concat([`<span class="badge">花费 ¥${(T.costs.byCountry[c.costKey] || {}).合计 || '—'}</span>`])
    .join('\n      ');

  const infoLines = [];
  if (c.visa) infoLines.push(['签证', c.visa + (c.visaDetail ? ' · ' + c.visaDetail : '')]);
  if (c.insurance) infoLines.push(['保险', c.insurance]);
  if (c.sim) infoLines.push(['电话卡', c.sim]);
  if (c.payment) infoLines.push(['支付', c.payment]);
  if (c.exchange) infoLines.push(['换汇', c.exchange]);
  if (c.accommodation) infoLines.push(['住宿', c.accommodation]);
  const infoHtml = infoLines.length ? `<div class="info-lines" style="margin-top:18px;">` +
    infoLines.map(([k, v]) => `<div class="info-line"><div class="il-key">${k}</div><div class="il-val">${v}</div></div>`).join('') +
    `</div>` : '';

  const cityCards = c.cities.map((city, i) => {
    const items = (city.items || []).map(it => `<div style="margin-bottom:4px;">· ${esc(it)}</div>`).join('');
    const sights = (city.sights || []).length
      ? `<div class="cc-sights"><b>著名景点</b>｜${esc(city.sights.join(' · '))}</div>` : '';
    const days = city.days ? `<span class="cc-days">${city.days} 天</span>` : '';
    return `<div class="city-card" id="city-${esc(city.name)}" data-city="${esc(city.name)}">` +
      `<div class="cc-no">${String(i + 1).padStart(2, '0')}</div>` +
      `<div class="cc-head"><h3>${esc(city.name)}</h3>${days}</div>` +
      (items ? `<p>${items}</p>` : '') + sights +
    `</div>`;
  }).join('');

  const transports = (c.transportDetail || []).map(t =>
    `<div class="transport-card"><div class="tc-route"><h3>${esc(t.route)}</h3>` +
    `<span class="tc-mode">${esc(t.mode)}</span></div>` +
    (t.cost ? `<div class="tc-meta"><span class="badge">${esc(t.cost)}</span></div>` : '') +
    (t.note ? `<div class="tc-detail">${esc(t.note)}</div>` : '') + `</div>`
  ).join('');

  const tips = (c.tips || []).map(t => `<div style="border-bottom:1px dashed var(--line);padding:9px 0;font-size:13.5px;">· ${esc(t)}</div>`).join('');
  const cost = T.costs.byCountry[c.costKey];

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(c.name)}攻略 · 亚欧非大环线</title>
<meta name="description" content="${esc(c.summary)}">
<link rel="stylesheet" href="../style.css">
</head>
<body data-page="destinations" data-sub="1">

<header class="site-header" id="siteHeader"></header>

<div class="container">
  <div class="page-head">
    <div class="crumb"><a href="../index.html">首页</a> / <a href="../index.html#countryDrag">国家</a> / ${esc(c.name)}</div>
    <span class="eyebrow">${esc(c.en)}</span>
    <h1 class="page-title">${esc(c.name)}</h1>
    <p class="lead" style="margin-top:10px;">${esc(c.summary)}</p>
    <div class="badge-row" style="margin-top:14px;">
      ${badgeRow}
    </div>
    ${infoHtml}
  </div>
</div>

<section class="section" id="cities">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">CITIES &amp; PLACES · 值得去的地方</span>
      <h2 class="block-title">城市与目的地</h2>
    </div>
    ${cityMap(c)}
    <div class="city-grid" style="margin-top:16px;">${cityCards}</div>
  </div>
</section>

${transports ? `<section class="section" id="transport">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">GETTING AROUND · 怎么走</span>
      <h2 class="block-title">怎么走</h2>
    </div>
    ${transports}
  </div>
</section>` : ''}

${(tips || cost) ? `<section class="section" id="tips-costs">
  <div class="container">
    <div class="compare-grid">
      ${tips ? `<div class="card">
        <div class="eyebrow">PITFALLS · 避坑</div>
        <h3 style="font-size:17px;margin:6px 0 8px;">避坑与提醒</h3>
        ${tips}
      </div>` : ''}
      ${cost ? `<div class="card">
        <div class="eyebrow">REAL COSTS · 实际花费</div>
        <h3 style="font-size:17px;margin:6px 0 8px;">${esc(c.name)}花了 ¥${cost.合计}</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 14px;font-size:13.5px;">
          ${T.costs.categories.map(k => `<div style="display:flex;justify-content:space-between;border-bottom:1px dashed var(--line);padding:4px 0;"><span>${k}</span><b>${cost[k] || '—'}</b></div>`).join('')}
        </div>
        <div style="font-size:12px;color:var(--soft);margin-top:10px;">汇率口径 1USD≈6.76CNY，详见<a href="../costs.html" style="border-bottom:1px solid var(--line);">花费页</a></div>
      </div>` : ''}
    </div>
    <div style="margin-top:14px;">
      <div class="card" style="border-color:var(--fg);">
        <div class="eyebrow">MY VERDICT · 我的评价</div>
        <p style="font-size:14.5px;margin-top:6px;">${esc(c.verdict || '（待补充）')}</p>
      </div>
    </div>
  </div>
</section>` : ''}

<section class="section" id="photos" style="padding-bottom:20px;">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">PHOTOS · 实拍</span>
      <h2 class="block-title">${esc(c.name)}实拍</h2>
    </div>
    <div class="photo-wall" id="photoWall">
      <div class="pw-more">照片整理中，即将上线</div>
    </div>
  </div>
</section>

<footer class="site-footer" id="siteFooter"></footer>

<script src="../travel-data.js"></script>
<script src="../app.js"></script>
<script>
(function () {
  // 城市地图 / 列表 / 卡片联动高亮
  var cards = document.querySelectorAll('.city-card');
  var items = document.querySelectorAll('.city-list-item, .map-city');
  function activate(name) {
    cards.forEach(function (card) {
      var on = card.getAttribute('data-city') === name;
      card.style.boxShadow = on ? '0 0 0 2px var(--fg)' : '';
      card.style.opacity = on ? '1' : (name ? '0.55' : '1');
    });
    items.forEach(function (it) {
      var on = it.getAttribute('data-city') === name;
      it.style.opacity = on ? '1' : (name ? '0.5' : '1');
    });
  }
  items.forEach(function (it) {
    it.addEventListener('click', function () { activate(it.getAttribute('data-city')); });
  });
})();
</script>
</body>
</html>
`;
}

// 生成
T.countries.forEach(c => {
  const file = path.join(OUT, c.id + '.html');
  fs.writeFileSync(file, pageFor(c), 'utf8');
  console.log('written', file, 'bytes=' + fs.statSync(file).size);
});
console.log('done: ' + T.countries.length + ' country pages');
