import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {privateContentReason} from '../scripts/public-content.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const privateTerm='fictional restricted client';
const privateHash=crypto.createHash('sha256').update(privateTerm).digest('hex');
const blocked=new Set([privateHash]);

test('pre-save checks retain every existing private-data rule',()=>{
  for(const value of [privateTerm,'person@example.invalid','01234567-89ab-cdef-0123-456789abcdef','/Users/example/file','/mnt/example/file','file:///example']){
    assert.ok(privateContentReason(value,blocked));
  }
  assert.equal(privateContentReason('<p>fictional</p><p>restricted client</p>',blocked),'private term');
  assert.equal(privateContentReason('<p>fictional\nrestricted\tclient</p>',blocked),'private term');
  assert.equal(privateContentReason({title:'fictional\nrestricted client'},blocked),'private term');
  assert.equal(privateContentReason('A public article about compilers.',blocked),'');
});

const safeIntro='This public introduction discusses software and its practical applications. '.repeat(7);
function item({id,title='A public post',html='<p>'+safeIntro+'</p>',date='Thu, 05 Nov 2026 00:15:00 GMT'}){
  return '<item><guid>https://medium.com/p/'+id+'</guid><title><![CDATA['+title+']]></title><link>https://blog.adeelahmad.net/public-post-'+id+'?source=rss</link><pubDate>'+date+'</pubDate><category><![CDATA[software]]></category><content:encoded><![CDATA['+html+']]></content:encoded></item>';
}
async function run(root,url){
  return await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,['scripts/fetch-medium.mjs'],{cwd:root,env:{...process.env,MEDIUM_FEED:url}});
    let stdout='',stderr='';
    child.stdout.on('data',d=>stdout+=d);child.stderr.on('data',d=>stderr+=d);
    child.on('error',reject);child.on('exit',code=>resolve({code,stdout,stderr}));
  });
}

test('refresh keeps safe links, rejects unsafe bodies, and preserves the archive across repeat runs',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'medium-refresh-'));
  const data=path.join(root,'data'),content=path.join(data,'medium-content');
  fs.mkdirSync(content,{recursive:true});
  fs.cpSync(path.join(ROOT,'scripts'),path.join(root,'scripts'),{recursive:true});
  fs.writeFileSync(path.join(data,'private-terms.sha256'),privateHash+'\n');
  const saved={id:'aa00',title:'Older archived post',date:'2024-01-01',url:'https://blog.adeelahmad.net/older-aa00',slug:'older-aa00',topics:[],excerpt:'Still available.'};
  fs.writeFileSync(path.join(data,'medium.json'),JSON.stringify({feed:'https://blog.adeelahmad.net/feed',posts:[saved]}));
  fs.writeFileSync(path.join(content,'bb00.html'),'<p>A stale mirror.</p>');
  const xml='<rss><channel>'+[
    item({id:'ab00',html:'<h1>A public post</h1><p>'+safeIntro+'</p><script>hidden()</script>'}),
    item({id:'bb00',title:'A post with a restricted body',html:'<p>'+safeIntro+'</p><p>'+privateTerm+'</p>'}),
    item({id:'cc00',title:'A post with an illustrative path',html:'<p>'+safeIntro+'</p><pre>cd /mnt/example</pre>'}),
    item({id:'dd00',title:privateTerm}),
    item({id:'ee00',html:'<p>'+safeIntro+'</p><p>fictional\nrestricted\tclient</p>'}),
    item({id:'ff00',title:'fictional\nrestricted client'}),
    item({id:'aa00',title:'Unsafe updated title '+privateTerm}),
  ].join('')+'</channel></rss>';
  const server=http.createServer((req,res)=>{res.setHeader('content-type','application/rss+xml');res.end(xml);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const url='http://127.0.0.1:'+server.address().port+'/feed';
    let first;
    for(let attempt=0;attempt<2;attempt++){
      const result=await run(root,url);
      assert.equal(result.code,0,result.stderr);
      assert.ok(!result.stderr.includes(privateTerm));
      assert.ok(!result.stderr.includes(privateHash));
      const json=fs.readFileSync(path.join(data,'medium.json'),'utf8');
      const posts=JSON.parse(json).posts;
      assert.deepEqual(posts.map(p=>p.id),['ab00','bb00','cc00','ee00','aa00']);
      assert.equal(posts[1].title,'A post with a restricted body');
      assert.equal(posts[1].date,'2026-11-05');
      assert.equal(posts[1].url,'https://blog.adeelahmad.net/public-post-bb00');
      assert.deepEqual(posts[4],saved);
      assert.ok(!fs.existsSync(path.join(content,'bb00.html')));
      assert.ok(!fs.existsSync(path.join(content,'cc00.html')));
      assert.ok(!fs.existsSync(path.join(content,'dd00.html')));
      assert.ok(!fs.existsSync(path.join(content,'ee00.html')));
      assert.ok(!fs.existsSync(path.join(content,'ff00.html')));
      const body=fs.readFileSync(path.join(content,'ab00.html'),'utf8');
      assert.ok(body.includes(safeIntro));
      assert.ok(!body.includes('<script>'));
      assert.ok(!body.includes('hidden()'));
      assert.equal(privateContentReason(json,blocked),'');
      if(first)assert.equal(json,first);else first=json;
    }
  }finally{
    await new Promise(resolve=>server.close(resolve));
    fs.rmSync(root,{recursive:true,force:true});
  }
});

