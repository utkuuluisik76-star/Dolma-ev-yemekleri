import type { NextConfig } from 'next';

// Static export: the site is plain HTML/CSS/JS in /out and can be hosted anywhere (Cloudflare Pages).
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  // Images are pre-optimised by scripts/images.mjs and scripts/cms-images.mjs (AVIF + WebP, art-directed crops).
  images: { unoptimized: true },
  reactStrictMode: true,
  // Critical CSS: the stylesheet is small, so it is inlined into the HTML instead of a render-blocking request.
  experimental: { inlineCss: true },
};

export default config;
