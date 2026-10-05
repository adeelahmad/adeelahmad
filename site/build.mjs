// Rebuild a self-contained public page from the allowlisted publication model.
// No private archive, network access, package install or remote service is used.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {phraseHashes} from './scripts/terms.mjs';
import {buildPages,sanitize} from './scripts/pages.mjs';
import {renderSite} from './src/render.mjs';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const D=JSON.parse(read('data/public-timeline.json'));
const J=JSON.parse(read('data/journey.json'));
const M=JSON.parse(read('data/medium.json'));
const WL=JSON.parse(read('data/writing-links.json'));
const P=JSON.parse(read('data/publications.json'));
const SITE_URL='https://adeelahmad.net/';
const BLOG_URL='https://blog.adeelahmad.net/';
const LINKEDIN_URL='https://www.linkedin.com/in/adeelahmadch/';
const hasPage=p=>p.slug&&fs.existsSync(path.join(ROOT,'data/medium-content',p.id+'.html'));
const writing=M.posts.map(p=>Object.assign({},p,{eventIds:WL[p.id]||[],local:hasPage(p)?'/blog/'+p.slug+'/':''}));
const permittedTop=['schemaVersion','edition','asOf','author','title','location','intro','description','github','periods','events','projects','domains','highlights','method'];
// Hosts public links may point to. hdl.handle.net and raw.githubusercontent.com carry the 2018 report and the 2017 slides, which Adeel asked to link.
const LINK_HOSTS=['github.com','www.linkedin.com','www.youtube.com','hdl.handle.net','raw.githubusercontent.com'];
const approvedLink=url=>{const u=new URL(url);return u.protocol==='https:'&&LINK_HOSTS.includes(u.hostname)&&!u.username&&!u.password;};
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
      if(!approvedLink(l.url))throw Error('Unapproved public reference.');
    }
  }
  for(const p of D.projects)if(!p.eventIds.length||p.eventIds.some(id=>!ids.has(id)))throw Error('Broken project reference.');
  for(const id of D.highlights)if(!ids.has(id))throw Error('Broken highlight.');
  for(const c of J.chapters){
    for(const k of ['id','when','title','story'])if(typeof c[k]!=='string'||!c[k])throw Error('Missing chapter '+k);
    if(!c.eventIds.length||c.eventIds.some(id=>!ids.has(id)))throw Error('Broken chapter reference.');
  }
  for(const p of writing){
    if(!/^[0-9a-f]+$/.test(p.id)||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!p.title)throw Error('Invalid writing entry.');
    const u=new URL(p.url);if(u.protocol!=='https:'||u.username||u.password)throw Error('Unapproved writing link.');
    if(p.eventIds.some(id=>!ids.has(id)))throw Error('Broken writing reference.');
  }
  const pubIds=new Set();
  for(const p of P.items){
    for(const k of ['id','type','date','title','venue','summary','eventId'])if(typeof p[k]!=='string'||!p[k])throw Error('Missing publication '+k);
    if(!/^[a-z0-9-]+$/.test(p.id)||pubIds.has(p.id)||!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!ids.has(p.eventId))throw Error('Invalid publication '+p.id+'.');
    pubIds.add(p.id);
    if(p.video&&!/^[\w-]{11}$/.test(p.video))throw Error('Invalid video ID.');
    if(!p.links.length||p.links.some(l=>!approvedLink(l.url)))throw Error('Unapproved publication link.');
  }
  const postText=writing.filter(p=>p.local).map(p=>sanitize(fs.readFileSync(path.join(ROOT,'data/medium-content',p.id+'.html'),'utf8'),p.title));
  const text=JSON.stringify([D,J,P,writing,postText]);
  // Hashed private terms: blocks client names and other private details without publishing the list.
  const blocked=new Set(read('data/private-terms.sha256').split('\n').map(s=>s.trim()).filter(Boolean));
  const found=[...phraseHashes(text)].filter(h=>blocked.has(h));
  if(found.length)throw Error('Private term found in public content (hash '+found[0].slice(0,12)+'…). Remove it before publishing.');
  // Name the pattern and the source (not the matched text) so a failure can be traced from CI logs.
  const patterns={'email address':/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,'UUID':/\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/i,'local file path':/(?:\/Users\/|\/mnt\/|file:\/\/)/};
  const sources=[['timeline',JSON.stringify(D)],['journey',JSON.stringify(J)],['publications',JSON.stringify(P)],['writing index',JSON.stringify(writing)],...writing.filter(p=>p.local).map((p,i)=>['post '+p.id,postText[i]])];
  for(const [kind,rx] of Object.entries(patterns))for(const [where,t] of sources)if(rx.test(t))throw Error('Potential private data detected in publication model: '+kind+' in '+where+'.');
}
validate();
const articles=Object.fromEntries(writing.filter(p=>p.local).map(p=>[p.id,sanitize(fs.readFileSync(path.join(ROOT,'data/medium-content',p.id+'.html'),'utf8'),p.title)]));
const CV=JSON.parse(read('data/cv.json'));
const cvPdf=fs.existsSync(path.join(ROOT,'static/cv.pdf'))?'../cv.pdf':'';
const files=renderSite({timeline:D,journey:J,medium:{posts:writing},writingLinks:WL,articles,cv:CV,cvPdf,publications:P});
// Everything that is published, not just the data, goes through the private-term check.
const blocked=new Set(read('data/private-terms.sha256').split('\n').map(s=>s.trim()).filter(Boolean));
for(const [rel,html] of Object.entries(files)){
  const text=html.replace(/<[^>]+>/g,' ');
  if([...phraseHashes(text)].some(h=>blocked.has(h)))throw Error('Private term found in rendered page '+rel+'. Remove it before publishing.');
}
const dist=path.join(ROOT,'dist');
fs.rmSync(dist,{recursive:true,force:true});
for(const [rel,html] of Object.entries(files)){const f=path.join(dist,rel);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,html);}
fs.cpSync(path.join(ROOT,'static'),dist,{recursive:true});
for(const f of ['styles.css','site.js'])fs.copyFileSync(path.join(ROOT,'src',f),path.join(dist,f));
const md=['# Adeel Ahmad','','Last updated October 2026','',D.intro,'','## How it fits together',''];
for(const c of J.chapters)md.push('### '+c.when+' — '+c.title,'',c.story,'');
md.push('# Timeline','');
for(const period of D.periods){md.push('## '+period,'');for(const e of D.events.filter(e=>e.period===period)){md.push('### '+e.date+' — '+e.title,'',e.body,'','**Type:** '+e.kind+' · **Workstream:** '+e.track,'','**Technologies / skills:** '+e.skills.join(', ')+'.','');if(e.note)md.push('*Context: '+e.note+'*','');md.push('Evidence: '+e.evidence+'.','');for(const l of e.links)md.push('['+l.label+']('+l.url+')');if(e.links.length)md.push('');}}
md.push('## Projects','');for(const p of D.projects)md.push('### '+p.name,'',p.description,'','Status: '+p.status+'.','');
md.push('## Everything I’ve used','',D.method.skills,'');for(const [k,skills] of Object.entries(D.domains))md.push('### '+k,'',skills.join(', ')+'.','');
md.push('## About this page','');Object.values(D.method).forEach(p=>md.push(p,''));
buildPages({dist,site:SITE_URL,posts:writing,intro:D.intro,journey:J,timelineMd:md.join('\n')+'\n',publications:P.items,links:{blog:BLOG_URL,linkedin:LINKEDIN_URL}});
console.log(JSON.stringify({chapters:J.chapters.length,milestones:D.events.length,projects:D.projects.length,posts:writing.length,postPages:Object.keys(articles).length,publications:P.items.length,pages:Object.keys(files).length,csp:'hashed inline script; self-hosted assets; Google Analytics only',build:'complete'}));
