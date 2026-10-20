import type {MetadataRoute} from 'next';
export const dynamic='force-static';
export default function manifest():MetadataRoute.Manifest{return {name:'Dolma Bodrum · Demo',short_name:'Dolma',start_url:'/',display:'browser',background_color:'#f5f3ec',theme_color:'#174c91',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png'}]};}
