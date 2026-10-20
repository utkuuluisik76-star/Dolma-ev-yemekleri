import {launch,sleep,emulate,scrollThrough,baseUrl,root} from './browser.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const browser=await launch(),results=[];let failures=0;
await browser.send('Page.enable');await browser.send('Runtime.enable');
const desktopUA=(await browser.send('Browser.getVersion')).userAgent.replace('HeadlessChrome','Chrome');
const check=(name,pass,detail)=>{results.push({name,pass,detail});console.log(`${pass?'PASS':'FAIL'} ${name}: ${JSON.stringify(detail)}`);if(!pass)failures++;};
try{
 for(const type of ['order','table']){
  await browser.send('Page.navigate',{url:baseUrl()});await sleep(1500);
  const firstClick=await browser.evaluate(`(()=>{const before=!!document.getElementById('request-type');document.querySelector(${JSON.stringify(type==='order'?'a[data-request-type="order"]':'.hero-actions a:not([data-request-type])')}).click();return {before,after:!!document.getElementById('request-type'),type:document.getElementById('request-type')?.value}})()`);
  check(`first click ${type}`,firstClick.after&&(type!=='order'||firstClick.type==='order'),firstClick);
 }
 for(const locale of ['tr','en']){
  for(const device of ['desktop','mobile']){
   await emulate(browser.send,device,desktopUA);await browser.send('Page.navigate',{url:baseUrl()+(locale==='tr'?'/':'/en/')});await sleep(2000);await browser.evaluate(scrollThrough);
   const result=await browser.evaluate(`(()=>{
    const links=[...document.querySelectorAll('a[href^="#"]')];
    const missing=links.filter(a=>!document.getElementById(a.hash.slice(1))).map(a=>a.hash);
    const small=[...document.querySelectorAll('a,button,input,select,textarea,summary')].filter(e=>e.getClientRects().length&&!e.matches('.skip,:disabled')).map(e=>({text:(e.textContent||e.getAttribute('aria-label')||e.id).trim().slice(0,55),r:e.getBoundingClientRect()})).filter(e=>e.r.width<43.5||e.r.height<43.5).map(e=>({text:e.text,width:e.r.width,height:e.r.height}));
    const all=[...document.querySelectorAll('body *')].filter(e=>e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&e.getClientRects().length);
    const rgb=s=>s.match(/[\\d.]+/g)?.map(Number)||[0,0,0];
    const luminance=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    const bad=[];let measured=0,min=100;
    for(const el of all){
     if(['SCRIPT','STYLE','NOSCRIPT','OPTION'].includes(el.tagName)||el.closest('[aria-hidden="true"]'))continue;
     const style=getComputedStyle(el);if(style.visibility==='hidden')continue;
     const range=document.createRange();range.selectNodeContents(el);if(!range.getBoundingClientRect().width)continue;
     const fg=rgb(style.color);let p=el,bg;
     while(p){const c=rgb(getComputedStyle(p).backgroundColor);if(c.length===3||c[3]===1){bg=c;break}p=p.parentElement}bg??=[245,243,236];
     const a=luminance(fg),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);min=Math.min(min,ratio);measured++;if(ratio<4.5)bad.push({text:el.textContent.trim().slice(0,70),ratio:+ratio.toFixed(2)});
    }
    return {missing,small,contrast:{measured,min:+min.toFixed(2),bad},robots:document.querySelector('meta[name="robots"]')?.content,lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth-innerWidth};
   })()`);
   check(`${locale} ${device} anchors`,result.missing.length===0,result.missing);check(`${locale} ${device} targets`,result.small.length===0,result.small);check(`${locale} ${device} contrast Range rects`,result.contrast.bad.length===0,result.contrast);check(`${locale} ${device} metadata`,result.robots.includes('noindex')&&result.lang===locale,result.robots);check(`${locale} ${device} overflow`,result.overflow===0,result.overflow);
   const scripts=await browser.evaluate(`({framework:[...document.scripts].filter(s=>s.src.includes('/_next/')).length,local:[...document.scripts].filter(s=>s.src.includes('/assets/dolma-')).length})`);check(`${locale} ${device} static script`,scripts.framework===0&&scripts.local===1,scripts);
   const photoContrast=await browser.evaluate(`(()=>{const rgb=s=>s.match(/[\\d.]+/g).map(Number),shade=rgb(getComputedStyle(document.querySelector('.chapter-shade')).backgroundColor),fg=rgb(getComputedStyle(document.querySelector('.chapter-copy')).color),bg=shade.slice(0,3).map(c=>c*shade[3]+255*(1-shade[3])),lum=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);return +((lum(fg)+.05)/(lum(bg)+.05)).toFixed(2)})()`);check(`${locale} ${device} photo shade worst-case`,photoContrast>=4.5,photoContrast);
  }
  const form=await browser.evaluate(`(async()=>{const set=async(id,value)=>{const e=document.getElementById(id),proto=e.tagName==='SELECT'?HTMLSelectElement.prototype:e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,value);e.dispatchEvent(new Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));await new Promise(r=>setTimeout(r,120));};await set('request-type','table');await set('request-note','İki kişi, pencere yanı & çay?');await set('request-day','2026-10-20');await set('request-time','14:45');await set('request-name','Utku');return {message:document.querySelector('#message-preview').textContent,url:document.querySelector('[data-whatsapp-preview]').href};})()`);
  const url=new URL(form.url),text=url.searchParams.get('text');check(`${locale} WhatsApp preview`,url.pathname==='/905330906926'&&text===form.message&&text.includes('20.10.2026')&&text.includes('14:45')&&text.includes('Utku')&&text.includes('İki kişi, pencere yanı & çay?')&&text.startsWith('Merhaba, web sitenizden bilgi almak ya da masa istemek istiyorum.'),form);
  const order=await browser.evaluate(`(async()=>{document.querySelector('a[data-request-type="order"]').click();await new Promise(r=>setTimeout(r,200));return {type:document.querySelector('#request-type').value,message:document.querySelector('#message-preview').textContent,url:document.querySelector('[data-whatsapp-preview]').href};})()`);check(`${locale} order button`,order.type==='order'&&order.message.includes('Talebim: Sipariş vermek.')&&new URL(order.url).searchParams.get('text')===order.message,order);
  const book=await browser.evaluate(`(async()=>{document.getElementById('menu').scrollIntoView();document.querySelector('[data-book-next]').click();await new Promise(r=>setTimeout(r,1000));const track=document.querySelector('[data-menu-track]');return {page:Math.round(track.scrollLeft/track.clientWidth),status:document.querySelector('[data-book-status]').textContent};})()`);check(`${locale} menu book`,book.page===1&&book.status==='2 / 4',book);
  const keyboard=await browser.evaluate(`(async()=>{const track=document.querySelector('[data-menu-track]');track.focus();track.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));await new Promise(r=>setTimeout(r,1000));return document.querySelector('[data-book-status]').textContent})()`);check(`${locale} menu keyboard`,keyboard==='3 / 4',keyboard);
  const navigation=await browser.evaluate(`(()=>{const menu=document.querySelector('.mobile-menu');menu.querySelector('summary').click();const opened=menu.open;menu.querySelector('a[href="#location"]').click();return {opened,closed:!menu.open}})()`);check(`${locale} mobile navigation`,navigation.opened&&navigation.closed,navigation);
  const eye=await browser.evaluate(`(async()=>{scrollTo(0,0);await new Promise(r=>setTimeout(r,200));const eye=document.querySelector('[data-eye]'),button=eye.querySelector('button');button.click();const paused=eye.dataset.active;button.click();return {paused,playing:eye.dataset.active};})()`);check(`${locale} nazar pause`,eye.paused==='false'&&eye.playing==='true',eye);
 }
 await browser.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await browser.send('Page.navigate',{url:baseUrl()});await sleep(2000);await browser.evaluate(scrollThrough);
 const reduced=await browser.evaluate(`({motion:document.documentElement.classList.contains('motion'),active:document.querySelector('[data-eye]').dataset.active,animation:getComputedStyle(document.querySelector('.eye-art')).animationName})`);check('reduced motion',!reduced.motion&&reduced.active==='false'&&reduced.animation==='none',reduced);
 await browser.send('Emulation.setScriptExecutionDisabled',{value:true});await browser.send('Page.navigate',{url:baseUrl()});await sleep(2000);
 await browser.evaluate(`document.querySelectorAll('main>section,footer').forEach(el=>el.style.contentVisibility='visible');1`);await sleep(500);
 const metrics=await browser.send('Page.getLayoutMetrics');const shot=await browser.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:390,height:metrics.cssContentSize.height,scale:1}});await mkdir(join(root,'qa'),{recursive:true});await writeFile(join(root,'qa','no-js-390.png'),Buffer.from(shot.data,'base64'));
 // Runtime.evaluate still evaluates DevTools expressions when page script execution is disabled.
 const staticResult=await browser.evaluate(`({h1:document.querySelectorAll('h1').length,hidden:getComputedStyle(document.querySelector('.request-fields')).display,eye:document.querySelector('[data-eye]').dataset.active,wa:document.querySelector('[data-whatsapp-preview]').href,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth})`);
 check('no-JS static',staticResult.h1===1&&staticResult.hidden==='none'&&staticResult.eye==='false'&&staticResult.wa.includes('905330906926')&&staticResult.overflow===0,staticResult);
 await writeFile(join(root,'qa','dolma-checks.json'),JSON.stringify(results,null,2));
}finally{await browser.close()}
process.exitCode=failures?1:0;
