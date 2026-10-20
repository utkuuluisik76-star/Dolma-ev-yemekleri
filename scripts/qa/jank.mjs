// Frame times on a scripted full-page scroll, per section: npm run qa:jank [-- <url>] [--mobile]
// Budget (studio blueprint): desktop 0 frames over 20 ms; phone at 4× CPU slowdown under 2% slow
// frames and no task over 100 ms. --mobile emulates a 390×844 touch phone with 4× CPU slowdown.
// A slow section: take a performance trace, find whether style, layout, paint or script is the
// cost, fix the cause and measure again.
import { DEVICES, MOBILE_UA, baseUrl, launch, sleep } from './browser.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import {root} from './browser.mjs';
import {join} from 'node:path';

const mobile = process.argv.includes('--mobile');
const url = baseUrl() + (process.argv.find((a) => a.startsWith('/')) ?? '/');
const browser = await launch();
const tracing=process.argv.includes('--trace'),traceEvents=[];
let traceFinished;
const traceDone=new Promise(resolve=>traceFinished=resolve);
if(tracing)browser.on(message=>{if(message.method==='Tracing.dataCollected')traceEvents.push(...message.params.value);if(message.method==='Tracing.tracingComplete')traceFinished();});
await browser.send('Runtime.enable');
await browser.send('Emulation.setDeviceMetricsOverride', DEVICES[mobile ? 'mobile' : 'desktop']);
if (mobile) {
  await browser.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await browser.send('Emulation.setUserAgentOverride', { userAgent: MOBILE_UA, platform: 'Android' });
  await browser.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}
await browser.send('Page.enable');
await browser.send('Page.navigate', { url });
await sleep(6000);
// first interaction starts the decorative motion (src/lib/motion/runtime.ts)
await browser.evaluate(`window.dispatchEvent(new Event('scroll')); window.scrollTo(0, 2); 1`);
await sleep(3000);
if(tracing)await browser.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,v8.execute',transferMode:'ReportEvents'});

const result = await browser.evaluate(`(async () => {
  const sections = [...document.querySelectorAll('main [id]')].filter((el) => !el.parentElement.closest('main [id]'));
  const sectionAt = (y) => { let cur = 'top'; for (const el of sections) if (el.getBoundingClientRect().top + scrollY <= y + innerHeight / 2) cur = el.id; return cur; };
  const total = document.documentElement.scrollHeight - innerHeight;
  const long = [];
  const po = new PerformanceObserver((l) => l.getEntries().forEach((e) => long.push([Math.round(scrollY), Math.round(e.duration)])));
  po.observe({ type: 'longtask' });
  const frames = [];
  let y = 0, last = performance.now();
  await new Promise((res) => { const step = (t) => { frames.push([y, t - last]); last = t; y += 16; scrollTo(0, y); if (y < total) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
  po.disconnect();
  const per = {};
  for (const [fy, dt] of frames.slice(2)) (per[sectionAt(fy)] ??= []).push(dt);
  const stat = (a) => { const s = [...a].sort((x, y) => x - y); return { frames: s.length, p50: +s[s.length >> 1].toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), max: +s.at(-1).toFixed(1), over20ms: s.filter((v) => v > 20).length }; };
  const out = { all: stat(frames.slice(2).map((f) => f[1])) };
  for (const k in per) out[k] = stat(per[k]);
  out.longTasks = long.map(([ly, d]) => sectionAt(ly) + ': ' + d + ' ms');
  return out;
})()`);

if(tracing){await browser.send('Tracing.end');await traceDone;await mkdir(join(root,'qa'),{recursive:true});await writeFile(join(root,'qa',`trace-scroll-${mobile?'mobile':'desktop'}.json`),JSON.stringify({traceEvents}));console.log('Trace main-thread events:',JSON.stringify(traceEvents.filter(e=>e.ph==='X'&&['RunTask','Layout','Paint','UpdateLayoutTree','FunctionCall','EvaluateScript'].includes(e.name)).sort((a,b)=>(b.dur??0)-(a.dur??0)).slice(0,12).map(e=>({name:e.name,ms:+(e.dur/1000).toFixed(2),data:e.args?.data}))));}
await browser.close();
await mkdir(join(root,'qa'),{recursive:true});
await writeFile(join(root,'qa',`frames-${mobile?'mobile':'desktop'}${tracing?'-trace':''}.json`),JSON.stringify(result,null,2));
console.log(`${url}  ${mobile ? 'phone, 4× CPU slowdown' : 'desktop'}`);
for (const [section, s] of Object.entries(result)) if (section !== 'longTasks') console.log(`  ${section.padEnd(14)} p50 ${s.p50} ms  p95 ${s.p95} ms  max ${s.max} ms  >20 ms: ${s.over20ms}/${s.frames}`);
console.log(`  long tasks: ${result.longTasks.length ? result.longTasks.join(', ') : 'none'}`);
const slowShare = result.all.over20ms / result.all.frames;
const pass = mobile ? slowShare < 0.02 && !result.longTasks.some((t) => +t.split(': ')[1].split(' ')[0] > 100) : result.all.over20ms === 0;
console.log(pass ? '  ✓ within budget' : `  ✗ over budget (${(slowShare * 100).toFixed(1)}% slow frames)`);
process.exit(pass ? 0 : 1);
