// Checks every page on desktop and phone: npm run qa [-- https://live-domain]
//   console errors and hydration warnings, failed requests, horizontal overflow, exactly one H1,
//   images without alt or without width/height, the .motion class after load, open placeholders.
// Default target: the local build (`npm run build`, then `npm start`). Pass the live URL after
// every deploy to repeat the check on the real host. Exits with an error when something fails.
import { baseUrl, emulate, launch, pages, scrollThrough, sleep } from './browser.mjs';

const base = baseUrl();
const list = await pages();
const browser = await launch();
let errors = [];
let failed = [];
const requests = new Map();
browser.on((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(`exception: ${(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text).split('\n')[0]}`);
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
    const text = m.params.args.map((a) => a.value ?? a.description).join(' ');
    if (m.params.type === 'error' || /hydrat/i.test(text)) errors.push(`console.${m.params.type}: ${text.slice(0, 160)}`);
  }
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/Failed to load resource/.test(m.params.entry.text)) errors.push(`log: ${m.params.entry.text.slice(0, 160)}`);
  if (m.method === 'Network.requestWillBeSent') requests.set(m.params.requestId, m.params.request.url);
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) failed.push(`${m.params.response.status} ${m.params.response.url}`);
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) failed.push(`${m.params.errorText} ${requests.get(m.params.requestId)}`);
});
await browser.send('Network.enable');
await browser.send('Runtime.enable');
await browser.send('Log.enable');
await browser.send('Page.enable');
const desktopUA = (await browser.send('Browser.getVersion')).userAgent.replace('HeadlessChrome', 'Chrome');

const pageCheck = `(() => {
  const r = document.documentElement;
  const imgs = [...document.images];
  return {
    overflow: r.scrollWidth > r.clientWidth ? r.scrollWidth - r.clientWidth : 0,
    h1: document.querySelectorAll('h1').length,
    noAlt: imgs.filter((i) => !i.hasAttribute('alt')).map((i) => i.currentSrc || i.src).slice(0, 3),
    noSize: imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.currentSrc || i.src).slice(0, 3),
    motion: r.classList.contains('motion'),
    todos: document.querySelectorAll('.todo').length,
    title: document.title,
  };
})()`;

let problems = 0;
for (const device of ['desktop', 'mobile']) {
  await emulate(browser.send, device, desktopUA);
  for (const path of list) {
    errors = [];
    failed = [];
    await browser.send('Page.navigate', { url: base + path });
    await sleep(4000);
    await browser.evaluate(scrollThrough);
    await sleep(1500);
    const r = await browser.evaluate(pageCheck);
    const issues = [
      ...errors,
      ...failed.map((f) => `failed: ${f}`),
      r.overflow && `horizontal overflow: ${r.overflow}px`,
      r.h1 !== 1 && `${r.h1} H1 elements (needs exactly 1)`,
      r.noAlt.length && `img without alt: ${r.noAlt.join(', ')}`,
      r.noSize.length && `img without width/height: ${r.noSize.join(', ')}`,
      !r.motion && '.motion missing on <html> after load',
    ].filter(Boolean);
    problems += issues.length;
    const note = r.todos ? `  (${r.todos} placeholder${r.todos > 1 ? 's' : ''})` : '';
    console.log(`${issues.length ? '✗' : '✓'} ${device.padEnd(7)} ${path}${note}${issues.map((i) => `\n    ${i}`).join('')}`);
  }
}
await browser.close();
console.log(problems ? `\n${problems} problem(s).` : `\nAll ${list.length} pages pass on desktop and mobile.`);
process.exit(problems ? 1 : 0);
