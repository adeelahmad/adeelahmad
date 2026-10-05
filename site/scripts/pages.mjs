// The Medium post sanitizer, plus the plain-text extras: timeline.md, sitemap.xml, robots.txt and llms.txt.
// The HTML pages themselves come from src/render.mjs.
import fs from 'node:fs';
import path from 'node:path';

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ALLOWED=new Set(['p','h1','h2','h3','h4','blockquote','pre','code','em','strong','b','i','a','ul','ol','li','figure','figcaption','img','br','hr']);
const DROP_WITH_CONTENT=/<(script|style|iframe|object|embed|noscript|svg|form)\b[\s\S]*?<\/\1\s*>/gi;
const IMG_HOSTS=['miro.medium.com','cdn-images-1.medium.com'];

function safeUrl(u,{img}={}){
  try{
    const url=new URL(u);
    if(url.protocol!=='https:'&&!(url.protocol==='http:'&&!img))return null;
    if(img&&!IMG_HOSTS.includes(url.hostname))return null;
    // Medium's retina images end in @2x; encode the @ so the URL isn't mistaken for an email address.
    if(img)url.pathname=url.pathname.replaceAll('@','%40');
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

export function buildPages({dist,site,posts,intro,journey,timelineMd,links}){
  const withPages=posts.filter(p=>p.local).map(p=>Object.assign({},p,{local:site+'blog/'+p.slug+'/'}));
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
