// _dev/build-demo.js —— 本地冒烟测试构建器（非上游项目内容，仅用于验证生成链路）
// 作用：按 page-contract.md 契约，用当前引擎（map.js / reminders.js）生成一个
//       单文件演示 HTML，并跑 validate.js 机械校验，证明「生成 → 校验」全链路在本机可用。
// 用法：node _dev/build-demo.js
// 说明：演示行程为合成数据（明确标注冒烟测试），不是任何真实行程。
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const mapJs = fs.readFileSync(path.join(ROOT, 'travel-plan-viz', 'assets', 'map.js'), 'utf8');
const remindersJs = fs.readFileSync(path.join(ROOT, 'travel-plan-viz', 'assets', 'reminders.js'), 'utf8');

// —— 演示行程数据（合成、非真实）——
const trip = {
  title: '引擎冒烟测试 · 演示行程（非真实行程）',
  startDate: '2026-10-01',
  colorScheme: 'teal',
  preTrip: {
    weather: {
      summary: '演示数据：10 月初两地均约 20–26°C，早晚温差大，白天晴朗少雨',
      typhoon: '演示数据：无台风季提示'
    },
    packing: '演示数据：轻薄长袖 + 外套，舒适步行鞋',
    payment: '演示数据：信用卡 + 少量当地现金',
    apps: ['演示 App A', '演示 App B'],
    ticketTip: '演示数据：热门景点建议提前 3–7 天网上购票'
  },
  flights: {
    booked: [{ label: '示例已订航班', code: 'XX 123', time: '08:00–12:00' }],
    candidates: [
      { label: '示例候选班次 1', code: 'XX 456', time: '09:30–13:30', note: '直飞 · 价位参考区间请自行核实' },
      { label: '示例候选班次 2', code: 'YY 789', time: '14:00–18:00', note: '经停 · 价位参考区间请自行核实' }
    ]
  },
  hotelAreas: [
    {
      area: '示例住宿片区',
      reason: '演示数据：靠近主要景点、交通便利',
      options: [
        { tier: '经济', name: '示例经济酒店', priceRange: '约 ¥400/晚', note: '演示数据' },
        { tier: '中档', name: '示例中档酒店', priceRange: '约 ¥800/晚', note: '演示数据' },
        { tier: '高端', name: '示例高端酒店', priceRange: '约 ¥1600/晚', note: '演示数据' }
      ]
    }
  ],
  disclaimer: '本页全部信息（天气、航班、酒店、餐厅、景点、门票、价格、营业时间、评分、活动等）均为 AI 基于公开资料整理的参考建议，可能不准确或已过时，不保证与实时情况一致；请务必在官方渠道 / 订票订房 / 地图等 App 上核实后再做决定或前往。',
  tips: ['演示贴士 1：户外活动尽量安排在上午与傍晚', '演示贴士 2：热门餐厅避开 12–13 点与 18–20 点高峰', '演示贴士 3：本页为引擎冒烟测试演示，非真实行程'],
  reminders: [
    { item: '演示：热门景点门票', leadDays: 7 },
    { item: '演示：往返机票', leadDays: 14 }
  ],
  days: [
    {
      date: '2026-10-01',
      weekday: '周四',
      theme: '演示 · 伊斯坦布尔',
      tips: ['演示当日贴士'],
      slots: [
        {
          period: 'morning',
          name: '圣索菲亚大教堂（演示点位）',
          time: '09:00–12:00',
          lat: 41.0086, lng: 28.9802,
          photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hagia_Sophia_Mars_2013.jpg',
          rating: 4.8,
          review: '演示点评：拜占庭建筑巅峰',
          openingHours: '演示：09:00–17:00',
          ticketPrice: '演示参考价',
          transport: { mode: '示例：步行', fare: '免费', duration: '约 10 分钟' },
          needsBooking: false, leadDays: 0
        },
        {
          period: 'noon',
          name: '蓝色清真寺（演示点位）',
          time: '13:00–15:00',
          lat: 41.0054, lng: 28.9768,
          photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Blue_Mosque_Istanbul.jpg',
          rating: 4.7,
          review: '演示点评：六座宣礼塔',
          needsBooking: true, leadDays: 3
        }
      ],
      dining: [
        { meal: '午餐', place: '演示餐厅', hours: '11:00–22:00', dishes: [{ name: '演示菜 1', price: '¥80' }] }
      ]
    },
    {
      date: '2026-10-02',
      weekday: '周五',
      theme: '演示 · 开罗',
      slots: [
        {
          period: 'morning',
          name: '吉萨金字塔群（演示点位）',
          time: '08:00–11:00',
          lat: 29.9792, lng: 31.1342,
          photo: 'https://commons.wikimedia.org/wiki/Special:FilePath/Giza_pyramids.jpg',
          rating: 4.9,
          review: '演示点评：世界奇迹',
          ticketPrice: '演示参考价',
          transport: { mode: '示例：包车', fare: '演示', duration: '约 40 分钟' },
          needsBooking: false, leadDays: 0
        }
      ],
      dining: []
    }
  ]
};

const points = [];
trip.days.forEach((day) => {
  (day.slots || []).forEach((s) => {
    points.push({ lat: s.lat, lng: s.lng, name: s.name, time: s.time });
  });
});

const tripJson = JSON.stringify(trip).replace(/</g, '\\u003c'); // 防止 </script> 提前闭合

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${trip.title}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<style>
  :root { --accent: #0f766e; --bg: #f8fafc; --card: #ffffff; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif; background: var(--bg); color: #1e293b; line-height: 1.6; }
  .wrap { max-width: 920px; margin: 0 auto; padding: 16px; }
  header.hero { background: linear-gradient(135deg, var(--accent), #134e4a); color: #fff; border-radius: 16px; padding: 24px; margin-bottom: 16px; }
  header.hero h1 { margin: 0 0 4px; font-size: 22px; }
  header.hero .sub { opacity: .85; font-size: 14px; }
  .card { background: var(--card); border-radius: 12px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .card h2 { margin: 0 0 12px; font-size: 17px; border-left: 4px solid var(--accent); padding-left: 8px; }
  #map { height: 360px; border-radius: 12px; z-index: 0; }
  .slot { display: flex; gap: 12px; margin-bottom: 14px; }
  .slot-photo { width: 110px; height: 82px; flex: none; border-radius: 8px; background: linear-gradient(135deg, #d1fae5, #ccfbf1); display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .slot-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .slot-photo .ph-fallback { font-size: 12px; color: #0f766e; padding: 4px; text-align: center; }
  .slot h3 { margin: 0 0 4px; font-size: 15px; }
  .slot .meta { font-size: 13px; color: #64748b; }
  .badge { display: inline-block; background: #fef3c7; color: #92400e; border-radius: 999px; padding: 2px 10px; font-size: 12px; margin-top: 4px; }
  .pretrip-todo { list-style: none; padding: 0; margin: 0; }
  .todo-item { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
  .todo-deadline { color: #b45309; font-weight: 600; }
  .grid2 { display: grid; grid-template-columns: 1fr; gap: 12px; }
  .route-pin { background: var(--accent); color: #fff; border-radius: 50%; text-align: center; font-weight: 700; border: 2px solid #fff; }
  .route-pin__num { line-height: 28px; }
  .disclaimer { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; font-size: 13px; color: #78350f; }
  @media (min-width: 768px) {
    .grid2 { grid-template-columns: 1fr 1fr; }
    .wrap { padding: 24px; }
    #map { height: 440px; }
    header.hero h1 { font-size: 28px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <h1>${trip.title}</h1>
    <div class="sub">出发日期 ${trip.startDate} · 引擎冒烟测试演示页（非真实行程）</div>
  </header>

  <section class="card">
    <h2>出发前待办</h2>
    <div id="checklist"></div>
  </section>

  <section class="card">
    <h2>行前须知</h2>
    <p><strong>天气：</strong>${trip.preTrip.weather.summary}</p>
    <p><strong>台风/极端天气：</strong>${trip.preTrip.weather.typhoon}</p>
    <p><strong>穿搭：</strong>${trip.preTrip.packing}</p>
    <p><strong>支付：</strong>${trip.preTrip.payment}</p>
    <p><strong>必备 App：</strong>${trip.preTrip.apps.join('、')}</p>
    <p><strong>购票时机：</strong>${trip.preTrip.ticketTip}</p>
  </section>

  <div class="grid2">
    <section class="card">
      <h2>航班</h2>
      ${trip.flights.booked.map(f => `<p>✅ 已预订：${f.label} ${f.code} ${f.time}</p>`).join('')}
      ${trip.flights.candidates.map(f => `<p>🕐 待选 · 请自行核实：${f.label} ${f.code} ${f.time}（${f.note}）</p>`).join('')}
    </section>
    <section class="card">
      <h2>酒店（片区 + 价位）</h2>
      ${trip.hotelAreas.map(h => `
        <p><strong>${h.area}</strong> — ${h.reason}</p>
        ${h.options.map(o => `<p>${o.tier}：${o.name} ${o.priceRange}（${o.note}）</p>`).join('')}
      `).join('')}
    </section>
  </div>

  <section class="card">
    <h2>路线地图</h2>
    <div id="map"></div>
  </section>

  ${trip.days.map(day => `
    <section class="card">
      <h2>${day.date} · ${day.weekday} ${day.theme ? '· ' + day.theme : ''}</h2>
      ${(day.tips || []).map(t => `<p class="meta">💡 ${t}</p>`).join('')}
      ${day.slots.map(s => `
        <div class="slot">
          <div class="slot-photo">
            <img src="${s.photo}" alt="${s.name}" loading="lazy" onerror="this.style.display='none'">
            <span class="ph-fallback" style="display:none">${s.name}</span>
          </div>
          <div>
            <h3>${s.name} ${s.rating ? '⭐' + s.rating : ''}</h3>
            <div class="meta">${s.time}${s.review ? ' · ' + s.review : ''}</div>
            ${s.openingHours ? `<div class="meta">营业：${s.openingHours}</div>` : ''}
            ${s.ticketPrice ? `<div class="meta">门票参考：${s.ticketPrice}</div>` : ''}
            ${s.transport ? `<div class="meta">交通：${s.transport.mode}（${s.transport.duration}）</div>` : ''}
            <span data-needs-booking="${s.needsBooking ? 1 : 0}" data-lead-days="${s.leadDays || 0}"></span>
          </div>
        </div>
      `).join('')}
      ${(day.dining || []).map(d => `
        <p class="meta">🍜 ${d.meal}：${d.place}（${d.hours}）${d.dishes.map(x => `${x.name} ${x.price}`).join(' / ')}</p>
      `).join('')}
    </section>
  `).join('')}

  <section class="card">
    <h2>全程贴士</h2>
    <ul>${trip.tips.map(t => `<li>${t}</li>`).join('')}</ul>
  </section>

  <section class="card disclaimer">${trip.disclaimer}</section>
</div>

<script id="trip-data" type="application/json">${tripJson}</script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
${remindersJs}
${mapJs}
(function () {
  var reminders = computeReminders(${JSON.stringify(trip.startDate)}, ${JSON.stringify(trip.reminders)});
  document.getElementById('checklist').innerHTML = renderChecklistHTML(reminders);
  document.querySelectorAll('[data-needs-booking="1"]').forEach(function (el) {
    el.insertAdjacentHTML('beforeend', reminderBadgeHTML(Number(el.dataset.leadDays)));
  });
  initTravelMap('map', ${JSON.stringify(points)});
})();
</script>
</body>
</html>`;

const out = path.join(ROOT, 'samples', 'demo-引擎冒烟测试-旅行计划.html');
fs.writeFileSync(out, html, 'utf8');
console.log('written: ' + out + ' (' + html.length + ' bytes)');
