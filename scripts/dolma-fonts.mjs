import subsetFont from 'subset-font';
import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const path=p=>fileURLToPath(new URL(p,import.meta.url));
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>String.fromCodePoint(a+i)).join('');
const chars={latin:range(0x20,0x7e)+range(0xa0,0xff)+'‘’‚“”„–—…•€→←×',tr:'ĞğİıŞş'};
await mkdir(path('../public/fonts'),{recursive:true});
for(const family of ['fraunces','source-sans-3']){
  const dir=path(`../node_modules/@fontsource-variable/${family}/files/`);
  const files=await readdir(dir);
  for(const [part,text] of Object.entries(chars)){
    const subset=part==='tr'?'latin-ext':'latin';
    const from=files.find(f=>f===`${family}-${subset}-wght-normal.woff2`)??files.find(f=>f.startsWith(`${family}-${subset}-`)&&f.endsWith('-normal.woff2'));
    if(!from)throw new Error(`Font not found: ${family} ${subset}`);
    const data=await subsetFont(await readFile(dir+from),text,{targetFormat:'woff2'});
    await writeFile(path(`../public/fonts/${family}-${part}.woff2`),data);
    console.log(`${family}-${part}: ${(data.length/1024).toFixed(1)} KB`);
  }
  await copyFile(path(`../node_modules/@fontsource-variable/${family}/LICENSE`),path(`../public/fonts/${family}-LICENSE.txt`));
}
