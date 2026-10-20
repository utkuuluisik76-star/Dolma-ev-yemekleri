import type {MetadataRoute} from 'next';
export const dynamic='force-static';
// Allow crawling so robots noindex in the HTML and HTTP headers can be read.
export default function robots(): MetadataRoute.Robots {return {rules:{userAgent:'*',allow:'/'}};}
