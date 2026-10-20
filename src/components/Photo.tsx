import media from '@/content/media.json';
export type PhotoName=keyof typeof media;
export function Photo({name,alt,className='',hero=false,sizes='(min-width: 1000px) 45vw, 100vw'}:{name:PhotoName;alt:string;className?:string;hero?:boolean;sizes?:string}){
  const image=media[name];
  return <picture className={`photo ${className}`}>
    <source media="(max-width: 699px)" type="image/avif" srcSet={image.portrait.avif} sizes={hero?'100vw':sizes}/>
    <source media="(max-width: 699px)" type="image/webp" srcSet={image.portrait.webp} sizes={hero?'100vw':sizes}/>
    <source type="image/avif" srcSet={image.landscape.avif} sizes={sizes}/>
    <img src={image.landscape.src} srcSet={image.landscape.webp} sizes={sizes} width={image.landscape.width} height={image.landscape.height} alt={alt} loading={hero?'eager':'lazy'} fetchPriority={hero?'high':undefined} decoding="async"/>
  </picture>;
}
