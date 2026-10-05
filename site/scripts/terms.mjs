// Shared tokenizer for the private-term check.
import crypto from 'node:crypto';
export const MAX_WORDS=4;
const words=s=>String(s).normalize('NFKD').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
export const normalizeTerm=s=>words(s).join(' ');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
// Returns every hashed phrase of one to MAX_WORDS words found in the text.
export function phraseHashes(text){
  const w=words(text), out=new Set();
  for(let i=0;i<w.length;i++)for(let n=1;n<=MAX_WORDS&&i+n<=w.length;n++)out.add(sha(w.slice(i,i+n).join(' ')));
  return out;
}
