import nazar from '@/content/nazar.json';

// Same original vector drawing, pre-rendered to transparent responsive artwork. One HTML
// transform moves the complete ornament without repeated SVG geometry layout on phones.
export function Eye({pauseLabel,playLabel,alt}:{pauseLabel:string;playLabel:string;alt:string}){
  return <div className="eye" data-active="false" data-eye>
    <div className="eye-art"><img src={nazar.src} srcSet={nazar.srcSet} sizes="(max-width: 699px) 275px, 325px" alt={alt} width="440" height="610" fetchPriority="high" loading="eager" decoding="async"/></div>
    <button type="button" className="eye-control" data-eye-pause data-pause-label={pauseLabel} data-play-label={playLabel} aria-pressed="false" aria-label={pauseLabel}><span aria-hidden="true">Ⅱ</span></button>
  </div>;
}
