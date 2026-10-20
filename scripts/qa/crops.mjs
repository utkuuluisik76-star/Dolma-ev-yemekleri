import sharp from 'sharp';
import {join} from 'node:path';
import {root} from './browser.mjs';
for(const width of [390,768,1440]){
  await sharp(join(root,'qa','shots',`home-${width}.jpg`)).extract({left:0,top:0,width,height:Math.min(width===390?1150:1050,6904)}).toFile(join(root,'qa',`hero-${width}.jpg`));
}
for(const width of [390,1440]){
  const source=join(root,'qa','shots',`home-${width}.jpg`),meta=await sharp(source).metadata();
  for(let top=0,index=1;top<meta.height;top+=1400,index++){
    await sharp(source).extract({left:0,top,width,height:Math.min(1400,meta.height-top)}).toFile(join(root,'qa',`inspection-${width}-${index}.jpg`));
  }
}
