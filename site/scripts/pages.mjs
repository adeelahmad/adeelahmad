// Extra static pages: one page per saved Medium post, a blog index,
// sitemap.xml, robots.txt and llms.txt. Post pages run no script except Google Analytics.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {gaHead,gaCsp} from './analytics.mjs';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ALLOWED=new Set(['p','h1','h2','h3','h4','blockquote','pre','code','em','strong','b','i','a','ul','ol','li','figure','figcaption','img','br','hr']);
const DROP_WITH_CONTENT=/<(script|style|iframe|object|embed|noscript|svg|form)\b[\s\S]*?<\/\1\s*>/gi;
const IMG_HOSTS=['miro.medium.com','cdn-images-1.medium.com'];

function safeUrl(u,{img}={}){
  try{
    const url=new URL(u);
    if(url.protocol!=='https:'&&!(url.protocol==='http:'&&!img))return null;
    if(img&&!IMG_HOSTS.includes(url.hostname))return null;
    return url.toString();
  }catch{return null;}
}
// Allowlist sanitizer for the post HTML in Medium's feed.
export function sanitize(html,title){
  let out=html.replace(/<!--[\s\S]*?-->/g,'').replace(DROP_WITH_CONTENT,'');
  out=out.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g,(m,close,name,attrs)=>{
    name=name.toLowerCase();
    if(!ALLOWED.has(name))return '';
    if(close)return name==='img'||name==='br'||name==='hr'?'':'</'+name+'>';
    const get=k=>{const r=attrs.match(new RegExp('\\b'+k+'\\s*=\\s*"([^"]*)"','i'));return r?r[1].replace(/&amp;/g,'&'):'';};
    if(name==='a'){const href=safeUrl(get('href'));return href?'<a href="'+esc(href)+'" rel="noopener noreferrer">':'<a>';}
    if(name==='img'){const src=safeUrl(get('src'),{img:true});return src?'<img src="'+esc(src)+'" alt="'+esc(get('alt'))+'" loading="lazy">':'';}
    return '<'+name+'>';
  });
  // Medium repeats the title as the first heading.
  const t=title.replace(/…$/,'').trim().toLowerCase();
  out=out.replace(/^\s*<h[1-4]>([\s\S]*?)<\/h[1-4]>/,(m,inner)=>inner.replace(/<[^>]+>/g,'').trim().toLowerCase().startsWith(t.slice(0,40))?'':m);
  return out.replace(/<p>\s*<\/p>/g,'').trim();
}

const hash=s=>"'sha256-"+crypto.createHash('sha256').update(s).digest('base64')+"'";
function page({title,description,canonical,css,body,favicon,imgs}){
  const csp="default-src 'none'; script-src "+gaCsp.script+"; style-src "+hash(css)+"; img-src data: "+gaCsp.img+(imgs?' '+IMG_HOSTS.map(h=>'https://'+h).join(' '):'')+"; connect-src "+gaCsp.connect+"; base-uri 'none'; form-action 'none';";
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="'+esc(csp)+'">'+gaHead+'<title>'+esc(title)+'</title><meta name="description" content="'+esc(description)+'"><meta name="author" content="Adeel Ahmad"><link rel="canonical" href="'+esc(canonical)+'"><meta property="og:title" content="'+esc(title)+'"><meta property="og:description" content="'+esc(description)+'"><meta property="og:type" content="article"><link rel="icon" href="'+favicon+'"><style>'+css+'</style></head><body>'+body+'</body></html>';
}
const topbar=site=>'<header class="topbar"><div class="container topbar-inner"><a class="wordmark" href="/"><span class="monogram">aa</span>Adeel Ahmad</a><nav class="post-nav"><a class="nav-link" href="/">Home</a><a class="nav-link" href="/blog/">Writing</a></nav></div></header>';

export function buildPages({root,dist,site,posts,css,favicon,intro,journey,timelineMd,links}){
  const contentDir=path.join(root,'data/medium-content');
  const fmt=iso=>new Date(iso+'T00:00:00Z').toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
  const withPages=[];
  for(const p of posts){
    const file=path.join(contentDir,p.id+'.html');
    if(!p.slug||!fs.existsSync(file))continue;
    const content=sanitize(fs.readFileSync(file,'utf8'),p.title);
    const local=site+'blog/'+p.slug+'/';
    const body=topbar(site)+'<main class="container post"><p class="post-date">'+esc(fmt(p.date))+'</p><h1>'+esc(p.title)+'</h1><p class="post-origin">First published on <a href="'+esc(p.url)+'" rel="noopener noreferrer">Medium</a>.</p><article class="post-body">'+content+'</article><p class="post-origin"><a href="/blog/">← All writing</a></p></main>';
    fs.mkdirSync(path.join(dist,'blog',p.slug),{recursive:true});
    fs.writeFileSync(path.join(dist,'blog',p.slug,'index.html'),page({title:p.title+' · Adeel Ahmad',description:p.excerpt||p.title,canonical:p.url,css,body,favicon,imgs:true}));
    withPages.push(Object.assign({},p,{local}));
  }
  const list=posts.map(p=>{const w=withPages.find(x=>x.id===p.id);return '<li><span class="post-date">'+esc(fmt(p.date))+'</span><a href="'+esc(w?'/blog/'+p.slug+'/':p.url)+'">'+esc(p.title)+'</a>'+(p.excerpt?'<p>'+esc(p.excerpt)+'</p>':'')+'</li>';}).join('');
  fs.mkdirSync(path.join(dist,'blog'),{recursive:true});
  fs.writeFileSync(path.join(dist,'blog/index.html'),page({title:'Writing · Adeel Ahmad',description:'Posts by Adeel Ahmad, also published on Medium.',canonical:site+'blog/',css,favicon,body:topbar(site)+'<main class="container post"><h1>Writing</h1><p class="post-origin">Things I’ve written, newest first. They’re also on <a href="'+esc(links.blog)+'" rel="noopener noreferrer">Medium</a>.</p><ul class="post-list">'+list+'</ul></main>'}));

  fs.writeFileSync(path.join(dist,'timeline.md'),timelineMd);
  const today=new Date().toISOString().slice(0,10);
  // Post pages point their canonical URL at Medium, where they were first published, so they stay out of the sitemap.
  const urls=[[site,today],[site+'blog/',posts[0]?.date||today],[site+'timeline.md',today]];
  fs.writeFileSync(path.join(dist,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(([u,d])=>'  <url><loc>'+esc(u)+'</loc><lastmod>'+d+'</lastmod></url>').join('\n')+'\n</urlset>\n');
  fs.writeFileSync(path.join(dist,'robots.txt'),'User-agent: *\nAllow: /\n\nSitemap: '+site+'sitemap.xml\n');
  const llms=['# Adeel Ahmad','','> Software engineer in Melbourne, Australia. This site explains how his work across software, networks, storage, security, cloud and AI connects, mostly through one habit: learning the layer underneath whatever he depends on.','',
    intro,'',
    '## How it fits together','',...journey.chapters.map(c=>'- '+c.when+': '+c.title+'. '+c.story),'',
    '## Pages','','- ['+'Full timeline]('+site+'timeline.md): every dated entry with the skills involved, as Markdown','- [Home]('+site+'): the same content as an interactive page','- [Writing]('+site+'blog/): blog posts, also published on Medium','',
    '## Writing','',...posts.map(p=>{const w=withPages.find(x=>x.id===p.id);return '- ['+p.title+']('+(w?w.local:p.url)+'): '+p.date;}),'',
    '## Elsewhere','','- [GitHub](https://github.com/adeelahmad)','- [LinkedIn]('+links.linkedin+')','- [Medium]('+links.blog+')','- [Hugging Face](https://huggingface.co/adeelahmad)',''];
  fs.writeFileSync(path.join(dist,'llms.txt'),llms.join('\n'));
  return withPages;
}
