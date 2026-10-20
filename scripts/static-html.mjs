// Next remains the source/build system. The export is a two-page static document: routing
// and interactivity do not need the framework runtime. Keep exactly one tiny local UI script.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const js=await readFile(join(root,'public/dolma.js'));
const name=`dolma-${createHash('sha256').update(js).digest('hex').slice(0,12)}.js`;
await mkdir(join(root,'out/assets'),{recursive:true});
await writeFile(join(root,'out/assets',name),js);
let count=0;
for(const file of await readdir(join(root,'out'),{recursive:true})){
  if(!file.endsWith('.html'))continue;
  const path=join(root,'out',file);
  let html=await readFile(path,'utf8');
  html=html.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/g,(tag,attributes)=>attributes.includes('data-dolma-boot')?tag:attributes.includes('data-dolma-ui')?tag.replace(/src="[^"]*"/,`src="/assets/${name}"`):'');
  html=html.replace(/<link\b[^>]*>/g,tag=>tag.includes('/_next/')&&/(?:as="script"|modulepreload)/.test(tag)?'':tag);
  await writeFile(path,html);count++;
}
console.log(`Static HTML: ${count} documents; local UI ${(js.length/1024).toFixed(1)} KB, no framework hydration.`);
