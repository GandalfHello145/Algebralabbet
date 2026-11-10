# Verifiering · 9 november 2026

Status: samtliga lokala kontroller godkända. Komplett elevsida för avsnitt 2.1–2.6. Publik version i GandalfHello145/Algebralabbet. GitHub Pages publicerar `dist/` efter samma godkända matematik- och resurskontroller.

## Matematik och resurser

- 8 Node-tester godkända, inklusive 1 800 genererade uppgifter över sex ämnen och tre nivåer.
- Oberoende kontroll av lösningar i ursprungsekvationer, värdebevarande förenkling, negativa tal, bråk, mönster och identiteter/motsägelser.
- JavaScript-syntaxkontroll godkänd.
- Samtliga lokala resurser, KaTeX-typsnitt och sex filmrutter finns. Inga externa runtime-resurser krävs.
- Filmfilerna har H.264 och AAC; alla JPEG-affischer och svenska VTT-tider är verifierade. Slutliga affischer fångar färdigskrivna formler.

| Film | Längd | Upplösning | Bilder/s |
| --- | --- | --- | --- |
| 01-uttryck.mp4 | 184,0 s | 1920 × 1080 | 30 |
| 02-monster.mp4 | 194,2 s | 1920 × 1080 | 30 |
| 03-forenkla.mp4 | 212,8 s | 1920 × 1080 | 30 |
| 04-ekvationer.mp4 | 182,97 s | 1920 × 1080 | 30 |
| 05-problem.mp4 | 182,97 s | 1920 × 1080 | 30 |
| 06-bada-led.mp4 | 182,97 s | 1920 × 1080 | 30 |

## Webbläsare och bildkontroll

- Startsida och labb provade vid 1280 px datorbredd och 390 px mobilbredd; inget horisontellt sidöverflöde i de kontrollerade vyerna.
- Samtliga sex labb öppnade och provade. Negativ insättning, mönster/tabell, termsortering med bevarat tangentbordsfokus, exakta LaTeX-bråk efter division, budget med heltalskrav samt ingen/alla lösningar kontrollerade.
- Träning provad med fel svar, ledtråd, rätt svar med decimalkomma, lokal framstegsmarkering och nollställning.
- Rörelseinställning provad. Systempreferens respekteras; manuellt val finns även via Om materialet.
- LaTeX-renderingen gav inga KaTeX-fel i de provade vyerna. Inga konsolvarningar eller JavaScript-fel noterades.
- Film 04 och 06 laddades i den inbyggda spelaren; film 06 spelades upp med readyState 4 och utan mediefel.
- Representativa full HD-rutor ur samtliga filmer har granskats, inklusive nollpar, substitutionskontroll och ekvation utan lösning. Full avkodning av 04–06 passerade.

## Praktiska gränser

Bokupplagan är inte angiven; kopplingen gäller avsnittsrubriker, inte specifika sidor eller bokens uppgiftsnummer. Webbplatsen är provad i Chromium, inte i alla möjliga elevdatorer/webbläsare. Ingen klassrumspilot eller mätning av läranderesultat har gjorts. Framstegsmarkeringen betyder ett löst uppdrag per del, inte bedömd måluppfyllelse.

För reproducerbara kommandon, se README.md. MEDIA_MANIFEST.json dokumenterar slutfilmernas kontrollsummor. GitHub-kontrollen kör samma matematik- och resurskontroller vid ändringar.


## Uppdatering: byggbara studior och LaTeX-förklaringar

Samtliga sex labb har byggts om med direkta byggstenar, dragytor och motsvarande knapp-/tangentbordsstyrning. Förstå-fliken innehåller stegvisa förklaringar i varje avsnitt. Rubriktexten som skulle tas bort är borttagen.

- 15 automatiserade tester passerar: tidigare 1 800 uppgifter, strikta LaTeX-kontroller och sex nya tester av exakta rationella ekvationsoperationer. Ekvationstesterna omfattar 392 rotfall genom sju transformationer samt identiteter, motsägelser och nollskydd.
- Klick, Enter och verklig dragning av x-brickor har provats; värdena följer samma modell. Mönster 4n+2 kontrollerades för n=10 och n=20.
- Termsortering och nollpar har provats. Parkens biljettkostnad kontrollerades. Ekvationskort −4 drogs till operationsytan och division med 3 gav x=5; kontrollen i startekvationen gav 19=19. Byggläget och ingen/alla-lösningar har provats.
- Alla sex studior och alla sex förklaringar öppnades vid 320 px bredd: inget horisontellt sidöverflöde och inga KaTeX-fel. Inga JavaScript-varningar eller fel noterades. Exakta bråk och alla förekomster av multiplikationstecken i förklaringarna kontrollerades även visuellt/semantiskt.
- Animationer har paus, reducerad rörelse eller städning vid vybyte. Dragspöket städas även vid Escape, förlorad pekarfångst och fönsterbyte. Bildhastighet är inte uppmätt på elevernas egna enheter.
