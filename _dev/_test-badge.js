const fs = require('fs');
const dataJs = fs.readFileSync('site/travel-data.js', 'utf8');
const sandbox = { window: {}, module: { exports: {} }, console };
eval(dataJs);
const T = sandbox.window.TRAVEL || module.exports;
const c = T.countries.find(x => x.id === 'eg');
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
const badgeRow = [`<span class="badge">${c.region}</span>`, `<span class="badge">${c.days} 天</span>`]
  .concat((c.tags || []).map(t => `<span class="badge soft">${esc(t)}</span>`))
  .concat([`<span class="badge">花费 ¥${(T.costs.byCountry[c.costKey] || {}).合计 || '—'}</span>`])
  .concat(c.exchangeRate ? [`<span class="badge">${esc(c.exchangeRate.label)} · ${esc(c.exchangeRate.updated)}</span>`] : [])
  .join('\n');
console.log('xr:', JSON.stringify(c.exchangeRate));
console.log('badgeRow:\n' + badgeRow);
