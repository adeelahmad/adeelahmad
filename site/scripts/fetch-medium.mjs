// Merge the latest Medium posts into data/medium.json.
// Medium's feed only lists the newest 10 posts, so saved posts are kept when they drop off.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const FEED=process.env.MEDIUM_FEED||'https://blog.adeelahmad.net/feed';
const FILE=path.join(ROOT,'data/medium.json');
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
const decode=s=>s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):parseInt(e.slice(1),10)):(entities[e.toLowerCase()]??m));
const cdata=s=>(s||'').replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/,'$1').trim();
const tag=(xml,name)=>{const m=xml.match(new RegExp('<'+name+'[^>]*>([\\s\\S]*?)</'+name+'>'));return m?cdata(m[1]):'';};
const text=html=>decode(html.replace(/<(figure|h[1-6])[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();
function excerpt(html){
  const words=text(html).split(' ').filter(Boolean);
  return words.length>45?words.slice(0,45).join(' ').replace(/[,;:.]?$/,'…'):words.join(' ');
}
function parse(xml){
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([,item])=>{
    const guid=tag(item,'guid'), id=(guid.match(/\/p\/([0-9a-f]+)/)||[])[1];
    const url=new URL(tag(item,'link'));url.search='';
    return {id, title:decode(tag(item,'title')), url:url.toString(), date:new Date(tag(item,'pubDate')).toISOString().slice(0,10),
      topics:[...item.matchAll(/<category>([\s\S]*?)<\/category>/g)].map(m=>decode(cdata(m[1]))),
      excerpt:excerpt(tag(item,'content:encoded'))};
  }).filter(p=>p.id&&p.title);
}
const res=await fetch(FEED,{headers:{'user-agent':'adeelahmad.net site build'}});
if(!res.ok)throw Error('Medium feed returned '+res.status);
const fresh=parse(await res.text());
if(!fresh.length)throw Error('Medium feed had no posts.');
const saved=JSON.parse(fs.readFileSync(FILE,'utf8'));
const byId=new Map(saved.posts.map(p=>[p.id,p]));
for(const p of fresh)byId.set(p.id,p);
const posts=[...byId.values()].sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
fs.writeFileSync(FILE,JSON.stringify({feed:FEED,posts},null,1)+'\n');
console.log(JSON.stringify({fetched:fresh.length,saved:posts.length}));
