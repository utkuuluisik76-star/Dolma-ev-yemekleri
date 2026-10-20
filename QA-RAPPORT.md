# Dolma — lokale QA, 19 oktober 2026

De blauw-witte vormgeving is door Utku goedgekeurd. Dit is een private pitchdemo, geen gelanceerde website. Het mobiele prestatiedoel is nog niet gehaald: presenteer dit niet als volledig launch-ready.

## Metingen

Lighthouse, vijf afzonderlijke koude runs per apparaat, mediaan. Edge op deze Windows-laptop; lokale statische export op poort 4182. Geen meting op een live host.

| Mobiel | Voor optimalisatie | Laatste meting |
| --- | ---: | ---: |
| Performance | 68 | 81 |
| LCP | 3,349 s | 2,192 s |
| TBT | 1494 ms | 738 ms |
| CLS | 0 | 0 |

Mobiel: Accessibility 100, Best Practices 100, SEO 69. De enige afgekeurde SEO-audit is `is-crawlable`: de demo moet juist noindex blijven. LCP < 2,5 s en CLS < 0,05 voldoen; Performance ≥ 90 niet. TBT is geen INP-meting; INP < 200 ms is niet aangetoond.

Optimalisaties: geen frameworkhydratie in de export; één klein lokaal bedieningsscript; responsive nazar-beeld dat als één laag beweegt; animatie pauzeert buiten beeld; native formuliervelden worden bij interactie klaargezet; geforceerde layout door een opstartmeting van scrollY verwijderd. Prestatietraces staan lokaal in `qa`.

Desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 69; LCP 438 ms, TBT 31 ms, CLS 0. Vóór de laatste optimalisatie was de desktopmediaan 98.

Scrollmeting, hele pagina:

- Desktop: 1 van 482 frames boven 20 ms (0,21%); p95 18,3 ms, maximum 196,4 ms, bij de tafel-/contactovergang; geen long tasks. De strikte norm van nul trage frames wordt niet gehaald. Hiervoor is ook een afzonderlijke scrolltrace opgenomen.
- Mobiel bij 4× CPU: 4 van 468 frames boven 20 ms (0,85%); p95 18,3 ms, maximum 159,2 ms. Grootste gerapporteerde long task 72 ms. Voldoet aan < 2% en geen taak > 100 ms.

Machinebelasting kan metingen beïnvloeden, maar is hier geen bewezen verklaring voor een afwijking. De ruwe rapporten blijven bewaard; er wordt geen onterecht groen eindoordeel gegeven.

De afzonderlijke desktop-scrolltrace reproduceert 1 traag frame (159,4 ms). Het langste trace-event zit op `CrGpuMain`: `GPUTask` 180,1 ms wandtijd / 7,5 ms CPU-tijd. Dat is geen aangetoonde JavaScript- of layouthotspot op de pagina. De achterliggende GPU-wachttijd is niet opgelost; een meting op een ander apparaat en zo nodig een verdere GPU-trace blijft nodig vóór een harde claim van nul trage frames.

## Functioneel en visueel

- TR `/` en EN `/en/`, één H1, geldige ankers, beeldafmetingen en alt-teksten.
- WhatsApp-preview met Turkse tekst en correcte encoding; bestelknop kiest bestellen. Geen bericht wordt automatisch verzonden.
- Menuboek via knoppen, horizontaal scrollen en pijltjestoetsen; mobiele navigatie; nazar-pauzeknop.
- Reduced motion en no-JS-layout met directe WhatsApp-link.
- Screenshots bij 390, 768 en 1440 px, beide talen, normaal en reduced motion; aparte no-JS-opname.
- Tekstcontrast met Range-rects: minimum 6,68:1; fototekst met worst-case witte achtergrond achter de shade: 5,06:1.
- Geen horizontale overflow; zichtbare interactieve doelen minimaal 44 px.
- Lokale build en TypeScript geslaagd. Niet gedeployed: live HTML, headers en console moeten na Utku's deployment opnieuw gecontroleerd worden.

## Alle open inhoudspunten

`npm.cmd run todo` meldt precies drie interne punten, niet zichtbaar als placeholders op de website:

1. Volledig weekrooster onbekend; de website verwijst naar WhatsApp om uren te vragen.
2. Exacte namen van de yoghurt-schotel en lichtgekleurde sarma onbekend; alleen beschrijvende alt-tekst gebruikt, geen verzonnen menunamen.
3. Eigenaar moet foto's, gerechten en copy goedkeuren vóór gebruik buiten deze pitchdemo.

De volledige Turkse tekst staat in één codeblok in `TURKCE-METINLER.md`.

Geen commit, push, zip, deployment, login of bericht aan Dolma uitgevoerd. Lighthouse is een ontwikkelafhankelijkheid; een eventuele npm-auditmelding voor ontwikkeltools is niet hetzelfde als een fout in de statisch geserveerde pagina. Er wordt geen algemene claim van nul afhankelijkheidskwetsbaarheden gedaan.
