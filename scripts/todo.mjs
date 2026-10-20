import {readFile} from 'node:fs/promises';
const pending=JSON.parse(await readFile(new URL('../content/pending.json',import.meta.url),'utf8'));
const open=Object.entries(pending).filter(([,v])=>v.startsWith('TO CONFIRM'));
console.log(open.length?`${open.length} open punten:\n${open.map(([k,v])=>`  ${k}: ${v}`).join('\n')}`:'Geen open placeholders.');
if(process.argv.includes('--strict')&&open.length)process.exitCode=1;
