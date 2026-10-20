// Full-page screenshots of every page at 390, 768 and 1440 px: npm run qa:shots [-- https://live-domain] [--reduced]
// Output: qa/shots/<page>-<width>.jpg (not committed). --reduced emulates prefers-reduced-motion
// (no scenes, no smooth scroll), the layout visitors with that setting get.
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { MOBILE_UA, baseUrl, launch, pages, root, scrollThrough, sleep } from './browser.mjs';

const sharp = createRequire(import.meta.url)('sharp');
const base = baseUrl();
const reduced = process.argv.includes('--reduced');
const dir = join(root, 'qa', reduced ? 'shots-reduced' : 'shots');
await mkdir(dir, { recursive: true });

const browser = await launch();
await browser.send('Page.enable');
if (reduced) await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

for (const path of await pages()) {
  for (const width of [390, 768, 1440]) {
    const mobile = width < 768;
    await browser.send('Emulation.setDeviceMetricsOverride', { width, height: mobile ? 844 : 900, deviceScaleFactor: 1, mobile });
    if (mobile) await browser.send('Emulation.setUserAgentOverride', { userAgent: MOBILE_UA, platform: 'Android' });
    await browser.send('Page.navigate', { url: base + path });
    await sleep(3500);
    await browser.evaluate(scrollThrough);
    // A full-document capture does not scroll the viewport: Chromium otherwise leaves
    // content-visibility:auto sections blank after scrollThrough returns to the top.
    // This inspection-only override exposes their normal, in-viewport layout.
    await browser.evaluate(`document.querySelectorAll('main>section,footer').forEach(el=>el.style.contentVisibility='visible');1`);
    await sleep(500);
    const height = await browser.evaluate('document.documentElement.scrollHeight');
    const shot = await browser.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
    const name = `${path.replace(/^\/|\/$/g, '').replace(/\//g, '_') || 'home'}-${width}.jpg`;
    await sharp(Buffer.from(shot.data, 'base64')).jpeg({ quality: 72 }).toFile(join(dir, name));
    console.log(`${name}  ${width}x${height}`);
  }
}
await browser.close();
console.log(`Saved in ${dir}. Fixed bars (header, bottom bar) appear once per screen height in full-page shots: that is the capture, not the page.`);
