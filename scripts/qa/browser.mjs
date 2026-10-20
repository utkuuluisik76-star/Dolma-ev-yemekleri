// Shared helpers for the QA scripts: a headless Chromium (Edge by default; CHROME_PATH to override)
// driven over the DevTools protocol, and the list of pages in the static export.
import { spawn, spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../..', import.meta.url));
export const BROWSER = process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
// Same foreground scheduling safeguards used by Lighthouse's Chrome launcher. Without
// these, Windows can throttle an occluded headless renderer and distort wall-clock times.
export const AUDIT_FLAGS = ['--no-first-run', '--no-default-browser-check', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-features=CalculateNativeWinOcclusion'];
export const DEVICES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  mobile: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
};
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A phone must also *say* it is a phone: Wix and other platforms pick their mobile layout from the
 * user agent, so a desktop UA in a 390 px viewport measures a squeezed desktop page (false overflow).
 */
export const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';

/** Applies a DEVICES entry: viewport, touch and a matching user agent (desktopUA = the browser's own). */
export async function emulate(send, device, desktopUA) {
  const mobile = device === 'mobile';
  await send('Emulation.setDeviceMetricsOverride', DEVICES[device]);
  await send('Emulation.setTouchEmulationEnabled', { enabled: mobile, maxTouchPoints: 5 });
  await send('Emulation.setUserAgentOverride', mobile ? { userAgent: MOBILE_UA, platform: 'Android' } : { userAgent: desktopUA });
}

/**
 * Ends a browser and every process it started. proc.kill() (and even a process-tree kill) is not
 * enough on Windows: Edge starts through a launcher that exits, so the real browser, its renderers
 * and GPU process keep running and eat CPU, which skews every later measurement. Browser.close over
 * the DevTools connection shuts the whole browser down; the process kill is only a fallback.
 */
export async function closeBrowser(port, proc) {
  try {
    const { webSocketDebuggerUrl } = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
    const ws = new WebSocket(webSocketDebuggerUrl);
    await new Promise((resolve, reject) => ((ws.onopen = resolve), (ws.onerror = reject)));
    ws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
    await sleep(1500);
  } catch {
    // already gone
  }
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(proc.pid), '/T', '/F'], { stdio: 'ignore' });
  else proc.kill('SIGKILL');
}

/** Base URL from the first argument that looks like one (default: the local `npm start` server). */
export const baseUrl = () => (process.argv.find((a) => /^https?:\/\//.test(a)) ?? `http://127.0.0.1:${Number(process.env.PORT) || 4182}`).replace(/\/$/, '');

/** Every page of the static export (out/), as paths: ['/', '/en/', '/ornek-sayfa/', …]. Run `npm run build` first. */
export async function pages() {
  const out = join(root, 'out');
  const entries = await readdir(out, { withFileTypes: true, recursive: true }).catch(() => {
    throw new Error('No out/ folder: run `npm run build` first.');
  });
  return entries
    .filter((e) => e.isFile() && e.name === 'index.html')
    .map((e) => `/${relative(out, e.parentPath ?? e.path).split(sep).join('/')}/`.replace(/\/+/g, '/'))
    // the editor and Next's 404 copies are not pages of the site
    .filter((p) => !p.startsWith('/admin') && p !== '/404/' && p !== '/_not-found/')
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
}

/**
 * Starts a headless browser and returns { send, on, close }. Lazy images are loaded eagerly
 * (headless Edge otherwise swaps them for placeholders in screenshots).
 */
export async function launch() {
  const port = 9400 + Math.floor(Math.random() * 500);
  const proc = spawn(BROWSER, [...AUDIT_FLAGS, '--headless=new', '--hide-scrollbars', '--blink-settings=lazyLoadEnabled=false', '--enable-gpu-rasterization', `--remote-debugging-port=${port}`, `--user-data-dir=${join(tmpdir(), `qa-${Date.now()}-${port}`)}`, 'about:blank']);
  let targets;
  for (let i = 0; i < 40 && !targets; i++) {
    await sleep(500);
    targets = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()).catch(() => undefined);
  }
  if (!targets) throw new Error(`Could not start ${BROWSER}`);
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (pending.has(m.id)) {
      pending.get(m.id)(m.result ?? m);
      pending.delete(m.id);
    } else if (m.method) listeners.forEach((fn) => fn(m));
  };
  const send = (method, params = {}) => new Promise((r) => (pending.set(++id, r), ws.send(JSON.stringify({ id, method, params }))));
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return r.result?.value ?? r.exceptionDetails?.exception?.description;
  };
  return {
    port,
    send,
    evaluate,
    on: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    close: async () => (ws.close(), await closeBrowser(port, proc)),
  };
}

/** Scrolls the whole page in steps (triggers lazy content and scroll scenes), then back to the top. */
export const scrollThrough = `(async () => {
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  scrollTo(0, 0); await new Promise((r) => setTimeout(r, 600));
})()`;
