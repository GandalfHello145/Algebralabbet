# Algebralabbet · åk 7

En svensk elevsida med sex lekbara algebralabb, sex originalfilmer i Manim och varierade träningsuppdrag på tre nivåer. Materialet följer Matematik X kapitel 2, avsnitt 2.1–2.6. Alla uppgifter och filmer är nyskrivna. Sidnummer anges inte eftersom bokupplagan är okänd.

**Elevsida:** [Öppna Algebralabbet](https://gandalfhello145.github.io/Algebralabbet/).

Det här publika projektet innehåller elevsidan, filmerna och den redigerbara källkoden. GitHub Pages publicerar innehållet i `dist/` efter godkända kontroller.

## Starta lokalt

Python 3 räcker för att visa den färdiga sidan. Inga paket behövs. På Mac kan du dubbelklicka `Starta Algebralabbet.command` efter att du hämtat mappen. Det öppnar webbläsaren och den lokala servern. Alternativt kör kommandot nedan.

```sh
cd Algebralabbet
python3 -m http.server 8047 --directory dist
```

Öppna <http://127.0.0.1:8047> i en webbläsare. Behåll terminalen öppen medan sidan används; stoppa med Ctrl+C. Öppna inte `index.html` direkt med `file://`, eftersom webbläsaren då kan blockera JavaScript-moduler. Alla webbplatsens bibliotek, typsnitt, filmer, undertexter och affischer följer med lokalt. Det finns inga externa nätverkskrav efter hämtning.

## Kapitlets delar

| Avsnitt | Labb | Vad eleven styr |
| --- | --- | --- |
| 2.1 Algebraiska uttryck | Variabelmaskinen | x, koefficient och konstant; bild och uttryck ändras tillsammans |
| 2.2 Mönster | Mönsterverkstaden | figurnummer, ökning och fast del; bild, formel och tabell |
| 2.3 Förenkling av uttryck | Termsorteraren | termer flyttas med animerade banor till grupper; negativa termer och två variabler |
| 2.4 Ekvationer | Balanslabbet | pröva x, samma operation i båda led, ångra, exakta LaTeX-bråk |
| 2.5 Problemlösning med ekvationer | Nöjesparksuppdraget | åkturer och tre budgetscenarier; heltalskrav och pengar kvar |
| 2.6 Obekanta i båda leden | Två sidor, ett x | samla x; en lösning, ingen lösning och alla x |

Varje del innehåller flikarna **Utforska**, **Se filmen** och **Träna**. Träningen har Kom igång, Utforska och Utmana, ledtrådar, omedelbar återkoppling och nya uppgifter utan tidspress. Ett löst uppdrag ger en lokal markering; den ska inte tolkas som ett kunskapsomdöme.

## Tillgänglighet och elevdata

Reglage kan styras med tangentbordets pilar, Home och End. Termbrickor kan väljas med Enter/mellanslag och behåller fokus när de flyttas. Alla dragbara reglage har tangentbordsstöd. Inställningen Minska rörelser finns i sidofältet och under Om materialet; systemets inställning respekteras som standard. Filmerna har kontroller, text i bild och valbara svenska VTT-undertexter. KaTeX levererar både visuell LaTeX och MathML.

Sidan saknar elevkonton, analysverktyg och resultatinsamling. Framsteg och rörelseinställning sparas i `localStorage` i den aktuella webbläsaren, med reservbeteende om lagring är avstängd. Om materialet innehåller Nollställ mina framsteg.

## Filmer

Sex Manim Community-filmer, minst tre minuter vardera, med native 1920×1080, 30 bilder/s, all synlig text i LaTeX, nyskriven lugn musik och ingen berättarröst. Matematiska objekt behåller sin färg genom omformningar. Filmerna innehåller konkreta modeller, mellanled, missuppfattningar, elevpauser och kontroll av svaret.

Färdiga MP4, VTT och affischer ligger under `dist/assets/`. Filmkod finns i `films/`. Se [filmproduktion](docs/FILMS.md) för reproduktion.

## Kontrollera

Med Node.js (inga npm-beroenden):

```sh
node --test scripts/model.test.mjs
node --check dist/app.js
python3 scripts/verify_site.py
```

Den sista kontrollen använder FFprobe för färdiga filmer. Före rendering kan den köras med `--skip-media`. Matematiktesterna omfattar 1 800 deterministiska uppgifter över samtliga ämnen och nivåer, lösningar, negativa tal, bråk, förenkling och uttrycksvärden.

Se [ämnesplan och källor](docs/CURRICULUM.md) samt [verifiering](docs/VERIFICATION.md). KaTeX 0.19.1 med MIT-licens är lokalt paketerat under `dist/vendor/katex/`.
