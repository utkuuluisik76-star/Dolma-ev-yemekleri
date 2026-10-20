export type Locale = 'tr' | 'en';
export const site = {
  name: 'Dolma', url: 'https://dolma.u-luksstudyo.com', demo: true,
  phone: '0533 090 69 26', tel: '+905330906926', whatsapp: '905330906926',
  instagram: 'https://www.instagram.com/dolmaevyemegi/',
  address: 'Çarşı, Kaymakam Sokak No:21, 48400 Bodrum, Muğla',
  maps: 'https://www.google.com/maps/dir/?api=1&destination=Dolma%20Bodrum%2C%20Kaymakam%20Sokak%20No%3A21%2C%20Bodrum',
  themeColor: '#174c91',
};
export const requestOpening = 'Merhaba, web sitenizden bilgi almak ya da masa istemek istiyorum.';
export const whatsappHref = (message = requestOpening) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
