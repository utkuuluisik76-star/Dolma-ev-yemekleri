# Dolma Bodrum — pitchdemo

Eén pagina, Turks `/` en Engels `/en/`, gebouwd vanuit de U-LUKSSTUDYO studio-starter. Goedgekeurde richting: Egeïsch blauw en kalkwit, eigen foto's, grote typografie en een rustig bewegend beschermend oog. Dit is een demo voor een echte lead; geen gelanceerde bedrijfssite.

## Lokaal

Gebruik Node uit `.node-version`, daarna:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Preview: http://localhost:4182. Ontwikkelen: `npm.cmd run dev` op poort 3000.

## Bron en wijzigingen

- `src/content/dolma.ts`: alle TR/EN-teksten en alt-teksten.
- `src/content/site.ts`: bevestigde contactgegevens, toekomstig domein, WhatsApp-link.
- `src/components/DolmaPage.tsx`: opbouw van de pagina.
- `src/components/RequestForm.tsx`: toegankelijke velden in een HTML-template en een vooraf gerenderde berichtpreview. De velden worden bij de eerste scroll/toets of direct bij de aanvraagknop beschikbaar; zonder JavaScript blijft de directe WhatsApp-link bruikbaar.
- `src/components/Eye.tsx`: eigen nazar-tekening, vanuit het oorspronkelijke SVG naar transparante responsive beelden verwerkt. Het hele ornament beweegt in één compositielaag; stil zonder JS, bij verminderde beweging of buiten beeld. Pauzeknop beschikbaar. Geen AI-foto van de zaak.
- `public/dolma.js`: circa 5,6 KB bediening voor preview, bestellen, nazar en horizontaal menuboek. Geen opslag, verzend-API of automatische externe navigatie.
- `scripts/static-html.mjs`: postbuild houdt de Next-bronstructuur maar verwijdert overbodige frameworkhydratie uit de statische HTML. Het enige bedieningsscript krijgt een hash en lange cacheheaders. Test altijd `npm run build` + `npm start`: dit is exact wat Cloudflare ontvangt.
- `src/app/globals.css`: kleur- en ruimtetokens, responsive layouts en zelf gehoste fonts.
- `_bronfotos/`: de door Utku aangeleverde originelen; onderdeel van de bouwbron. Alleen voor deze pitchdemo gebruiken.
- `scripts/media.mjs`: verwijdert Instagram-interface uit screenshots, maakt aparte crops en AVIF/WebP-srcsets, logo/favicons en OG-beelden. Verandert geen eten of locatie-inhoud.
- `scripts/dolma-fonts.mjs`: Fraunces Variable en Source Sans 3 met Turkse subsets. Licenties in `public/fonts`.
- `content/pending.json`: uitsluitend interne ontbrekende feiten. `npm.cmd run todo` toont alles.

Er zijn geen verzonnen openingstijden, prijzen of testimonials. Alle vier de menugroepen hebben een eigen foto. Onbekende openingstijden worden vervangen door de mogelijkheid ze te vragen.

## Cloudflare later — door Utku

Upload/push de **bronbestanden**, inclusief `_bronfotos`, `public`, `scripts`, `src`, `content`, `package.json` en `package-lock.json`. Geen zip-only-repository.

- Build: `npm run build`
- Output: `out`
- Domein later: `dolma.u-luksstudyo.com`
- `_headers` zet `X-Robots-Tag: noindex, nofollow, noarchive`; beide taalpagina's hebben tevens robots noindex. `robots.txt` staat crawlen toe zodat zoekmachines noindex kunnen lezen.
- Geen CMS/login nodig voor deze afgebakende demo.

Er is lokaal Git geïnitialiseerd; commit, push en deployment vragen aparte toestemming.

## QA

```powershell
npm.cmd run qa
node scripts/qa/dolma.mjs
npm.cmd run qa:shots
npm.cmd run qa:shots -- --reduced
npm.cmd run qa:jank
npm.cmd run qa:jank -- --mobile
npm.cmd run qa:lighthouse
npm.cmd run qa:lighthouse -- --desktop
```

Edge wordt headless gestart met lazy-loading uit voor screenshots en via CDP gesloten. QA-output staat in `qa` en is niet voor Git bedoeld. De extra Dolma-controles testen ankers, touch targets, contrast met Range-rects, TR/EN, formulierencoding, noindex, reduced motion en een no-JS-layout.

Lighthouse SEO kan geen 100 scoren met een verplichte `noindex`: rapporteer de echte score en de reden. Verwijder noindex niet om het cijfer te verhogen. Lokale controles vervangen geen controle op het uiteindelijke live domein.
