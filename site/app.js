/* ============================================================
   亚欧非大环线 · 共享交互（site/app.js）
   依赖 window.TRAVEL（travel-data.js）
   功能：导航渲染 / 页脚渲染 / 搜索弹窗 / 常用小工具
   ============================================================ */
(function () {
  'use strict';
  if (!window.TRAVEL) return;
  var T = window.TRAVEL;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- 当前页面 ----------
  var body = document.body;
  var pageKey = body.getAttribute('data-page') || 'index';
  var isSub = body.getAttribute('data-sub') === '1';
  // 子页面（destinations/ 下）所有站内链接需加 ../ 前缀
  var prefix = isSub ? '../' : '';

  // ---------- 顶部导航 ----------
  function renderHeader() {
    var el = document.getElementById('siteHeader');
    if (!el) return;
    var links = T.nav.map(function (n) {
      var href = prefix + (n.page === 'index' ? 'index.html' : n.page + '.html');
      var active = n.page === pageKey ? ' class="active"' : '';
      return '<a href="' + href + '"' + active + '>' + esc(n.label) + '</a>';
    }).join('');
    el.innerHTML =
      '<div class="container">' +
        '<a class="brand" href="' + prefix + 'index.html">' + esc(T.meta.title) +
          '<span class="en">' + esc(T.meta.en) + '</span>' +
        '</a>' +
        '<nav class="nav-links">' + links +
          '<button class="nav-search" id="navSearch" aria-label="搜索">⌕</button>' +
        '</nav>' +
      '</div>';
  }

  // ---------- 页脚 ----------
  function renderFooter() {
    var el = document.getElementById('siteFooter');
    if (!el) return;
    var countryLinks = T.countries.map(function (c) {
      return '<li><a href="' + prefix + 'destinations/' + c.id + '.html">' + esc(c.name) + '</a></li>';
    }).join('');
    var navLinks = T.nav.map(function (n) {
      return '<li><a href="' + prefix + (n.page === 'index' ? 'index.html' : n.page + '.html') + '">' + esc(n.label) + '</a></li>';
    }).join('');
    el.innerHTML =
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div><h4>' + esc(T.meta.title) + '</h4>' +
            '<p style="font-size:12.5px;color:var(--soft);max-width:26em;">' + esc(T.meta.tagline) + '</p></div>' +
          '<div><h4>站内导航</h4><ul>' + navLinks + '</ul></div>' +
          '<div><h4>走过六国</h4><ul>' + countryLinks + '</ul></div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© 2026 ' + esc(T.meta.title) + ' · 独立攻略站</span>' +
          '<span>' + esc(T.meta.signature) + '</span>' +
          '<span>全网同名：向一丁</span>' +
        '</div>' +
      '</div>';
  }

  // ---------- 搜索弹窗 ----------
  function buildSearch() {
    var overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'searchOverlay';
    overlay.innerHTML =
      '<div class="so-head"><span class="eyebrow">SEARCH</span>' +
      '<button class="so-close" id="soClose">关闭 ×</button></div>' +
      '<input type="search" id="soInput" placeholder="搜索国家 / 城市 / 景点…" autocomplete="off">' +
      '<div class="so-hint">覆盖 6 国、全部收录城市与景点，支持中文与当地语言名称。</div>' +
      '<div class="so-results" id="soResults"></div>';
    document.body.appendChild(overlay);

    var input = overlay.querySelector('#soInput');
    var results = overlay.querySelector('#soResults');

    function doSearch(q) {
      q = q.trim().toLowerCase();
      if (!q) { results.innerHTML = ''; return; }
      var hits = T.searchIndex.filter(function (item) {
        return (item.title + ' ' + (item.en || '') + ' ' + item.k).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 30);
      results.innerHTML = hits.map(function (h) {
        return '<a class="so-item" href="' + prefix + h.href + '">' +
          '<span class="si-k">' + esc(h.k) + (h.en ? ' · ' + esc(h.en) : '') + '</span><br>' +
          esc(h.title) + '</a>';
      }).join('') || '<div class="so-item" style="color:var(--soft);">没有找到“' + esc(q) + '”</div>';
    }

    var btn = document.getElementById('navSearch');
    if (btn) btn.addEventListener('click', function () {
      overlay.classList.add('open');
      setTimeout(function () { input.focus(); }, 50);
      input.value = ''; results.innerHTML = '';
    });
    overlay.querySelector('#soClose').addEventListener('click', function () { overlay.classList.remove('open'); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.classList.remove('open'); });
    input.addEventListener('input', function () { doSearch(input.value); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.classList.remove('open');
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); overlay.classList.add('open'); }
    });
    // 搜索页内跳转：国家页带锚点城市
    results.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && a.hash) { setTimeout(function () { overlay.classList.remove('open'); }, 30); }
    });
  }

  // ---------- 子页面锚点子导航（chip-nav）----------
  function buildChipNav() {
    var nav = document.querySelector('.chip-nav');
    if (!nav) return;
    var items = nav.querySelectorAll('a');
    // 点击平滑滚动
    items.forEach(function (a) {
      a.addEventListener('click', function () {
        var id = a.getAttribute('href');
        if (id && id.charAt(0) === '#') {
          var t = document.querySelector(id);
          if (t) {
            var top = t.getBoundingClientRect().top + window.pageYOffset - 56;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        }
      });
    });
  }

  // ---------- 初始化 ----------
  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    buildSearch();
    buildChipNav();
  });
})();
