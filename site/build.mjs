// Rebuild a self-contained public page from the allowlisted publication model.
// No private archive, network access, package install or remote service is used.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {phraseHashes} from './scripts/terms.mjs';
import {buildPages,sanitize} from './scripts/pages.mjs';
import {gaHead,gaCsp} from './scripts/analytics.mjs';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const D=JSON.parse(read('data/public-timeline.json'));
const J=JSON.parse(read('data/journey.json'));
const M=JSON.parse(read('data/medium.json'));
const WL=JSON.parse(read('data/writing-links.json'));
const SITE_URL='https://adeelahmad.net/';
const BLOG_URL='https://blog.adeelahmad.net/';
const LINKEDIN_URL='https://www.linkedin.com/in/adeelahmadch/';
const hasPage=p=>p.slug&&fs.existsSync(path.join(ROOT,'data/medium-content',p.id+'.html'));
const writing=M.posts.map(p=>Object.assign({},p,{eventIds:WL[p.id]||[],local:hasPage(p)?'/blog/'+p.slug+'/':''}));
const permittedTop=['schemaVersion','edition','asOf','author','title','location','intro','description','github','periods','events','projects','domains','highlights','method'];
const permittedEvent=['id','date','period','title','body','skills','kind','track','evidence','note','links','featured'];
function validate(){
  if(Object.keys(D).some(k=>!permittedTop.includes(k)))throw Error('Unexpected top-level field in public data.');
  if(!Array.isArray(D.events)||!D.events.length)throw Error('Public milestones are required.');
  const ids=new Set();
  for(const e of D.events){
    if(Object.keys(e).some(k=>!permittedEvent.includes(k)))throw Error('Unexpected milestone field.');
    for(const k of ['id','date','period','title','body','kind','track','evidence'])if(typeof e[k]!=='string'||!e[k])throw Error('Missing '+k);
    if(!/^milestone-\d{3}$/.test(e.id)||ids.has(e.id))throw Error('Invalid or repeated milestone ID.');
    ids.add(e.id);
    if(!D.periods.includes(e.period)||!Array.isArray(e.skills)||!e.skills.length)throw Error('Invalid period or skills.');
    for(const l of e.links){
      const u=new URL(l.url);if(u.protocol!=='https:'||!['github.com','www.linkedin.com'].includes(u.hostname)||u.username||u.password)throw Error('Unapproved public reference.');
    }
  }
  for(const p of D.projects)if(!p.eventIds.length||p.eventIds.some(id=>!ids.has(id)))throw Error('Broken project reference.');
  for(const id of D.highlights)if(!ids.has(id))throw Error('Broken highlight.');
  for(const c of J.chapters){
    for(const k of ['id','when','title','story','learned'])if(typeof c[k]!=='string'||!c[k])throw Error('Missing chapter '+k);
    if(!c.eventIds.length||c.eventIds.some(id=>!ids.has(id)))throw Error('Broken chapter reference.');
  }
  for(const p of writing){
    if(!/^[0-9a-f]+$/.test(p.id)||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!p.title)throw Error('Invalid writing entry.');
    const u=new URL(p.url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Unapproved writing link.');
    if(p.eventIds.some(id=>!ids.has(id)))throw Error('Broken writing reference.');
  }
  const postText=writing.filter(p=>p.local).map(p=>sanitize(fs.readFileSync(path.join(ROOT,'data/medium-content',p.id+'.html'),'utf8'),p.title));
  const text=JSON.stringify([D,J,writing,postText]);
  // Hashed private terms: blocks client names and other private details without publishing the list.
  const blocked=new Set(read('data/private-terms.sha256').split('\n').map(s=>s.trim()).filter(Boolean));
  const found=[...phraseHashes(text)].filter(h=>blocked.has(h));
  if(found.length)throw Error('Private term found in public content (hash '+found[0].slice(0,12)+'…). Remove it before publishing.');
  for(const rx of [/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,/\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/i,/(?:\/Users\/|\/mnt\/|file:\/\/)/])if(rx.test(text))throw Error('Potential private data detected in publication model.');
}
validate();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const chips=skills=>'<div class="skill-chips">'+skills.map(s=>'<span class="skill-chip">'+esc(s)+'</span>').join('')+'</div>';
const links=ls=>ls.map(l=>'<a class="source-link" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">'+esc(l.label)+' ↗</a>').join(' ');
const event=e=>`<article class="event-row${e.featured?' is-featured':''}" id="${esc(e.id)}" data-event-id="${esc(e.id)}"><div class="event-date"><span class="timeline-dot" aria-hidden="true"></span><span>${esc(e.date)}</span></div><div class="event-main"><div class="event-kicker"><span class="track-label">${esc(e.track)}</span><span class="type-badge">${esc(e.kind)}</span></div><h3>${esc(e.title)}</h3><p>${esc(e.body)}</p><details class="event-context"><summary>Notes &amp; links</summary><div class="context-content"><p class="evidence-label">${esc(e.evidence)}</p>${e.note?'<p>'+esc(e.note)+'</p>':''}<div class="source-links">${links(e.links)}</div></div></details></div><div class="event-skills"><span class="tiny-label">SKILLS INVOLVED</span>${chips(e.skills)}</div></article>`;
function staticBody(){
  const periods=D.periods.map((p,i)=>`<section class="period-section" id="period-${i}"><div class="period-heading"><h3>${esc(p)}</h3></div>${D.events.filter(e=>e.period===p).map(event).join('')}</section>`).join('');
  const inventory=Object.entries(D.domains).map(([k,v])=>'<section class="domain-block"><h3>'+esc(k)+'</h3>'+chips(v)+'</section>').join('');
  const projects=D.projects.map(p=>'<article class="project-card"><span class="project-status">'+esc(p.status)+'</span><h3>'+esc(p.name)+'</h3><p>'+esc(p.description)+'</p>'+chips(p.skills.slice(0,5))+'<div class="project-links">'+links(p.links)+'</div></article>').join('');
  const journey=J.chapters.map((c,i)=>`<article class="chapter" id="${esc(c.id)}"><div class="chapter-when"><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span>${esc(c.when)}</span></div><div class="chapter-main"><h3>${esc(c.title)}</h3><p>${esc(c.story)}</p><p class="chapter-learned"><span class="tiny-label">WHAT CARRIED FORWARD</span>${esc(c.learned)}</p>${chips(c.skills)}</div></article>`).join('');
  const posts=writing.map(p=>`<article class="post-card"><span class="post-date">${esc(p.date)}</span><h3><a href="${esc(p.local||p.url)}"${p.local?'':' target="_blank" rel="noopener noreferrer"'}>${esc(p.title)}</a></h3>${p.excerpt?'<p>'+esc(p.excerpt)+'</p>':''}</article>`).join('');
  return `<header class="topbar"><div class="container topbar-inner"><a class="wordmark" href="#top"><span class="monogram">aa</span>Adeel Ahmad</a><nav aria-label="Portfolio sections"><a class="nav-link" href="#static-journey">Journey</a><a class="nav-link" href="#workspace">Timeline</a><a class="nav-link" href="#static-skills">Skills</a><a class="nav-link" href="#static-projects">Projects</a><a class="nav-link" href="#static-writing">Writing</a></nav></div></header><section class="hero hero-plain container"><h1>Adeel Ahmad</h1><p class="intro">${esc(D.intro)}</p><p class="hero-sub">Most of it comes from one habit: when something I depend on doesn’t make sense to me, I go and learn the layer underneath it.</p></section><main class="container workspace" id="workspace"><section id="static-journey"><h2>How it fits together</h2><p class="section-intro">${esc(J.intro)}</p><div class="chapters">${journey}</div></section><h2>Timeline</h2><p class="section-intro">${esc(D.description)}</p><noscript><p class="static-note">Everything is readable below. With JavaScript on, you can filter and search.</p></noscript><div class="results-bar">${D.events.length} entries</div>${periods}<section id="static-skills"><h2>Everything I’ve used</h2><p class="section-intro">Self-reported experience. Some of these I used deeply, some briefly.</p>${inventory}</section><section id="static-projects"><h2>Projects</h2><div class="project-grid">${projects}</div></section><section id="static-writing"><h2>Writing</h2><p class="section-intro">Things I’ve written on Medium, newest first.</p><div class="post-grid">${posts}</div><p><a href="${BLOG_URL}">All posts on Medium ↗</a></p></section></main><footer class="footer container"><p>Adeel Ahmad · Melbourne · Last updated October 2026</p></footer>`;
}
const scripts=[read('vendor/react.production.min.js'),read('vendor/react-dom.production.min.js'),'window.PUBLIC_TIMELINE='+json(D)+';window.SITE_EXTRAS='+json({journey:J,writing,links:{blog:BLOG_URL,linkedin:LINKEDIN_URL}})+';',read('src/app.js')].map(s=>s.replace(/<\/script/gi,'<\\/script'));
const css=read('src/styles.css');
const hash=s=>"'sha256-"+crypto.createHash('sha256').update(s).digest('base64')+"'";
const csp="default-src 'none'; script-src "+scripts.map(hash).join(' ')+" "+gaCsp.script+"; style-src "+hash(css)+"; img-src data: "+gaCsp.img+"; connect-src "+gaCsp.connect+"; object-src 'none'; base-uri 'none'; form-action 'none';";
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="#18312d"/><text x="32" y="42" font-family="Arial,sans-serif" text-anchor="middle" font-size="32" fill="#f7f7f2" letter-spacing="-3">aa</text></svg>';
const metaTitle='Adeel Ahmad';
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="'+esc(csp)+'">'+gaHead+'<meta name="robots" content="index,follow"><meta name="author" content="Adeel Ahmad"><meta name="description" content="'+esc(D.description)+'"><link rel="canonical" href="'+SITE_URL+'"><meta property="og:url" content="'+SITE_URL+'"><meta property="og:type" content="website"><meta property="og:title" content="'+esc(metaTitle)+'"><meta property="og:description" content="'+esc(D.description)+'"><meta name="twitter:card" content="summary"><meta name="color-scheme" content="light"><title>'+esc(metaTitle)+'</title><link rel="icon" href="data:image/svg+xml,'+encodeURIComponent(svg)+'"><style>'+css+'</style></head><body id="top"><div id="root">'+staticBody()+'</div>'+scripts.map(s=>'<script>'+s+'</script>').join('')+'<!-- '+read('vendor/NOTICE.txt').replace(/--/g,'—')+' -->'+'</body></html>';
fs.mkdirSync(path.join(ROOT,'dist'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'dist/index.html'),html);
fs.writeFileSync(path.join(ROOT,'index.html'),html);
for(const f of fs.readdirSync(path.join(ROOT,'static')))fs.copyFileSync(path.join(ROOT,'static',f),path.join(ROOT,'dist',f));
const favicon='data:image/svg+xml,'+encodeURIComponent(svg);
const md=['# Adeel Ahmad','','Last updated October 2026','',D.intro,'','## How it fits together',''];
for(const c of J.chapters)md.push('### '+c.when+' — '+c.title,'',c.story,'','*What carried forward:* '+c.learned,'');
md.push('# Timeline','');
for(const period of D.periods){md.push('## '+period,'');for(const e of D.events.filter(e=>e.period===period)){md.push('### '+e.date+' — '+e.title,'',e.body,'','**Type:** '+e.kind+' · **Workstream:** '+e.track,'','**Technologies / skills:** '+e.skills.join(', ')+'.','');if(e.note)md.push('*Context: '+e.note+'*','');md.push('Evidence: '+e.evidence+'.','');for(const l of e.links)md.push('['+l.label+']('+l.url+')');if(e.links.length)md.push('');}}
md.push('## Projects','');for(const p of D.projects)md.push('### '+p.name,'',p.description,'','Status: '+p.status+'.','');
md.push('## Everything I’ve used','',D.method.skills,'');for(const [k,skills] of Object.entries(D.domains))md.push('### '+k,'',skills.join(', ')+'.','');
md.push('## About this page','');Object.values(D.method).forEach(p=>md.push(p,''));
fs.writeFileSync(path.join(ROOT,'PUBLIC-TIMELINE.md'),md.join('\n')+'\n');
const pages=buildPages({root:ROOT,dist:path.join(ROOT,'dist'),site:SITE_URL,posts:writing,css:css+read('src/post.css'),favicon,intro:D.intro,journey:J,timelineMd:md.join('\n')+'\n',links:{blog:BLOG_URL,linkedin:LINKEDIN_URL}});
console.log(JSON.stringify({chapters:J.chapters.length,milestones:D.events.length,projects:D.projects.length,posts:writing.length,postPages:pages.length,bytes:Buffer.byteLength(html),csp:'hashed scripts and stylesheet; Google Analytics only',build:'complete'}));
