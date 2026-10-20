import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { site, type Locale } from '@/content/site';
import { copy } from '@/content/dolma';
import nazar from '@/content/nazar.json';
import '@/app/globals.css';
const boot = `(function(){for(var n=document.head.firstChild;n;){var x=n.nextSibling;if(n.nodeType===8||n.nodeType===3&&!n.data.trim())n.remove();n=x}var r=document.documentElement;r.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)r.classList.add('motion');setTimeout(function(){if(!window.__dolmaReady)r.classList.remove('motion','js')},8000)})();`;
export function Document({locale, children}: {locale: Locale; children: ReactNode}) {
  return <html lang={locale} suppressHydrationWarning><head>
    <script data-dolma-boot dangerouslySetInnerHTML={{__html:boot}}/>
    <script data-dolma-ui src="/dolma.js" defer/>
    <link rel="preload" as="image" type="image/webp" imageSrcSet={nazar.srcSet} imageSizes="(max-width: 699px) 275px, 325px"/>
    <noscript><style>{'.request-fields,.eye-control{display:none}.request-grid{grid-template-columns:1fr}.request-preview{position:static}'}</style></noscript>
    <link rel="preload" href="/fonts/fraunces-latin.woff2" as="font" type="font/woff2" crossOrigin=""/>
    <link rel="preload" href="/fonts/fraunces-tr.woff2" as="font" type="font/woff2" crossOrigin=""/>
    <link rel="preload" href="/fonts/source-sans-3-latin.woff2" as="font" type="font/woff2" crossOrigin=""/>
    <link rel="preload" href="/fonts/source-sans-3-tr.woff2" as="font" type="font/woff2" crossOrigin=""/>
  </head><body>{children}</body></html>;
}
export function buildMetadata(locale: Locale): Metadata {
  const c=copy[locale], path=locale==='tr'?'/':'/en/';
  return {metadataBase:new URL(site.url),title:c.title,description:c.description,
    robots:{index:false,follow:false},alternates:{canonical:path,languages:{tr:'/',en:'/en/','x-default':'/'}},
    openGraph:{type:'website',url:path,title:c.title,description:c.description,siteName:'Dolma Bodrum · Demo',locale:locale==='tr'?'tr_TR':'en_US',alternateLocale:[locale==='tr'?'en_US':'tr_TR'],images:[{url:`/og-${locale}.jpg`,width:1200,height:630,alt:c.heroAlt}]},
    twitter:{card:'summary_large_image',title:c.title,description:c.description,images:[`/og-${locale}.jpg`]},icons:{icon:'/favicon-32.png',apple:'/apple-touch-icon.png'},
  };
}
export const viewport={themeColor:site.themeColor,width:'device-width',initialScale:1};
