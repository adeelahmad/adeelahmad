/* render.mjs — turns the publication JSON into static HTML (the "Ledger" design). No dependencies.
   build.mjs validates the data, then calls renderSite() and writes the result to dist/.
   Every page carries a hashed Content-Security-Policy and Google Analytics. */
import crypto from 'node:crypto';
import { gaHead, gaCsp } from '../scripts/analytics.mjs';

export const SITE = {
  name: 'Adeel Ahmad',
  location: 'Melbourne',
  domain: 'adeelahmad.net',
  intro2: 'Most of it comes from one habit: when something I depend on doesn\u2019t make sense to me, I go and learn the layer underneath it.',
  portrait: { src: 'assets/adeel-portrait.webp', alt: 'Adeel Ahmad' },
  url: 'https://adeelahmad.net/',
  links: { github: 'https://github.com/adeelahmad', medium: 'https://blog.adeelahmad.net/', linkedin: 'https://www.linkedin.com/in/adeelahmadch/' },
  updated: 'October 2026',
  views: 'My own views, not my employer\u2019s.'
};

// Header profile links (inline SVG icons, 24x24 viewBox)
const ICONS = {
  linkedin: '<path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>',
  github: '<path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .32.21.69.82.57A12 12 0 0 0 12 .3"/>',
  medium: '<path d="M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>'
};
const SOCIAL = [['linkedin', 'LinkedIn'], ['github', 'GitHub'], ['medium', 'Medium']]
  .map(([k, label]) => `<a href="${SITE.links[k]}" rel="noopener" aria-label="${label}" title="${label}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">${ICONS[k]}</svg></a>`).join('');

// Chapter figures, keyed by chapter id (journey.json)
export const CHAPTER_FIGURES = {
  'chapter-3': {
    src: 'assets/amp-workshop.jpg',
    alt: 'A planning workshop: people at long tables facing a wall of flip-chart sheets covered in sticky notes labelled with audiovisual analysis tasks such as speaker identification and silence detection',
    caption: 'September 2017. A planning workshop for an open audiovisual metadata platform for libraries and archives.'
  }
};

// Project groups (names must match public-timeline.json → projects[].name)
export const PROJECT_AREAS = [
  ['Agents', ['AgentRC', 'agent-handoff', 'agentic-agile / aloop', 'CTXConfig', 'Versioned agent state', 'PiKVM agent interface', 'MacPilot']],
  ['Training models', ['MLX training tooling', 'Model inspection']],
  ['Knowledge and media tools', ['Lens', 'anytopdf', 'Media ingestion', 'Python in documents']],
  ['Storage and networks', ['JuiceFS fork', 'OpenWrt trafficctl', 'rclone / Emby integration', 'Snapback', 'ReqWall', 'Developer workspaces']]
];

const METHOD_LABELS = { scope: 'What is here', evidence: 'Sources', dates: 'Dates', skills: 'Skill tags', research: 'Experiments', personal: 'Views' };

// Posts with a saved copy get a page at blog/<slug>/; the rest link straight to Medium.
const postHref = (p, toRoot) => p.local ? `${toRoot}blog/${p.slug}/` : p.url;

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slug = s => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const periodId = p => 'period-' + slug(p);
const norm = s => String(s || '').normalize('NFKD').toLowerCase();
const longDate = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/* ---------- layout ---------- */
// Read the saved theme before first paint so dark mode does not flash. Hashed into the CSP below.
const THEME = "try{var t=localStorage.getItem('adeel-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}";
const hash = s => "'sha256-" + crypto.createHash('sha256').update(s).digest('base64') + "'";
export const MEDIUM_IMG_HOSTS = ['miro.medium.com', 'cdn-images-1.medium.com'];

function layout({ title, description, body, root = '', label, canonical, ogType = 'website', remoteImages = false, frames = false, frameSrc = '', wide = false }) {
  const csp = "default-src 'none'; script-src 'self' " + hash(THEME) + ' ' + gaCsp.script + "; style-src 'self'; font-src 'self'; manifest-src 'self'; " + (frames || frameSrc ? "frame-src " + (frames ? "'self'" : '') + (frames && frameSrc ? ' ' : '') + frameSrc + '; ' : '') + "img-src 'self' data: " + gaCsp.img + (remoteImages ? ' ' + MEDIUM_IMG_HOSTS.map(h => 'https://' + h).join(' ') : '') + '; connect-src ' + gaCsp.connect + "; object-src 'none'; base-uri 'none'; form-action 'none';";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="${esc(csp)}">
${gaHead}
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(SITE.name)}">
<title>${esc(title)}</title>
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${ogType}">
<meta property="og:image" content="${SITE.url}og-image.jpg">
<meta property="og:image:alt" content="Photo of ${esc(SITE.name)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${root}favicon.ico" sizes="any">
<link rel="icon" href="${root}favicon-32x32.png" type="image/png" sizes="32x32">
<link rel="icon" href="${root}favicon-16x16.png" type="image/png" sizes="16x16">
<link rel="apple-touch-icon" href="${root}apple-icon-180x180.png">
<link rel="manifest" href="${root}manifest.json">
<link rel="stylesheet" href="${root}styles.css">
<script>${THEME}</script>
<script src="${root}site.js" defer></script>
</head>
<body>
<div class="wrap${wide ? ' wrap--wide' : ''}">
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  ${label
    ? `<nav class="crumbs" aria-label="Breadcrumb"><a class="top__name" href="${root}">${esc(SITE.name)}</a><span aria-hidden="true">/</span>${label}</nav>`
    : `<a class="top__name" href="#top">${esc(SITE.name)}</a>`}
  <div class="top__end">
    <nav class="top__nav" aria-label="Site"><a href="${root}blog/">Writing</a><a href="${root}publications/">Publications</a><a href="${root}cv/">CV</a></nav>
    <nav class="top__social" aria-label="Profiles">${SOCIAL}</nav>
    <button type="button" class="btn-theme js-only" data-theme-toggle>Dark mode</button>
  </div>
</header>
${body}
</div>
</body>
</html>
`;
}

function siteFooter(D, root = '') {
  const method = D && D.method ? Object.entries(D.method).map(([k, t]) => `<div><dt>${esc(METHOD_LABELS[k] || k)}.</dt> <dd>${esc(t)}</dd></div>`).join('') : '';
  return `<footer class="footer">
  <div class="footer__row">
    <span>${esc(SITE.name)} · ${esc(SITE.location)} · Last updated ${esc(SITE.updated)} · ${esc(SITE.views)}</span>
    <span><a href="${root}cv/">CV</a><a href="${SITE.links.github}" rel="noopener">GitHub</a><a href="${SITE.links.medium}" rel="noopener">Medium</a><a href="${root}#top">Top ↑</a></span>
  </div>
  ${method ? `<details><summary>About this page</summary><dl>${method}</dl></details>` : ''}
</footer>`;
}

/* ---------- pieces ---------- */
function skillLinks(skills, root, sep = ', ') {
  return skills.map(s => `<a class="qd" href="${root}skills/${slug(s)}/" data-skill="${esc(s)}">${esc(s)}</a>`).join(sep);
}

export function renderEntry(e, root = '') {
  const permalink = `${root}#${e.id}`;
  const links = e.links.map(l => `<a href="${esc(l.url)}" rel="noopener">${esc(l.label)} ↗</a> · `).join('');
  const text = norm([e.date, e.title, e.body, e.kind, e.track, ...e.skills].join(' '));
  return `<article class="entry" id="${e.id}" data-period="${esc(e.period)}" data-kind="${esc(e.kind)}" data-skills="${esc(e.skills.join('|'))}" data-text="${esc(text)}">
  <div class="entry__when"><a href="${permalink}" title="Link to this entry">${esc(e.date)}</a><div class="entry__kind${e.kind === 'Merged' ? ' entry__kind--merged' : ''}">${esc(e.kind)}</div></div>
  <div class="entry__main">
    <h4 class="entry__title">${esc(e.title)}</h4>
    <p>${esc(e.body)}</p>
    <p class="entry__skills">${skillLinks(e.skills, root)}</p>
    <details class="notes"><summary>Notes &amp; links</summary><div>${esc(e.evidence)}.${e.note ? ' ' + esc(e.note) : ''} ${links}<a href="${permalink}">Link to this entry</a></div></details>
  </div>
</article>`;
}

function renderChapter(c, i, D) {
  const first = D.events.find(e => e.id === c.eventIds[0]);
  const anchor = first ? '#' + periodId(first.period) : '#timeline';
  const fig = CHAPTER_FIGURES[c.id];
  return `<article class="chapter" id="${esc(c.id)}">
  <div class="chapter__when">${String(i + 1).padStart(2, '0')}<br>${esc(c.when)}</div>
  <div class="chapter__body">
    <span class="chapter__dot" aria-hidden="true"></span>
    <h3>${esc(c.title)}</h3>
    <p>${esc(c.story)}</p>
    ${fig ? `<figure class="figure"><img src="${fig.src}" alt="${esc(fig.alt)}" loading="lazy"><figcaption>${fig.caption}</figcaption></figure>` : ''}
    <p class="chapter__meta">${c.skills.map(esc).join(' · ')} &nbsp;·&nbsp; <a href="${anchor}" data-ids="${c.eventIds.join(' ')}">${c.eventIds.length} dated entries →</a></p>
  </div>
</article>`;
}

/* ---------- home ---------- */
export function renderHome({ timeline: D, journey: J, medium: M }) {
  const skillMap = new Map();
  D.events.forEach(e => e.skills.forEach(s => { if (!skillMap.has(s)) skillMap.set(s, []); skillMap.get(s).push(e.id); }));
  const kinds = Array.from(new Set(D.events.map(e => e.kind))).sort();
  const counts = {}; D.events.forEach(e => { counts[e.period] = (counts[e.period] || 0) + 1; });
  const skillOpts = Array.from(skillMap.keys()).filter(k => skillMap.get(k).length >= 2).sort((a, b) => a.localeCompare(b));
  const topSkills = Array.from(skillMap.entries()).map(([n, ids]) => [n, ids.length]).filter(x => x[1] >= 3).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const moreSkills = Array.from(skillMap.entries()).map(([n, ids]) => [n, ids.length]).filter(x => x[1] < 3).sort((a, b) => a[0].localeCompare(b[0]));
  const skillLink = ([n, c], cls) => `<a class="skill ${cls || ''}" href="skills/${slug(n)}/" data-skill="${esc(n)}" data-name="${esc(n)}">${esc(n)} <span class="count">${c}</span></a>`;
  const byName = new Map(D.projects.map(p => [p.name, p]));

  const body = `
<main id="main">
<section class="intro" aria-labelledby="name" id="top">
  <img class="intro__portrait" src="${SITE.portrait.src}" alt="${esc(SITE.portrait.alt)}" width="180" height="180">
  <div class="intro__text">
    <h1 id="name">${esc(SITE.name)}</h1>
    <p>${esc(D.intro)}</p>
    <p>${esc(SITE.intro2)}</p>
  </div>
</section>

<nav class="toc" aria-label="On this page"><span>On this page</span><a href="#journey">How it fits together</a><a href="#timeline">Timeline</a><a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#writing">Writing</a><a href="cv/">CV</a></nav>

<section class="section section--first" id="journey" aria-labelledby="journey-title">
  <h2 class="h2" id="journey-title">How it fits together</h2>
  <p class="lede">${esc(J.intro)}</p>
  <div class="chapters">${J.chapters.map((c, i) => renderChapter(c, i, D)).join('\n')}</div>
</section>

<section class="section" id="timeline" aria-labelledby="timeline-title">
  <h2 class="h2" id="timeline-title">Timeline</h2>
  <p class="lede">What I worked on and when, with the skills each piece involved. Everything is readable below; with JavaScript on, you can search and filter.</p>
  <form class="toolbar js-only" data-toolbar role="search" hidden>
    <label class="field"><span class="sr-only">Search the timeline</span><input class="input" type="search" name="q" placeholder="Search a project, technology or idea" autocomplete="off"></label>
    <div class="toolbar__row">
      <label class="field"><span>Period</span><select class="select" name="period"><option value="">All periods</option>${D.periods.map(p => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></label>
      <label class="field"><span>Type</span><select class="select" name="kind"><option value="">All types</option>${kinds.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('')}</select></label>
      <label class="field"><span>Skill</span><select class="select" name="skill"><option value="">Any skill</option>${skillOpts.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select></label>
    </div>
    <div class="status"><span><span aria-live="polite" data-status>${D.events.length} entries · oldest first</span> <a href="#timeline" data-clear hidden>Clear filters</a></span><button type="button" class="linkbtn" data-order>Newest first ↑</button></div>
  </form>
  <p class="jump"><span>Jump to</span>${D.periods.map(p => `<a href="#${periodId(p)}">${esc(p)} <span class="count">${counts[p]}</span></a>`).join('')}</p>
  <div class="empty" data-empty hidden><p><strong>Nothing matches</strong></p><p>Try another word or clear a filter. <a href="#timeline" data-clear>Show everything</a></p></div>
  <div class="timeline__list" data-timeline>
  ${D.periods.map(p => {
    const es = D.events.filter(e => e.period === p);
    return `<section class="period" id="${periodId(p)}" aria-labelledby="${periodId(p)}-title" data-period="${esc(p)}">
    <h3 class="period__head label" id="${periodId(p)}-title"><span>${esc(p)}</span><span class="period__count" data-total="${es.length}">${es.length} ${es.length === 1 ? 'entry' : 'entries'}</span></h3>
    ${es.map(e => renderEntry(e)).join('\n')}
  </section>`;
  }).join('\n')}
  </div>
</section>

<section class="section" id="skills" aria-labelledby="skills-title">
  <h2 class="h2" id="skills-title">Skills</h2>
  <p class="lede">Pick a skill to see the entries where it came up. The number is how many entries mention it; it is not a rating.</p>
  <form class="js-only skills-search" role="search" hidden><label class="field"><span class="sr-only">Search skills</span><input class="input" type="search" placeholder="Search skills and technologies" data-skill-search autocomplete="off"></label></form>
  <p class="skills-top">${topSkills.map(s => skillLink(s)).join('')}</p>
  <details class="more" data-skills-more><summary>${moreSkills.length} more, mentioned once or twice</summary><p class="skills-more">${moreSkills.map(s => skillLink(s)).join('')}</p></details>

  <h3 class="h3">Everything I've used</h3>
  <p class="lede">Self-reported. Some of these I used deeply, some briefly. Linked ones have a dated entry.</p>
  <div class="inventory">${Object.entries(D.domains).map(([name, items]) => `<div class="inventory__area"><h4>${esc(name)}</h4><p>${items.map(n => skillMap.has(n) ? `<a class="q" href="skills/${slug(n)}/" data-skill="${esc(n)}">${esc(n)}</a>` : esc(n)).join(', ')}</p></div>`).join('\n')}</div>
</section>

<section class="section" id="projects" aria-labelledby="projects-title">
  <h2 class="h2" id="projects-title">Projects</h2>
  <p class="lede">Personal projects, separate from my employer. Many are experiments or still in progress.</p>
  ${PROJECT_AREAS.map(([area, names]) => `<div class="pgroup"><h3 class="label">${esc(area)}</h3>${names.map(n => byName.get(n)).filter(Boolean).map(p => `<div class="project">
    <h4>${p.links.length ? `<a class="q" href="${esc(p.links[0].url)}" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h4>
    <p>${esc(p.description)} <a class="qd" href="#${p.eventIds.length && D.events.find(e => e.id === p.eventIds[0]) ? periodId(D.events.find(e => e.id === p.eventIds[0]).period) : 'timeline'}" data-ids="${p.eventIds.join(' ')}">dated entries →</a></p>
    <span class="project__status${/merged/i.test(p.status) ? ' project__status--merged' : ''}">${esc(p.status)}</span>
  </div>`).join('')}<div class="hair"></div></div>`).join('\n')}
</section>

<section class="section section--writing" id="writing" aria-labelledby="writing-title">
  <h2 class="h2" id="writing-title">Writing</h2>
  <p class="lede">Things I've written, newest first. Each first appeared on Medium; readable copies live here.</p>
  ${M.posts.map(p => `<div class="post"><time datetime="${p.date}">${longDate(p.date)}</time><div class="post__main"><h3><a class="q" href="${postHref(p, '')}">${esc(p.title)}</a></h3></div></div>`).join('\n')}
  <div class="hair"></div>
  <p class="more more--small"><a href="blog/">All posts →</a> &nbsp;·&nbsp; <a href="${SITE.links.medium}" rel="noopener">On Medium ↗</a></p>
</section>
</main>
${siteFooter(D)}`;
  return layout({ title: SITE.name, description: D.description, body, canonical: SITE.url });
}

/* ---------- writing ---------- */
export function renderWritingIndex({ timeline: D, medium: M }) {
  const root = '../';
  const body = `
<main id="main">
  <h1 class="h2 page-title">Writing</h1>
  <p class="lede page-lede">Things I've written, newest first. Each first appeared on Medium; the copies here stay readable without an account. <a href="${SITE.links.medium}" rel="noopener">All posts on Medium ↗</a></p>
  ${M.posts.map(p => `<article class="post post--full"><time datetime="${p.date}">${longDate(p.date)}</time><div class="post__main">
    <h2><a class="q" href="${postHref(p, '../')}">${esc(p.title)}</a></h2>
    ${p.excerpt ? `<p class="post__excerpt">${esc(p.excerpt)}</p>` : ''}
    <p class="post__meta">${esc(p.topics.map(t => t.replace(/-/g, ' ')).join(', '))} · <a class="q" href="${esc(p.url)}" rel="noopener">On Medium ↗</a></p>
  </div></article>`).join('\n')}
  <div class="hair"></div>
</main>
${siteFooter(D, root)}`;
  return layout({ title: 'Writing · ' + SITE.name, description: 'Posts by ' + SITE.name + ', first published on Medium.', body, root, label: '<span>Writing</span>', canonical: SITE.url + 'blog/' });
}

/* articles: { [postId]: '<p>…</p>' } — full HTML bodies imported from Medium, if you have them */
export function renderArticle(post, i, { timeline: D, medium: M, writingLinks = {}, articles = {} }) {
  const root = '../../';
  const newer = M.posts[i - 1], older = M.posts[i + 1];
  const related = (writingLinks[post.id] || [])[0];
  const bodyHtml = articles[post.id];
  const body = `
<main id="main">
<article class="article">
  <header class="article__head">
    <p class="when"><time datetime="${post.date}">${longDate(post.date)}</time></p>
    <h1>${esc(post.title)}</h1>
    <p class="origin">This post first appeared on <a href="${esc(post.url)}" rel="noopener">Medium</a>. The copy here is kept so it stays readable without an account${related ? `, and so it can be linked from the <a href="${root}#${related}">dated entry</a> it belongs to` : ''}.</p>
  </header>
  <div class="prose">${bodyHtml}</div>
  <footer class="article__foot">
    <p><a href="${esc(post.url)}" rel="noopener">Read it on Medium ↗</a>${post.topics.length ? ` · Topics: ${esc(post.topics.map(t => t.replace(/-/g, ' ')).join(', '))}.` : ''}</p>
    <nav class="pager" aria-label="Other posts">
      ${newer ? `<a href="${postHref(newer, root)}"><span class="dir">← Newer</span><span class="t">${esc(newer.title)}</span></a>` : '<span></span>'}
      ${older ? `<a href="${postHref(older, root)}"><span class="dir">Older →</span><span class="t">${esc(older.title)}</span></a>` : ''}
    </nav>
  </footer>
</article>
</main>
${siteFooter(D, root)}`;
  return layout({ title: post.title + ' · ' + SITE.name, description: post.excerpt || post.title, body, root, label: `<a class="q" href="../">Writing</a>`, canonical: post.url, ogType: 'article', remoteImages: true });
}

/* ---------- skill pages (one per skill, readable with JS off) ---------- */
export function renderSkill(name, ids, { timeline: D }) {
  const root = '../../';
  const es = D.events.filter(e => ids.includes(e.id));
  const body = `
<main id="main">
  <p class="label label--top">Skill</p>
  <h1 class="h2 page-title page-title--tight">${esc(name)}</h1>
  <p class="lede">${es.length} ${es.length === 1 ? 'entry mentions' : 'entries mention'} it. <a href="${root}#skills">All skills →</a></p>
  <div class="timeline__list">${es.map(e => renderEntry(e, root)).join('\n')}</div>
  <div class="hair"></div>
</main>
${siteFooter(D, root)}`;
  return layout({ title: name + ' · ' + SITE.name, description: `Entries on ${SITE.domain} that involved ${name}.`, body, root, label: `<a class="q" href="${root}#skills">Skills</a>`, canonical: SITE.url + 'skills/' + slug(name) + '/' });
}

/* ---------- publications ---------- */
const YOUTUBE_EMBED = 'https://www.youtube-nocookie.com';
const pubHref = (p, toRoot) => p.page ? `${toRoot}publications/${p.id}/` : (p.links[0] && p.links[0].url);
const pubLinks = p => p.links.map(l => `<a class="q" href="${esc(l.url)}" rel="noopener">${esc(l.label)} ↗</a>`).join(' · ');

export function renderPublications({ timeline: D, publications: P }) {
  const root = '../';
  const groups = [['Talks', 'Talk'], ['Reports', 'Report']].map(([h, t]) => [h, P.items.filter(p => p.type === t)]).filter(([, xs]) => xs.length);
  const body = `
<main id="main">
  <h1 class="h2 page-title">Publications</h1>
  <p class="lede page-lede">${esc(P.intro)} <a href="${root}blog/">Writing →</a></p>
  ${groups.map(([h, xs]) => `<section class="pubs" aria-labelledby="pubs-${slug(h)}"><h2 class="label" id="pubs-${slug(h)}">${esc(h)}</h2>
  ${xs.map(p => `<article class="post post--full" id="${esc(p.id)}"><time datetime="${p.date}">${longDate(p.date)}</time><div class="post__main">
    <h3><a class="q" href="${esc(pubHref(p, root))}"${p.page ? '' : ' rel="noopener"'}>${esc(p.title)}</a></h3>
    <p class="post__excerpt">${esc(p.summary)}</p>
    <p class="post__meta">${esc(p.venue)} · ${p.page ? `<a class="q" href="${root}publications/${p.id}/">About the talk</a> · ` : ''}${pubLinks(p)} · <a class="q" href="${root}#${p.eventId}">Timeline entry</a></p>
  </div></article>`).join('\n')}
  </section>`).join('\n')}
  <div class="hair"></div>
</main>
${siteFooter(D, root)}`;
  return layout({ title: 'Publications · ' + SITE.name, description: 'Talks and reports by ' + SITE.name + '.', body, root, label: '<span>Publications</span>', canonical: SITE.url + 'publications/' });
}

export function renderPublication(p, { timeline: D }) {
  const root = '../../';
  const watch = p.links[0];
  const body = `
<main id="main">
<article class="article">
  <header class="article__head">
    <p class="when"><time datetime="${p.date}">${longDate(p.date)}</time> · ${esc(p.venue)}</p>
    <h1>${esc(p.title)}</h1>
    <p class="origin">${esc(p.summary)}</p>
  </header>
  ${p.video ? `<div class="video" data-video="${esc(p.video)}" data-title="${esc(p.title)}"><a class="video__link" href="${esc(watch.url)}" rel="noopener" data-video-play><span class="video__play" aria-hidden="true">▶</span><span class="video__text">Play the recording<span class="video__note">The video loads from YouTube when you press play.</span></span></a></div>` : ''}
  <div class="prose">
    ${p.page.about.map(t => `<p>${esc(t)}</p>`).join('\n    ')}
    <h2>What it covers</h2>
    <ul>${p.page.covers.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
  </div>
  <footer class="article__foot">
    <p>${pubLinks(p)} · <a href="${root}#${p.eventId}">Timeline entry</a> · <a href="../">All publications</a></p>
  </footer>
</article>
</main>
${siteFooter(D, root)}`;
  return layout({ title: p.title + ' · ' + SITE.name, description: p.summary, body, root, label: `<a class="q" href="../">Publications</a>`, canonical: SITE.url + 'publications/' + p.id + '/', ogType: 'article', frameSrc: p.video ? YOUTUBE_EMBED : '' });
}

/* ---------- CV ---------- */
export function renderCV({ cvPdf }) {
  const root = '../';
  const body = `
<main id="main" class="cvpdf">
  <h1 class="visually-hidden">Curriculum vitae</h1>
  <p class="cvpdf__bar"><a class="cvpdf__download" href="${cvPdf}" download>Download PDF</a></p>
  <iframe class="cvpdf__frame" src="${cvPdf}#view=FitH&navpanes=0" title="${esc(SITE.name)} CV (PDF)"></iframe>
</main>`;
  return layout({ title: 'CV · ' + SITE.name, description: 'Curriculum vitae of ' + SITE.name + ' (PDF).', body, root, label: '<span>CV</span>', canonical: SITE.url + 'cv/', frames: true, wide: true });
}

/* ---------- everything ---------- */
export function renderSite(data) {
  const out = {};
  out['index.html'] = renderHome(data);
  out['blog/index.html'] = renderWritingIndex(data);
  if (data.cvPdf) out['cv/index.html'] = renderCV(data);
  if (data.publications) {
    out['publications/index.html'] = renderPublications(data);
    data.publications.items.forEach(p => { if (p.page) out[`publications/${p.id}/index.html`] = renderPublication(p, data); });
  }
  data.medium.posts.forEach((p, i) => { if (p.local) out[`blog/${p.slug}/index.html`] = renderArticle(p, i, data); });
  const skillMap = new Map();
  data.timeline.events.forEach(e => e.skills.forEach(s => { if (!skillMap.has(s)) skillMap.set(s, []); skillMap.get(s).push(e.id); }));
  skillMap.forEach((ids, name) => { out[`skills/${slug(name)}/index.html`] = renderSkill(name, ids, data); });
  return out;
}
