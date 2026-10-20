import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {root} from './browser.mjs';
const html=await readFile(join(root,'out/index.html'),'utf8');
const hero=html.match(/<section class="hero chapter"[\s\S]*?<\/section>/)?.[0];
if(!hero)throw new Error('Hero not found');
await mkdir(join(root,'out/qa-hero-test'),{recursive:true});
await writeFile(join(root,'out/qa-hero-test/index.html'),html.replace(/<main id="main">[\s\S]*?<\/main>/,`<main id="main">${hero}</main>`));
