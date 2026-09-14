// ============================================================
// 亚欧非大环线 · 网站构建脚本（_dev/build-site.js）
// 用法：node _dev/build-site.js
// 说明：
//   - 读取 site/travel-data.js（单一数据源）+ travel-plan-viz/assets/map.js（地图引擎）
//   - 生成单文件手机优先站点 site/index.html
//   - 修改数据后重新运行本脚本即可重建
// ============================================================
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const data = require(path.join(ROOT, 'site', 'travel-data.js'));
const mapJs = fs.readFileSync(path.join(ROOT, 'travel-plan-viz', 'assets', 'map.js'), 'utf8');

// 城市级示意坐标（WGS-84）
const CO = data.CITY_COORDS;
// 旅程顺序（用于地图连线与点位编号；含返程杭州）
const MAP_ORDER = ['沅陵', '长沙', '乌鲁木齐', '伊犁', '阿拉木图', '阿克套', '第比利斯', '西格纳吉', '姆兹赫塔', '巴统', '久姆里', '埃里温', '塞凡镇', '格雷梅', '安塔利亚', '卡什', '费特希耶', '伊斯坦布尔', '达哈卜', '亚历山大', '马特鲁', '锡瓦', '开罗', '迪拜', '杭州'];

// 城市 → 国家 映射（由数据构建）
const CITY_COUNTRY = {};
data.countries.forEach((c) => {
  c.cities.forEach((city) => { CITY_COUNTRY[city.name] = c.name; });
});
CITY_COUNTRY['沅陵'] = '中国';
CITY_COUNTRY['长沙'] = '中国';

// 城市 → 天数 映射
const CITY_DAYS = {};
data.countries.forEach((c) => {
  c.cities.forEach((city) => { if (city.days) CITY_DAYS[city.name] = city.days; });
});

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- 地图点位 ----------
const mapPoints = MAP_ORDER.filter((n) => CO[n]).map((n) => {
  const country = CITY_COUNTRY[n] || '';
  const days = CITY_DAYS[n];
  return { lat: CO[n][0], lng: CO[n][1], name: n, time: country + (days ? ' · ' + days + ' 天' : '') };
});

// ---------- 区块渲染 ----------
function renderRoute() {
  return data.route.map((seg, i) => `
    <div style="padding:18px 0;border-bottom:1px solid var(--line);">
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
        <span style="font-size:12px;color:var(--accent);font-weight:600;letter-spacing:1px;">0${i + 1}</span>
        <span style="font-size:16px;font-weight:600;">${esc(seg.from)}</span>
        <span style="color:var(--muted);">→</span>
        <span style="font-size:16px;font-weight:600;">${esc(seg.to)}</span>
      </div>
      <div style="margin-top:6px;font-size:14px;">${esc(seg.how)}</div>
      ${seg.note ? `<div style="margin-top:3px;font-size:12.5px;color:var(--muted);">${esc(seg.note)}</div>` : ''}
    </div>`).join('');
}

function renderCountry(c, idx) {
  const meta = [];
  if (c.visa) meta.push(['签证', c.visa]);
  if (c.sim) meta.push(['电话卡', c.sim]);
  if (c.insurance) meta.push(['保险', c.insurance]);
  if (c.transport) meta.push(['交通', c.transport]);
  const cities = c.cities.map((city) => `
    <div style="padding:12px 0 12px 14px;border-left:2px solid var(--line);margin:14px 0 0 4px;">
      <div style="font-size:15px;font-weight:600;">
        ${esc(city.name)}
        ${city.days ? `<span style="font-size:11.5px;color:var(--muted);font-weight:400;"> · ${city.days} 天</span>` : ''}
      </div>
      ${city.items && city.items.length ? `
        <ul style="margin:6px 0 0;padding-left:16px;">
          ${city.items.map((it) => `<li style="font-size:13px;margin:4px 0;color:var(--ink-soft);">${esc(it)}</li>`).join('')}
        </ul>` : ''}
    </div>`).join('');
  return `
    <div id="c-${c.id}" style="padding:26px 0;border-bottom:1px solid var(--line);">
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;">
        <span style="font-size:26px;font-weight:700;">${esc(c.name)}</span>
        <span style="font-size:13px;color:var(--muted);">${c.days} 天</span>
        ${c.isHome ? `<span style="font-size:12px;color:var(--muted);">出发与返程</span>` : ''}
      </div>
      ${c.summary ? `<div style="margin-top:4px;font-size:13px;color:var(--muted);">${esc(c.summary)}</div>` : ''}
      ${meta.map(([k, v]) => `
        <div style="display:flex;gap:8px;margin-top:10px;font-size:13px;flex-wrap:wrap;">
          <span style="color:var(--accent);font-weight:600;flex:none;">${k}</span>
          <span style="color:var(--ink-soft);">${esc(v)}</span>
        </div>`).join('')}
      ${c.note ? `<div style="margin-top:8px;font-size:13px;color:var(--ink-soft);">${esc(c.note)}</div>` : ''}
      ${c.facts && c.facts.transport ? `
        <div style="margin-top:10px;font-size:13px;color:var(--ink-soft);">
          <span style="color:var(--accent);font-weight:600;">境内交通 </span>${c.facts.transport.join('；')}
        </div>` : ''}
      ${cities}
    </div>`;
}

function renderCosts() {
  const cats = data.costs.categories;
  const head = `<th style="text-align:left;padding:6px 8px;font-size:12px;white-space:nowrap;position:sticky;left:0;background:var(--bg);">国家</th>`
    + cats.map((c) => `<th style="text-align:right;padding:6px 8px;font-size:12px;white-space:nowrap;">${c}</th>`).join('')
    + `<th style="text-align:right;padding:6px 8px;font-size:12px;white-space:nowrap;">合计</th>`;
  const rows = Object.keys(data.costs.byCountry).map((cn) => {
    const row = data.costs.byCountry[cn];
    return `<tr>
      <td style="padding:7px 8px;font-size:12.5px;white-space:nowrap;position:sticky;left:0;background:var(--bg);font-weight:600;">${esc(cn)}</td>
      ${cats.map((c) => `<td style="padding:7px 8px;font-size:12.5px;text-align:right;color:var(--muted);white-space:nowrap;">${row[c] === '待补充' ? '—' : esc(row[c])}</td>`).join('')}
      <td style="padding:7px 8px;font-size:12.5px;text-align:right;color:var(--muted);white-space:nowrap;">${row['合计'] === '待补充' ? '—' : esc(row['合计'])}</td>
    </tr>`;
  }).join('');
  return `
    <div style="font-size:15px;color:var(--ink-soft);margin-top:8px;">${esc(data.costs.note)}</div>
    <div style="font-size:13px;color:var(--muted);margin-top:6px;">${esc(data.costs.status)}</div>
    <div style="overflow-x:auto;margin-top:14px;">
      <table style="border-collapse:collapse;width:100%;min-width:640px;font-variant-numeric:tabular-nums;">
        <thead><tr style="border-bottom:1px solid var(--line);">${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderPhotos() {
  return `<div style="border:1px dashed var(--line);border-radius:14px;padding:36px 20px;text-align:center;margin-top:12px;">
    <div style="font-size:14px;color:var(--ink-soft);">实拍区块 · 等待真实照片</div>
    <div style="font-size:12.5px;color:var(--muted);margin-top:6px;">${esc(data.photos.status)}</div>
  </div>`;
}

function renderVerification() {
  return `
    <div style="font-size:13.5px;color:var(--ink-soft);">${esc(data.verification.note)}</div>
    <ul style="margin:10px 0 0;padding-left:16px;font-size:13px;color:var(--ink-soft);">
      ${data.verification.priceToVerify.map((it) => `<li style="margin:4px 0;">${esc(it)}</li>`).join('')}
    </ul>`;
}

// ---------- 组装页面 ----------
const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.meta.title)} · ${esc(data.meta.signature)}</title>
<meta name="description" content="${esc(data.meta.tagline)}">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
:root {
  --bg: #FAF6F0; --ink: #22261F; --ink-soft: #3E4239; --muted: #767B70;
  --line: rgba(34,38,31,0.14); --accent: #A64B2A; --accent-dark: #8A3D21;
  --hero: #16221B; --hero-text: #F2EDE2; --hero-muted: rgba(242,237,226,0.66);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif; line-height: 1.65; -webkit-font-smoothing: antialiased; }
.wrap { max-width: 760px; margin: 0 auto; padding: 0 20px; }
nav.top { position: sticky; top: 0; z-index: 50; background: rgba(250,246,240,0.92); backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); }
nav.top .inner { max-width: 760px; margin: 0 auto; padding: 10px 20px; display: flex; align-items: center; gap: 16px; }
nav.top .brand { font-size: 14px; font-weight: 700; letter-spacing: 1px; white-space: nowrap; }
nav.top .links { display: flex; gap: 14px; overflow-x: auto; scrollbar-width: none; }
nav.top .links::-webkit-scrollbar { display: none; }
nav.top a { font-size: 13px; color: var(--muted); text-decoration: none; white-space: nowrap; }
nav.top a:hover { color: var(--ink); }
.hero { background: var(--hero); color: var(--hero-text); padding: 56px 0 44px; }
.hero .sig { font-size: clamp(34px, 9vw, 58px); font-weight: 700; letter-spacing: 2px; line-height: 1.2; }
.hero .title { margin-top: 10px; font-size: clamp(18px, 4.5vw, 26px); letter-spacing: 6px; }
.hero .sub { margin-top: 14px; font-size: 13.5px; color: var(--hero-muted); letter-spacing: 1px; }
.hero .tag { margin-top: 22px; font-size: 14px; color: var(--hero-muted); max-width: 30em; }
.sec { padding: 40px 0; border-bottom: 1px solid var(--line); }
.sec-label { font-size: 12px; color: var(--accent); font-weight: 600; letter-spacing: 2px; margin-bottom: 6px; }
.sec h2 { margin: 0 0 16px; font-size: 24px; letter-spacing: 1px; }
.sec p { margin: 8px 0; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.chip { font-size: 12.5px; color: var(--ink-soft); border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; }
.fact-row { display: flex; gap: 8px; margin-top: 10px; font-size: 13.5px; }
.fact-row .k { color: var(--accent); font-weight: 600; flex: none; }
#map { width: 100%; height: 420px; border-radius: 14px; border: 1px solid var(--line); z-index: 0; }
.route-pin { background: var(--accent); color: #fff; border-radius: 50%; text-align: center; font-weight: 700; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
.route-pin__num { line-height: 28px; font-size: 12px; }
.cost-total { font-size: clamp(30px, 7vw, 44px); font-weight: 700; color: var(--accent-dark); letter-spacing: 1px; }
.cost-total small { font-size: 14px; color: var(--muted); font-weight: 400; }
footer { padding: 34px 0 50px; font-size: 12.5px; color: var(--muted); }
footer .sig-line { font-size: 13px; color: var(--ink-soft); margin-bottom: 6px; letter-spacing: 1px; }
@media (min-width: 768px) {
  .sec { padding: 52px 0; }
  .hero { padding: 72px 0 56px; }
}
@media (max-width: 480px) {
  #map { height: 340px; }
}
</style>
</head>
<body>
<nav class="top"><div class="inner">
  <span class="brand">亚欧非大环线</span>
  <div class="links">
    <a href="#intro">简介</a><a href="#route">路线</a><a href="#map">地图</a><a href="#countries">国家</a><a href="#costs">花费</a><a href="#photos">实拍</a>
  </div>
</div></nav>

<header class="hero"><div class="wrap">
  <div class="sig">2.2万 · 6国 · 59天</div>
  <div class="title">亚欧非大环线</div>
  <div class="sub">2026.06.29 — 2026.08.26 · 一个人 · 极致轻量化</div>
  <div class="tag">${esc(data.meta.tagline)}</div>
</div></header>

<main class="wrap">

  <section class="sec" id="intro">
    <div class="sec-label">01 · 关于这段旅程</div>
    <h2>这是怎样一段旅行</h2>
    <p style="font-size:14.5px;color:var(--ink-soft);">2026 年 6 月 29 日从中国出发，8 月 26 日回到国内，共 59 天。先后经过哈萨克斯坦、格鲁吉亚、亚美尼亚、土耳其、埃及、阿联酋 6 个国家，总花费 ${esc(data.meta.totalCost)}，覆盖交通、住宿、餐饮、电话卡、门票、活动、潜水、租车、打车、签证等全部支出。</p>
    <p style="font-size:14.5px;color:var(--ink-soft);">一个人，极致轻量化。青旅多人间为主，大量公共交通，经常自己做饭，追求性价比，不追求把所有景点打卡完。</p>
    <div class="chips">${data.travelStyle.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    <div style="margin-top:22px;font-size:14.5px;color:var(--ink-soft);">
      <div class="sec-label" style="margin-bottom:8px;">支付方式</div>
      <div class="fact-row"><span class="k">国内</span><span>${esc(data.payment.domestic)}</span></div>
      <div class="fact-row"><span class="k">出发前</span><span>${esc(data.payment.before)}</span></div>
      <div class="fact-row"><span class="k">境外</span><span>${esc(data.payment.abroad)}</span></div>
      <div class="fact-row"><span class="k">埃及</span><span>${esc(data.payment.egypt)}</span></div>
    </div>
    <div style="margin-top:18px;font-size:14.5px;color:var(--ink-soft);">
      <div class="sec-label" style="margin-bottom:8px;">住宿</div>
      <div class="fact-row"><span class="k">方式</span><span>${esc(data.accommodation.style)}</span></div>
      <div class="fact-row"><span class="k">预订</span><span>${esc(data.accommodation.booking)}</span></div>
      <div class="fact-row"><span class="k">土耳其</span><span>${esc(data.accommodation.turkey)}</span></div>
    </div>
  </section>

  <section class="sec" id="route">
    <div class="sec-label">02 · 路线</div>
    <h2>每一段怎么走</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:6px;">重点展示国与国之间的走法，不是每天的行程。</p>
    ${renderRoute()}
  </section>

  <section class="sec" id="map">
    <div class="sec-label">03 · 地图</div>
    <h2>亚欧非大环线全览</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:12px;">城市级示意坐标；点击点位可查看城市与停留天数，并可跳转手机导航。</p>
    <div id="map"></div>
  </section>

  <section class="sec" id="countries">
    <div class="sec-label">04 · 国家攻略</div>
    <h2>6 国 · 真实经验</h2>
    <p style="font-size:13px;color:var(--muted);margin-bottom:6px;">签证、电话卡、支付、交通、住宿、避坑与我的评价。标注「待核实」的信息发布前会重新联网核实。</p>
    ${data.countries.map((c, i) => renderCountry(c, i)).join('')}
  </section>

  <section class="sec" id="costs">
    <div class="sec-label">05 · 花费</div>
    <h2>59 天，一共花了多少</h2>
    <div class="cost-total">¥22,400 <small>/ 59 天 · 2.2 万元</small></div>
    ${renderCosts()}
  </section>

  <section class="sec" id="photos">
    <div class="sec-label">06 · 实拍</div>
    <h2>真实照片</h2>
    ${renderPhotos()}
  </section>

  <section class="sec" id="verify">
    <div class="sec-label">07 · 信息核实</div>
    <h2>哪些信息会变化</h2>
    ${renderVerification()}
    <div style="margin-top:18px;font-size:12.5px;color:var(--muted);border-top:1px solid var(--line);padding-top:14px;">
      免责声明：本网站为一次真实个人旅行的记录与攻略整理。文中价格、签证政策、营业时间、班次等时效性信息均基于旅行期间的亲身经历与记忆，可能已过时；出行前请务必通过官方渠道核实。旅行者感受属于个人判断，不代表客观事实。
    </div>
  </section>

</main>

<footer class="wrap">
  <div class="sig-line">2.2万 · 6国 · 59天 · 亚欧非大环线</div>
  <div>一个人旅行 · 极致轻量化 · 青旅多人间 · 公共交通 · 自己做饭 · 追求性价比</div>
  <div style="margin-top:8px;">基于 travel-plan-viz 开源项目（MIT）构建 · 信息更新时间：待发布前核实后标注</div>
</footer>

<script id="trip-data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
${mapJs}
(function () {
  initTravelMap('map', ${JSON.stringify(mapPoints)}, {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors'
  });
})();
</script>
</body>
</html>`;

const out = path.join(ROOT, 'site', 'index.html');
fs.writeFileSync(out, html, 'utf8');
console.log('written: ' + out + ' (' + html.length + ' bytes, ' + mapPoints.length + ' map points)');
