// Print SHA-256 hashes for private terms, one term per line on stdin.
// Append the output to data/private-terms.sha256 so the build blocks those terms
// without the list itself revealing them. Terms of up to four words are supported.
import crypto from 'node:crypto';
import {normalizeTerm} from './terms.mjs';
let input='';
for await (const chunk of process.stdin)input+=chunk;
for(const line of input.split('\n').map(normalizeTerm).filter(Boolean))
  console.log(crypto.createHash('sha256').update(line).digest('hex'));
