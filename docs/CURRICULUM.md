# Algebra i Matematik X, kapitel 2

Algebralabbet är ett fristående komplement för årskurs 7. Förklaringar, uppgifter och simuleringar är egna. Sidnummer och lärobokens uppgiftsnummer används inte eftersom klassens upplaga ännu är okänd.

## Verifierad kapitelstruktur

1. **2.1 Algebraiska uttryck** – variabler, multiplikation och insättning.
2. **2.2 Mönster** – talföljder, förändring och generella regler.
3. **2.3 Förenkling av uttryck** – samla liknande termer och behåll tecken.
4. **2.4 Ekvationer** – likhet, balansmetoden och kontroll av lösning.
5. **2.5 Problemlösning med ekvationer** – definiera variabel, bygg modell, lös och tolka.
6. **2.6 Ekvationer med obekanta i båda leden** – samma operation i båda leden.

Strukturen har kontrollerats mot [Libers digitala Matematik X-smakprov](https://matematik.liber.se/courses/chapters/sv/28) och [Matematik XYZ:s officiella kapitelplanering](https://www.matematikxyz.com/larare/ewExternalFiles/X%20Planering%20Kap%202%20v-2.pdf). [Liber beskriver en revidering av Matematik X under 2026](https://www.liber.se/serie/matematik-xyz); kontroll mot den upplaga klassen använder återstår. Källorna är lästa den 9 november 2026.

## Egna exempel och interaktioner

| Avsnitt | Eget exempel | Vad eleven undersöker |
| --- | --- | --- |
| 2.1 | $3x+2$ när $x=4$ | Ett reglage ändrar värdet på samma variabel överallt. Tre grupper och två enheter ger 14. |
| 2.2 | $f(n)=3n+2$ | Prickmönstret växer med tre; figur 20 innehåller 62 prickar. Den fasta delen och förändringen skiljs åt. |
| 2.3 | $4x+3+2x-1=6x+2$ | Bara liknande termer grupperas. Minustecknet följer termen. |
| 2.4 | $3x+4=19$ | Ta bort fyra och dela med tre i båda leden. Kontrollera $x=5$ i ursprungsekvationen. |
| 2.5 | Startavgift 35 kr, 12 kr per timme, totalt 89 kr | Bygg $35+12x=89$, tolka $x=4,5$ timmar och kontrollera kostnaden. |
| 2.6 | $4x+2=2x+12$ | Ta bort $2x$ från båda leden innan taltermer och division hanteras. Lösningen är $x=5$. |

## Nivåer och återkoppling

- **Kom igång (`start`)**: små positiva heltal, korta instruktioner, frivillig ledtråd och direkt kontroll.
- **Utforska (`explore`)**: större tal, flera termtyper och mer självständig problemlösning.
- **Utmana (`challenge`)**: negativa koefficienter, halva tal, avtagande mönster och lösningar som behöver tolkas som delar av en timme.

Nivåerna är valbara övningsvägar, inte betyg. Förenklingsuppgifterna efterfrågar koefficienten framför $x$ så att svaret kan vara ett enda tal; förklaringen visar också hela det förenklade uttrycket. Ett svar på 0 är korrekt när alla $x$-termer tar ut varandra.

Återkoppling ska förklara varför en lösning fungerar. Eleven ska få försöka igen utan tidspress. Ett givet numeriskt svar kan inte ensamt visa elevens resonemang; följ upp med samtal eller en egen förklaring.

## Matematiska och tillgängliga modeller

- Likhet betyder samma värde. Undvik instruktionen ”flytta över” utan förklaring av operationen i båda leden.
- Behåll termers identitet och tecken genom animationer. Låt rörelse visa den matematiska förändringen.
- En fysisk våg är en modell för likhet. Negativa termer bör visas symboliskt, utan att påstå att negativa föremål är verkliga vikter.
- Varje draginteraktion behöver ett klick- eller tangentbordsalternativ. Använd synliga etiketter, LaTeX med tillgänglig text, reducerad rörelse och möjlighet att pausa.
- Utvidgning: identiteter, exempelvis $2x+4=2(x+2)$, och motsägelser, exempelvis $2x+4=2x+7$, visar att en ekvation kan ha alla eller inga lösningar. Den rena modellen `solveLinear` stöder dessa fall.

## Modellens kontrakt

`dist/model.js` är en ren ESM-modul utan DOM, nätverk eller sparad elevdata. `generateTask(topic, level, seed)` ger deterministiska uppgifter med `prompt`, `tex` (utan dollartecken), numeriskt `answer`, `hint`, `explanation` och ibland `unit`.

- `topic`: heltal 0–5 motsvarande avsnitt 2.1–2.6.
- `level`: `start`, `explore` eller `challenge`.
- `seed`: ett ändligt tal som normaliseras till ett 32-bitars heltal.
- `evaluateExpression(coefficient, constant, x)`: beräknar $ax+b$.
- `solveLinear(a,b,c,d)`: löser $ax+b=cx+d$ och ger `{kind:'unique',value}`, `{kind:'none'}` eller `{kind:'all'}`.
- `reduceTerms(terms)`: grupperar en array av `{coefficient,variable}` för `x`, `y` och den tomma strängen. Resultatet är en array i ordningen `x`, `y`, konstant. Nolltermer utelämnas; nolluttrycket ger `[{coefficient:0,variable:''}]`.
- `patternCount(n,step=3,base=2)`: beräknar $step\cdot n+base$ för heltal $n\ge1$. Första figuren innehåller alltså `step+base` föremål.

Kör modellkontroller med `node --test scripts/model.test.mjs` från projektroten. Testerna kontrollerar bland annat originalekvationer, värdebevarande vid förenkling, negativa och brutna tal, determinism och alla ämnes-/nivåkombinationer.
