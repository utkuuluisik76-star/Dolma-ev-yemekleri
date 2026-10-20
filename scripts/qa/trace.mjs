import {launch,baseUrl,sleep,DEVICES,root} from './browser.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const browser=await launch(),events=[];
let finish;const done=new Promise(r=>finish=r);
browser.on(message=>{if(message.method==='Tracing.dataCollected')events.push(...message.params.value);if(message.method==='Tracing.tracingComplete')finish();});
try{
 await browser.send('Page.enable');await browser.send('Emulation.setDeviceMetricsOverride',DEVICES.mobile);await browser.send('Emulation.setCPUThrottlingRate',{rate:4});
 await browser.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing,v8.execute',transferMode:'ReportEvents'});
 await browser.send('Page.navigate',{url:baseUrl()});await sleep(7000);await browser.send('Tracing.end');await done;
 await mkdir(join(root,'qa'),{recursive:true});await writeFile(join(root,'qa',`trace-${process.argv.includes('--after')?'after':'before'}.json`),JSON.stringify({traceEvents:events}));
 const largest=events.filter(e=>e.ph==='X'&&['UpdateLayoutTree','Layout','FunctionCall','EvaluateScript','Paint','RunTask','Animation'].includes(e.name)).sort((a,b)=>(b.dur??0)-(a.dur??0)).slice(0,18).map(e=>({name:e.name,ms:+(e.dur/1000).toFixed(2),data:e.args?.data}));console.log(JSON.stringify(largest,null,2));
}finally{await browser.close()}
