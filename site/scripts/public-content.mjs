// Use the same private-data checks as the build before saving feed content.
// The build remains the final gate for the complete publication model and pages.
import {phraseHashes} from './terms.mjs';

const patterns={
  'email address':/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/,
  'UUID':/\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/i,
  'local file path':/(?:\/Users\/|\/mnt\/|file:\/\/)/,
};

export function privateContentReason(input,blocked){
  const sources=[JSON.stringify(input)];
  const collect=value=>{
    if(typeof value==='string')sources.push(value);
    else if(Array.isArray(value))value.forEach(collect);
    else if(value&&typeof value==='object')Object.values(value).forEach(collect);
  };
  // JSON escapes whitespace; scan raw values too so phrases spanning it still match.
  collect(input);
  // Check both markup and visible text, as build.mjs does before and after rendering.
  for(const value of sources.flatMap(text=>[text,text.replace(/<[^>]+>/g,' ')])){
    if([...phraseHashes(value)].some(h=>blocked.has(h)))return 'private term';
    for(const [kind,rx] of Object.entries(patterns))if(rx.test(value))return kind;
  }
  return '';
}
