import sharp from 'sharp';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const path=p=>fileURLToPath(new URL(p,import.meta.url));
await mkdir(path('../public/images/dolma'),{recursive:true});
const specs={
  terrace:{crop:{left:24,top:31,width:863,height:868},landscape:1.06,portrait:.76},
  table:{landscape:1.5,portrait:.8},'vine-leaves':{landscape:1.12,portrait:.8},
  sehzade:{crop:{left:0,top:0,width:840,height:861},landscape:1.12,portrait:.8},
  flowers:{landscape:1.12,portrait:.8},cabbage:{landscape:1.12,portrait:.8},plate:{landscape:1.12,portrait:.8},
  fruit:{crop:{left:0,top:0,width:863,height:862},landscape:1.12,portrait:.8},interior:{landscape:1.12,portrait:.8},
  breakfast:{crop:{left:29,top:0,width:494,height:425},landscape:1.12,portrait:.8},
  grills:{crop:{left:6,top:0,width:494,height:382},landscape:1.12,portrait:.8},
};
const exists=p=>stat(p).then(()=>true,()=>false);
const manifest={};
for(const [name,spec] of Object.entries(specs)){
  const original=await readFile(path(`../_bronfotos/${name}.png`));
  const hash=createHash('sha256').update(original).update(JSON.stringify(spec)).digest('hex').slice(0,10);
  let input=sharp(original).rotate();if(spec.crop)input=input.extract(spec.crop);
  const clean=await input.toBuffer();const meta=await sharp(clean).metadata();
  manifest[name]={};
  for(const kind of ['landscape','portrait']){
    const ratio=spec[kind],max=Math.floor(Math.min(meta.width,meta.height*ratio));
    const widths=[400,640,860].filter(w=>w<max);widths.push(max);
    const out={avif:[],webp:[],width:max,height:Math.round(max/ratio)};
    for(const width of widths){
      for(const format of ['avif','webp']){
        const file=`${name}-${hash}-${kind}-${width}.${format}`;
        const dest=path(`../public/images/dolma/${file}`);
        if(!await exists(dest))await sharp(clean).resize(width,Math.round(width/ratio),{fit:'cover',position:name==='terrace'?'north':'centre'})[format]({quality:format==='avif'?55:80,...(format==='avif'?{effort:4}:{})}).toFile(dest);
        out[format].push(`/images/dolma/${file} ${width}w`);
      }
    }
    manifest[name][kind]={...out,avif:out.avif.join(', '),webp:out.webp.join(', '),src:out.webp.at(-1).split(' ')[0]};
  }
  console.log(`media: ${name}`);
}
const logo=await readFile(path('../_bronfotos/logo.png'));
await sharp(logo).resize({width:310,withoutEnlargement:true}).webp({quality:90}).toFile(path('../public/logo.webp'));
for(const size of [32,48,192,512])await sharp(logo).resize(size,size,{fit:'contain',background:'#0c2e49'}).png().toFile(path(`../public/${size<100?'favicon-'+size:'icon-'+size}.png`));
await sharp(logo).resize(180,180,{fit:'contain',background:'#0c2e49'}).png().toFile(path('../public/apple-touch-icon.png'));
const eye=await readFile(path('../public/dolma-eye.svg'),'utf8');
const still=eye.replaceAll('animation:sway 7s ease-in-out infinite','animation:none').replaceAll('animation:drift 7s ease-in-out infinite','animation:none');
await writeFile(path('../public/dolma-eye-static.svg'),still);
const nazarHash=createHash('sha256').update(still).digest('hex').slice(0,10),nazarSources=[];
for(const width of [300,440,660,880]){
  const file=`nazar-${nazarHash}-${width}.webp`,target=path(`../public/images/dolma/${file}`);
  if(!await exists(target))await sharp(Buffer.from(still),{density:192}).resize({width}).webp({quality:92,alphaQuality:100}).toFile(target);
  nazarSources.push(`/images/dolma/${file} ${width}w`);
}
await writeFile(path('../src/content/nazar.json'),JSON.stringify({src:nazarSources[1].split(' ')[0],srcSet:nazarSources.join(', ')})+'\n');
await writeFile(path('../src/content/media.json'),JSON.stringify(manifest,null,2)+'\n');
const terrace=await sharp(path('../_bronfotos/terrace.png')).extract(specs.terrace.crop).resize(740,630,{fit:'cover'}).toBuffer();
for(const locale of ['tr','en']){
  const text=locale==='tr'?'Bodrum sokaklarında ev yemeği.':'Home cooking in Bodrum.';
  const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f5f3ec"/><text x="790" y="225" fill="#0c2e49" font-size="57" font-family="Georgia">DOLMA</text><text x="790" y="280" fill="#174c91" font-size="22" font-family="Arial">Ev Yemeği · Bodrum</text><text x="790" y="358" fill="#0c2e49" font-size="18" font-family="Arial">${text}</text><text x="790" y="545" fill="#0c2e49" font-size="16" font-family="Arial">Demo · U-LUKSSTUDYO</text></svg>`);
  await sharp(svg).composite([{input:terrace,left:0,top:0}]).jpeg({quality:85}).toFile(path(`../public/og-${locale}.jpg`));
}
