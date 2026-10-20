import {copy} from '@/content/dolma';
import {site,whatsappHref,type Locale} from '@/content/site';
import {Photo,type PhotoName} from './Photo';
import {RequestForm} from './RequestForm';
import {Eye} from './Eye';

export function DolmaPage({locale}:{locale:Locale}){
  const c=copy[locale],tr=locale==='tr';
  const menuPhotos:PhotoName[]=['sehzade','vine-leaves','grills','breakfast'];
  const menuAlts=[c.alts.sehzade,c.alts['vine-leaves'],c.alts.grills,c.alts.breakfast];
  const gallery:(keyof typeof c.alts)[]=['flowers','plate','cabbage','fruit','interior','vine-leaves'];
  const nav=<>{['menu','location','contact'].map((id,i)=><a key={id} href={`#${id}`}>{c.nav[i]}</a>)}</>;
  return <>
    <a className="skip" href="#main">{c.skip}</a>
    <div className="demo-bar"><span>{c.demo}</span><span>U-LUKSSTUDYO</span></div>
    <header className="site-header">
      <details className="mobile-menu"><summary aria-label={tr?'Menüyü aç veya kapat':'Open or close navigation'}><span className="menu-bars" aria-hidden="true"/></summary><nav aria-label={c.nav[0]}>{nav}</nav></details>
      <a className="brand" href={tr?'/':'/en/'} aria-label="Dolma Bodrum"><img src="/logo.webp" width="150" height="150" alt="Dolma Ev Yemeği Bodrum"/><span>Dolma</span></a>
      <nav className="desktop-nav" aria-label={c.nav[0]}>{nav}</nav>
      <div className="header-actions"><nav className="languages" aria-label={c.language}><a href="/" lang="tr" hrefLang="tr" aria-current={tr?'page':undefined}>TR</a><a href="/en/" lang="en" hrefLang="en" aria-current={!tr?'page':undefined}>EN</a></nav><a className="button header-cta" href="#contact">{c.cta}</a></div>
    </header>
    <main id="main">
      <section className="hero chapter" aria-labelledby="hero-title" id="top">
        <div className="hero-art"><Eye pauseLabel={c.eyePause} playLabel={c.eyePlay} alt={tr?'Nazar süsü çizimi':'Illustration of a nazar charm'}/></div>
        <div className="hero-copy"><p className="hero-place">{c.place}</p><h1 id="hero-title">Dolma</h1><p className="hero-tagline">{c.hero}</p><div className="hero-actions"><a className="button button-white" href="#contact">{c.cta}</a><a className="button button-outline" href="#contact" data-request-type="order">{c.orderCta}</a></div></div>
        <a className="scroll-cue" href="#street" aria-label={tr?'Dolma’yı gör':'See Dolma'}><span aria-hidden="true">↓</span></a>
      </section>
      <section className="photo-chapter chapter" id="street" aria-labelledby="street-title">
        <Photo name="terrace" alt={c.heroAlt} sizes="100vw"/>
        <div className="chapter-shade"/>
        <div className="chapter-copy"><p className="chapter-label">Kaymakam Sokak No:21</p><h2 id="street-title">{c.locationTitle}</h2><p>{c.locationIntro}</p><a className="button button-outline" href="#location">{c.nav[1]}</a><p className="rating">{c.rating}</p></div>
      </section>
      <section className="menu-section section" id="menu" aria-labelledby="menu-title">
        <div className="section-heading"><h2 id="menu-title">{c.menuTitle}</h2><p>{c.menuIntro}</p></div>
        <div className="menu-book" data-menu-book>
          <div className="menu-track" data-menu-track tabIndex={0} role="region" aria-roledescription={tr?'Menü kitabı':'Menu book'} aria-label={tr?'Dört menü grubu; yatay kaydırın':'Four menu groups; scroll horizontally'}>
            {c.groupNames.map((title,i)=><article className="menu-sheet" key={title} aria-label={`${title} (${i+1}/4)`}>
              <Photo name={menuPhotos[i]} alt={menuAlts[i]} sizes="(min-width: 700px) 46vw, 100vw"/>
              <div className="menu-page"><span className="book-brand" aria-hidden="true">Dolma</span><h3>{title}</h3>{c.menuDishes[i]?<p>{c.menuDishes[i]}</p>:null}<a className="text-link" href="#contact">{c.menuAsk}</a><a className="button" href="#contact" data-request-type="order">{c.orderCta}</a></div>
            </article>)}
          </div>
          <div className="book-controls"><button type="button" data-book-prev aria-label={tr?'Önceki menü grubu':'Previous menu group'} disabled><span aria-hidden="true">←</span></button><span className="book-status" data-book-status aria-live="polite">1 / 4</span><button type="button" data-book-next aria-label={tr?'Sonraki menü grubu':'Next menu group'}><span aria-hidden="true">→</span></button></div>
        </div>
        <p className="menu-note">{c.orderText}</p>
      </section>
      <section className="photo-chapter chapter table-chapter" id="table" aria-labelledby="table-title"><Photo name="table" alt={c.tableAlt} sizes="100vw"/><div className="chapter-shade"/><div className="chapter-copy"><h2 id="table-title">{c.tableTitle}</h2><p>{c.tableText}</p><a className="button button-outline" href="#contact">{c.cta}</a></div></section>
      <section className="contact-section section" id="contact" aria-labelledby="contact-title"><div className="section-heading"><h2 id="contact-title">{c.requestTitle}</h2><p>{c.requestIntro}</p></div><RequestForm c={c}/></section>
      <section className="location section" id="location" aria-labelledby="location-title"><Photo name="interior" alt={c.alts.interior} sizes="(min-width: 1000px) 45vw, 100vw"/><div className="location-copy"><p className="chapter-label">Çarşı, Bodrum</p><h2 id="location-title">{c.locationTitle}</h2><dl><dt>{c.address}</dt><dd><address>{site.address}</address></dd><dt>{c.phone}</dt><dd><a href={`tel:${site.tel}`}>{site.phone}</a></dd><dt>{c.hours}</dt><dd><a href={whatsappHref('Merhaba, çalışma günlerinizi ve saatlerinizi öğrenebilir miyim?')} target="_blank" rel="noopener noreferrer">{c.hoursAsk}</a></dd></dl><a className="button" href={site.maps} target="_blank" rel="noopener noreferrer">{c.directions}<span aria-hidden="true">↗</span></a></div></section>
      <section className="gallery section" id="gallery" aria-labelledby="gallery-title"><div className="section-heading"><h2 id="gallery-title">{c.galleryTitle}</h2><p>{c.galleryIntro}</p></div><div className="gallery-grid">{gallery.map(name=><Photo key={name} name={name} alt={c.alts[name]} sizes="(min-width: 1000px) 30vw, 50vw"/>)}</div></section>
    </main>
    <footer className="footer"><div className="footer-top"><p className="footer-wordmark">Dolma</p><a className="text-link" href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a><a href={`tel:${site.tel}`}>{site.phone}</a></div><div className="footer-bottom"><p>{c.footerDemo}<br/>{c.footerNote}</p><a href="#top">{c.backTop} ↑</a></div></footer>
    <div className="bottom-bar"><a href="#contact" className="button button-white">{c.cta}</a><a href="#contact" className="button button-outline" data-request-type="order">{c.orderCta}</a></div>
  </>;
}
