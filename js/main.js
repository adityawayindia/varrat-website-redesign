/* VARRAT landing page behaviour: language toggle, slider, counters, carousels, donate widget. */
(function () {
  'use strict';

  var PH = ['1563366342', '1563357912', '1563349196', '1563362306', '1563366485', '1563363826', '1563363892', '1563364032']
    .map(function (n) { return 'https://varrat.org/public/upload/gallery/slider/' + n + '.jpeg'; });
  var BASE = 'https://varrat.org/index.php/page';
  var FB_PAGE = 'https://www.facebook.com/varrat.varrat.7/';
  /* Paste public Facebook post URLs here to show real posts in the carousel (replaces the placeholder cards). */
  var FB_POSTS = [];
  var SLIDE_MS = 6000;

  var L = window.LISTS, OD = window.OD;
  var state = { lang: 0, active: 0, elapsed: 0, paused: false, amt: 1, monthly: false, count: 0, menuOpen: false };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); };
  var t = function (pair) { return pair[state.lang]; };
  var digits = function (s) { return state.lang ? String(s).replace(/[0-9]/g, function (d) { return '୦୧୨୩୪୫୬୭୮୯'[d]; }) : String(s); };
  var inr = function (n) { return digits(n.toLocaleString('en-IN')); };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- static text ---------- */
  function applyStatic() {
    $$('[data-i18n]').forEach(function (node) {
      if (!('en' in node.dataset)) node.dataset.en = node.textContent;
      var key = node.dataset.i18n;
      node.textContent = state.lang && (key in OD) ? OD[key] : node.dataset.en;
    });
    $$('[data-i18n-placeholder]').forEach(function (node) {
      if (!('en' in node.dataset)) node.dataset.en = node.getAttribute('placeholder') || '';
      var key = node.dataset.i18nPlaceholder;
      node.setAttribute('placeholder', state.lang && (key in OD) ? OD[key] : node.dataset.en);
    });
    document.documentElement.lang = state.lang ? 'or' : 'en';
    $$('.lang__btn').forEach(function (b) { b.classList.toggle('is-active', (b.dataset.lang === 'od') === !!state.lang); });
    $('#menuBtn').textContent = t(state.menuOpen ? L.ui.close : L.ui.menu);
  }

  /* ---------- social icons ---------- */
  var ICONS = [
    ['Facebook', FB_PAGE, 16, '<path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.7v8h3.3z"/>'],
    ['Instagram', 'https://www.instagram.com/', 17, '<rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1"/>'],
    ['X', 'https://x.com/', 15, '<path d="M17.8 3h3l-6.5 7.5L22 21h-6l-4.7-6.1L5.9 21h-3l7-8L2.4 3h6.1l4.2 5.6L17.8 3zm-1 16.2h1.7L7.7 4.7H5.9l10.9 14.5z"/>'],
    ['LinkedIn', 'https://www.linkedin.com/', 16, '<path d="M6.5 8.5H3.2V20h3.3V8.5zM4.9 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.8 13.4c0-3.1-1.7-4.1-3.9-4.1-1.5 0-2.4.8-2.8 1.5V8.5h-3.2V20h3.3v-6.1c0-1.6.5-2.6 1.8-2.6s1.5 1.1 1.5 2.6V20h3.3v-6.6z"/>'],
    ['WhatsApp', 'https://wa.me/919437450283', 17, '<path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3zm0 1.8a7.2 7.2 0 11-3.7 13.4l-.3-.2-2.4.6.7-2.3-.2-.3A7.2 7.2 0 0112 4.8zm-2.8 3.4c-.2 0-.5.1-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.8 2.6.6 3.1.6.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.8-.4-1.7-1-2.4-2.1-.2-.3 0-.4.1-.5l.4-.5c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.6-.4z"/>'],
    ['YouTube', 'https://www.youtube.com/channel/UCiIeOXq5zv8v7NrAbk1zmrw', 18, '<path fill-rule="evenodd" d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z"/>']
  ];
  $$('[data-social]').forEach(function (box) {
    box.classList.add('social--' + box.dataset.social);
    box.innerHTML = ICONS.map(function (i) {
      return '<a href="' + i[1] + '" target="_blank" rel="noopener" aria-label="' + i[0] + '"><svg width="' + i[2] + '" height="' + i[2] + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' + i[3] + '</svg></a>';
    }).join('');
  });

  /* ---------- photos ---------- */
  $$('[data-photo]').forEach(function (n) { n.style.backgroundImage = 'url(' + PH[+n.dataset.photo] + ')'; });

  /* ---------- hero slider ---------- */
  var slidesBox = $('#slides'), dotsBox = $('#dots'), slider = $('#slider');
  slidesBox.innerHTML = PH.map(function (src) { return '<div class="slide"><div class="photo" style="background-image:url(' + src + ')"></div></div>'; }).join('');
  dotsBox.innerHTML = PH.map(function (_, i) { return '<button class="slider__dot" aria-label="Go to slide ' + (i + 1) + '" data-i="' + i + '"><i></i></button>'; }).join('');
  var slideEls = $$('.slide', slidesBox), dotEls = $$('.slider__dot', dotsBox);

  function renderSlider() {
    var s = L.slides[state.active];
    slideEls.forEach(function (el, i) { el.classList.toggle('is-active', i === state.active); });
    $('#slideNo').textContent = digits(pad2(state.active + 1)) + ' / ' + digits('08');
    slidesBox.children[state.active].querySelector('.photo').setAttribute('aria-label', t(s.title));
  }
  function paintDots() {
    dotEls.forEach(function (d, i) {
      d.firstChild.style.width = (i < state.active ? 100 : i === state.active ? state.elapsed / SLIDE_MS * 100 : 0) + '%';
    });
  }
  function go(i) { state.active = (i + PH.length) % PH.length; state.elapsed = 0; renderSlider(); paintDots(); }
  dotsBox.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) go(+b.dataset.i); });
  $('#prev').addEventListener('click', function () { go(state.active - 1); });
  $('#next').addEventListener('click', function () { go(state.active + 1); });
  slider.addEventListener('mouseenter', function () { state.paused = true; });
  slider.addEventListener('mouseleave', function () { state.paused = false; });
  setInterval(function () {
    if (state.paused || document.hidden) return;
    state.elapsed += 50;
    if (state.elapsed >= SLIDE_MS) go(state.active + 1); else paintDots();
  }, 50);

  /* ---------- rendered lists ---------- */
  function renderStats() {
    $('#stats').innerHTML = L.stats.map(function (s) {
      return '<div class="stat"><div class="stat__val" data-n="' + s.n + '" data-plus="' + s.plus + '"></div><div class="stat__txt"><div class="stat__label">' + esc(t(s.label)) + '</div><div class="stat__note">' + esc(t(s.note)) + '</div></div></div>';
    }).join('');
    paintCounters();
  }
  function paintCounters() {
    $$('.stat__val').forEach(function (v) {
      v.parentNode.style.setProperty('--g', state.count);
      v.textContent = inr(Math.round(+v.dataset.n * state.count)) + (v.dataset.plus === 'true' ? '+' : '');
    });
  }
  function runCounters() {
    var t0 = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - t0) / 1800);
      state.count = 1 - Math.pow(1 - p, 3);
      paintCounters();
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function renderThreeC() {
    $('#threeC').innerHTML = L.threeC.map(function (c) {
      return '<div class="threec__card" style="--c:' + c.c + '"><i>C</i><span>' + esc(t(c.title)) + '</span></div>';
    }).join('');
  }
  function renderBoard() {
    $('#board').innerHTML = L.board.map(function (b) {
      return '<div class="board__item"><small>' + esc(t(b.role)) + '</small><span>' + esc(t(b.name)) + '</span></div>';
    }).join('');
  }
  function renderThemes() {
    $('#themes').innerHTML = L.themes.map(function (th) {
      return '<a class="theme reveal is-in" style="--c:' + th.c + '" href="' + BASE + '/project/' + th.href + '"><div class="photo" style="background-image:url(' + PH[th.img] + ')"></div><div class="theme__shade"></div><div class="theme__body"><span class="theme__tag">' + esc(t(th.tag)) + '</span><span class="theme__title">' + esc(t(th.title)) + '</span><span class="theme__items">' + esc(t(th.items)) + '</span></div></a>';
    }).join('');
  }
  function renderSteps() {
    $('#steps').innerHTML = L.steps.map(function (s, i) {
      return '<div class="step" style="--c:' + s.c + '"><div class="step__top"><span class="step__n">' + digits(pad2(i + 1)) + '</span><strong>' + esc(t(s.title)) + '</strong></div><p>' + esc(t(s.text)) + '</p></div>';
    }).join('');
  }
  function renderDistricts() {
    $('#districts').innerHTML = L.districts.map(function (d, i) {
      return '<div class="district" data-i="' + i + '"><i>' + digits(pad2(i + 1)) + '</i><span>' + esc(t(d)) + '</span></div>';
    }).join('');
  }
  function highlightDistrict(i) {
    var f = $('#mapFrame');
    if (f && f.contentWindow) f.contentWindow.postMessage({ type: 'hl', i: i }, '*');
  }
  $('#districts').addEventListener('mouseover', function (e) { var d = e.target.closest('.district'); if (d) highlightDistrict(+d.dataset.i); });
  $('#districts').addEventListener('mouseleave', function () { highlightDistrict(-1); });

  function renderMilestones() {
    $$('.tile', $('#bento')).forEach(function (n) { n.remove(); });
    $('#bento').insertAdjacentHTML('beforeend', L.milestones.map(function (m) {
      return '<div class="tile reveal is-in" style="--bg:' + m.bg + ';--fg:' + m.fg + ';--ring:' + m.ring + '"><span class="tile__tag">' + esc(t(m.tag)) + '</span><div class="tile__main"><span class="tile__big">' + esc(t(m.big)) + '</span><span class="tile__title">' + esc(t(m.title)) + '</span><span class="tile__text">' + esc(t(m.text)) + '</span></div></div>';
    }).join(''));
  }
  var fbHead = '<div class="fb-card__head"><img src="assets/varrat-logo.png" alt=""><div><strong>VARRAT</strong><small>{label}</small></div><i class="fb-f">f</i></div>';
  function renderFb() {
    var html;
    if (FB_POSTS.length) {
      html = FB_POSTS.map(function (u) {
        var src = 'https://www.facebook.com/plugins/post.php?href=' + encodeURIComponent(u) + '&width=320&show_text=true';
        return '<article class="fb-card">' + fbHead.replace('{label}', 'Facebook') + '<iframe src="' + src + '" title="Facebook post" loading="lazy" scrolling="no" allowfullscreen></iframe></article>';
      }).join('');
    } else {
      html = L.fbCards.map(function (c) {
        return '<article class="fb-card">' + fbHead.replace('{label}', esc(t(c.label))) + '<a class="fb-card__link" href="' + FB_PAGE + '" target="_blank" rel="noopener"><div class="fb-card__img"><div class="photo" style="background-image:url(' + PH[c.img] + ')"></div></div><p class="fb-card__text">' + esc(t(c.text)) + '</p><span class="fb-card__cta">' + esc(t(L.ui.viewFb)) + '</span></a></article>';
      }).join('');
    }
    $('#fbTrack').innerHTML = html;
  }
  $('#fbPrev').addEventListener('click', function () { $('#fbTrack').scrollBy({ left: -400, behavior: 'smooth' }); });
  $('#fbNext').addEventListener('click', function () { $('#fbTrack').scrollBy({ left: 400, behavior: 'smooth' }); });

  function renderReports() {
    $('#reportList').innerHTML = L.reports.map(function (r) {
      return '<a class="report reveal is-in" style="--c:' + r.c + '" href="' + BASE + '?name=' + r.href + '"><span class="report__pdf">PDF</span><span class="report__text"><strong>' + esc(t(r.title)) + '</strong><span>' + esc(t(r.note)) + '</span></span><span class="report__dl">↓</span></a>';
    }).join('');
  }
  function renderPartners() {
    $('#partners').innerHTML = L.partners.map(function (p) {
      return '<div class="partner"><strong>' + esc(p.name) + '</strong><span>' + esc(t(p.note)) + '</span></div>';
    }).join('');
  }

  /* ---------- donate widget ---------- */
  function renderGive() {
    $('#amounts').innerHTML = L.amounts.map(function (a, i) {
      return '<button class="amt' + (i === state.amt ? ' is-active' : '') + '" data-i="' + i + '">₹' + inr(a.v) + '</button>';
    }).join('');
    var a = L.amounts[state.amt];
    $('#impact-text').textContent = '₹' + inr(a.v) + (state.monthly ? t(L.ui.aMonth) : ' ') + t(a.text);
    $('#giveBtn').textContent = t(L.ui.donate) + ' ₹' + inr(a.v) + (state.monthly ? t(L.ui.perMonth) : '');
    $('#once').classList.toggle('is-active', !state.monthly);
    $('#monthly').classList.toggle('is-active', state.monthly);
  }
  $('#amounts').addEventListener('click', function (e) { var b = e.target.closest('.amt'); if (b) { state.amt = +b.dataset.i; renderGive(); } });
  $('#once').addEventListener('click', function () { state.monthly = false; renderGive(); });
  $('#monthly').addEventListener('click', function () { state.monthly = true; renderGive(); });

  /* ---------- newsletter ---------- */
  $('#newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    this.hidden = true;
    $('#newsThanks').hidden = false;
  });

  /* ---------- mobile menu ---------- */
  $('#menuBtn').addEventListener('click', function () {
    state.menuOpen = !state.menuOpen;
    $('#mobileMenu').hidden = !state.menuOpen;
    this.setAttribute('aria-expanded', state.menuOpen);
    this.textContent = t(state.menuOpen ? L.ui.close : L.ui.menu);
  });

  /* ---------- language ---------- */
  function renderAll() {
    applyStatic(); renderSlider(); renderStats(); renderThreeC(); renderBoard(); renderThemes(); renderSteps();
    renderDistricts(); renderMilestones(); renderFb(); renderReports(); renderPartners(); renderGive();
  }
  $$('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      state.lang = b.dataset.lang === 'od' ? 1 : 0;
      try { localStorage.setItem('varrat-lang', state.lang); } catch (e) {}
      renderAll();
    });
  });
  try { state.lang = localStorage.getItem('varrat-lang') === '1' ? 1 : 0; } catch (e) {}

  /* ---------- scroll reveal + counters ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      if (en.target.id === 'stats') runCounters();
      io.unobserve(en.target);
    });
  }, { threshold: 0.12 }) : null;

  renderAll();
  paintDots();
  $$('.reveal').forEach(function (n) {
    var sibs = $$('.reveal', n.parentNode).filter(function (x) { return x.parentNode === n.parentNode; });
    n.style.setProperty('--rd', (sibs.indexOf(n) * 0.09) + 's');
  });
  var qp = $('.quote__photo'), qs = $('.quote');
  function par() {
    if (!qp || !qs) return;
    var r = qs.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    qp.style.transform = 'translateY(' + ((r.top + r.height / 2 - vh / 2) * -0.18).toFixed(1) + 'px)';
  }
  addEventListener('scroll', par, { passive: true }); par();
  if (io) { $$('.reveal').forEach(function (n) { if (!n.classList.contains('is-in')) io.observe(n); }); io.observe($('#stats')); }
  else { $$('.reveal').forEach(function (n) { n.classList.add('is-in'); }); state.count = 1; paintCounters(); }
})();
