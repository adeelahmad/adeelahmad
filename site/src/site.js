/* adeelahmad.net — progressive enhancement only. The page is complete without this file;
   it adds: theme toggle, click-to-play talk video, timeline search/filter/sort, in-place skill filtering, skills search, #event= compatibility. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  /* ---------- theme ---------- */
  var KEY = 'adeel-theme';
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function isDark() {
    var t = doc.dataset.theme;
    return t === 'dark' || (!t && mq && mq.matches);
  }
  function paintToggle() {
    var b = document.querySelector('[data-theme-toggle]');
    if (b) b.textContent = isDark() ? 'Light mode' : 'Dark mode';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-toggle]');
    if (!b) return;
    var next = isDark() ? 'light' : 'dark';
    doc.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (_) {}
    paintToggle();
  });
  if (mq && mq.addEventListener) mq.addEventListener('change', paintToggle);
  paintToggle();

  /* ---------- talk video: load YouTube only when asked ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-video-play]');
    if (!a) return;
    var box = a.closest('[data-video]');
    if (!/^[\w-]{11}$/.test(box.dataset.video)) return;
    e.preventDefault();
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + box.dataset.video + '?autoplay=1';
    f.title = box.dataset.title || 'Video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    box.replaceChildren(f);
  });

  /* ---------- timeline ---------- */
  var list = document.querySelector('[data-timeline]');
  if (!list) return;
  var entries = Array.prototype.slice.call(list.querySelectorAll('.entry'));
  var periods = Array.prototype.slice.call(list.querySelectorAll('.period'));
  var total = entries.length;
  var form = document.querySelector('[data-toolbar]');
  var q = form && form.querySelector('[name=q]');
  var selPeriod = form && form.querySelector('[name=period]');
  var selKind = form && form.querySelector('[name=kind]');
  var selSkill = form && form.querySelector('[name=skill]');
  var status = document.querySelector('[data-status]');
  var clearBtn = document.querySelector('[data-clear]');
  var orderBtn = document.querySelector('[data-order]');
  var empty = document.querySelector('[data-empty]');
  var state = { q: '', period: '', kind: '', skill: '', ids: null, order: 'oldest' };

  function norm(s) { return String(s || '').normalize('NFKD').toLowerCase(); }
  function active() { return !!(state.q || state.period || state.kind || state.skill || state.ids); }
  function matches(el) {
    if (state.period && el.dataset.period !== state.period) return false;
    if (state.kind && el.dataset.kind !== state.kind) return false;
    if (state.skill && el.dataset.skills.split('|').indexOf(state.skill) < 0) return false;
    if (state.ids && state.ids.indexOf(el.id) < 0) return false;
    if (state.q && norm(el.dataset.text).indexOf(norm(state.q)) < 0) return false;
    return true;
  }
  function apply() {
    var shown = 0;
    periods.forEach(function (p, pi) {
      var n = 0;
      var es = Array.prototype.slice.call(p.querySelectorAll('.entry'));
      es.forEach(function (el, ei) {
        var ok = matches(el);
        el.hidden = !ok;
        if (ok) n++;
        el.style.order = state.order === 'oldest' ? ei : es.length - ei;
      });
      p.hidden = n === 0;
      p.style.order = state.order === 'oldest' ? pi : periods.length - pi;
      var c = p.querySelector('.period__count');
      if (c) c.textContent = active() ? n + ' of ' + c.dataset.total : c.dataset.total + (c.dataset.total === '1' ? ' entry' : ' entries');
      shown += n;
    });
    if (status) status.textContent = active()
      ? shown + ' of ' + total + ' entries' + (state.skill ? ' · ' + state.skill : '') + (state.ids ? ' · selected' : '')
      : total + ' entries · ' + state.order + ' first';
    if (clearBtn) clearBtn.hidden = !active();
    if (empty) empty.hidden = shown !== 0;
    if (orderBtn) orderBtn.textContent = state.order === 'oldest' ? 'Newest first ↑' : 'Oldest first ↓';
    if (q && q.value !== state.q) q.value = state.q;
    if (selPeriod) selPeriod.value = state.period;
    if (selKind) selKind.value = state.kind;
    if (selSkill) selSkill.value = selSkill.querySelector('option[value="' + state.skill.replace(/"/g, '\\"') + '"]') ? state.skill : '';
  }
  function reset(patch) {
    state.q = ''; state.period = ''; state.kind = ''; state.skill = ''; state.ids = null;
    Object.assign(state, patch || {});
  }
  function scrollTo(id) {
    var el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 16 });
  }

  if (form) {
    form.hidden = false;
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    if (q) q.addEventListener('input', function () { state.q = q.value; state.ids = null; apply(); });
    if (selPeriod) selPeriod.addEventListener('change', function () { state.period = selPeriod.value; state.ids = null; apply(); });
    if (selKind) selKind.addEventListener('change', function () { state.kind = selKind.value; state.ids = null; apply(); });
    if (selSkill) selSkill.addEventListener('change', function () { state.skill = selSkill.value; state.ids = null; apply(); });
  }
  if (clearBtn) clearBtn.addEventListener('click', function (e) { e.preventDefault(); reset(); apply(); });
  if (orderBtn) orderBtn.addEventListener('click', function () { state.order = state.order === 'oldest' ? 'newest' : 'oldest'; apply(); });

  // Skill tags and "dated entries" links filter in place; their hrefs still work without JS.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-skill], a[data-ids], a[data-clear]');
    if (!a) return;
    if (a.dataset.skill !== undefined) { e.preventDefault(); reset({ skill: a.dataset.skill }); apply(); scrollTo('timeline'); }
    else if (a.dataset.ids !== undefined) { e.preventDefault(); reset({ ids: a.dataset.ids.split(' ') }); apply(); scrollTo('timeline'); }
  });

  // Permalinks: plain #milestone-id anchors. Old #event=milestone-id links still work.
  function onHash() {
    var h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    var id = h.indexOf('event=') === 0 ? h.slice(6) : h;
    var el = document.getElementById(id);
    if (el && el.classList.contains('entry')) { reset(); apply(); scrollTo(id); }
  }
  window.addEventListener('hashchange', onHash);
  apply();
  onHash();

  /* ---------- skills search ---------- */
  var sq = document.querySelector('[data-skill-search]');
  if (sq) {
    var wrap = sq.closest('form');
    if (wrap) { wrap.hidden = false; wrap.addEventListener('submit', function (e) { e.preventDefault(); }); }
    var skills = Array.prototype.slice.call(document.querySelectorAll('.skill'));
    var more = document.querySelector('[data-skills-more]');
    sq.addEventListener('input', function () {
      var v = norm(sq.value);
      skills.forEach(function (s) { s.hidden = !!v && norm(s.dataset.name).indexOf(v) < 0; });
      if (more && v) more.open = true;
    });
  }
})();
