import type {DolmaCopy} from '@/content/dolma';
import {requestOpening,whatsappHref} from '@/content/site';

export function RequestForm({c}:{c:DolmaCopy}){
  const message=requestOpening+'\nTalebim: Bilgi almak.';
  return <div className="request-grid" data-request>
    <div className="request-fields" data-request-fields/>
    <template data-request-template>
      <fieldset><legend><span>1</span>{c.steps[0]}</legend>
        <label htmlFor="request-type">{c.typeLabel}</label>
        <select id="request-type" defaultValue="information"><option value="information">{c.types[0]}</option><option value="table">{c.types[1]}</option><option value="order">{c.types[2]}</option></select>
        <label htmlFor="request-note">{c.detailsLabel}</label><textarea id="request-note" rows={3} maxLength={800} placeholder={c.detailsHint}/>
      </fieldset>
      <fieldset><legend><span>2</span>{c.steps[1]}</legend><div className="date-fields">
        <div><label htmlFor="request-day">{c.day} <small>({c.optional})</small></label><input id="request-day" type="date"/></div>
        <div><label htmlFor="request-time">{c.time} <small>({c.optional})</small></label><input id="request-time" type="time"/></div>
      </div></fieldset>
      <fieldset><legend><span>3</span>{c.steps[2]}</legend><label htmlFor="request-name">{c.name} <small>({c.optional})</small></label><input id="request-name" name="name" autoComplete="given-name" maxLength={80}/></fieldset>
    </template>
    <div className="request-preview"><p className="preview-title">{c.preview}</p><p className="message" lang="tr" id="message-preview">{message}</p><a className="button button-white" data-whatsapp-preview href={whatsappHref(message)} target="_blank" rel="noopener noreferrer">{c.send}</a><p className="privacy">{c.privacy}</p></div>
    <noscript><p>{c.noscript} <a href={whatsappHref()} target="_blank" rel="noopener noreferrer">WhatsApp</a></p><p><a className="text-link" href={whatsappHref(requestOpening+'\nTalebim: Sipariş vermek.')} target="_blank" rel="noopener noreferrer">{c.orderCta}</a></p></noscript>
  </div>;
}
