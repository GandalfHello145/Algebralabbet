import {math,renderMath} from './lab-kit.js?v=studio-2';
const T=String.raw;
export const explanations=[
 {
  title:'En bokstav kan stå för ett tal.',
  lead:`En variabel, till exempel ${math(T`x`)}, får stå för ett tal som kan ändras. Ett uttryck beskriver hur du ska räkna med talet.`,
  idea:`I ${math(T`ax+b`)} är ${math(T`a`)} antalet x-delar och ${math(T`b`)} den fasta delen. Bygg om uttrycket och se hur värdet ändras.`,
  steps:[
   {heading:'Läs uttrycket som en byggbeskrivning',text:`Tänk dig tre likadana påsar med ${math(T`x`)} kulor i varje påse, plus två lösa kulor. Multiplikationstecknet skrivs ofta inte ut mellan ett tal och en bokstav.`,tex:T`3x+2=3\cdot x+2`,after:`Talet ${math(T`3`)} kallas koefficient. Talet ${math(T`2`)} är konstant, alltså en fast del.`},
   {heading:'Byt ut bokstaven mot ett tal',text:`Om varje påse har fyra kulor sätter vi in ${math(T`x=4`)}. Räkna multiplikationen före additionen.`,tex:T`3\cdot4+2=12+2=14`},
   {heading:'Samma uttryck, ett nytt värde',text:`När ${math(T`x`)} ökar med ett får var och en av de tre påsarna en kula till. Uttryckets värde ökar därför med tre.`,tex:T`3\cdot5+2=17,\qquad17-14=3`},
   {heading:'Parenteser ändrar byggbeskrivningen',text:`Tre grupper med ${math(T`x+2`)} betyder att både x-delen och tvåan upprepas tre gånger. Det skiljer sig från tre x-delar och två lösa.`,tex:T`3(x+2)=3x+6`,after:`Vid ${math(T`x=4`)} ger ${math(T`3x+2`)} värdet ${math(T`14`)}, medan ${math(T`3(x+2)`)} ger ${math(T`18`)}.`}
  ],pitfall:`${math(T`3x`)} betyder ${math(T`3\cdot x`)}. Det betyder inte ${math(T`3+x`)}. Samma x har samma värde på alla ställen i samma situation.`,
  investigate:'Bygg ett uttryck med fyra x-delar och tre enheter. Välj x = 2 och x = 5. Vad ändras, och vad stannar kvar?'
 },
 {
  title:'Hitta det som växer och det som är fast.',
  lead:`I ett växande mönster kan ${math(T`n`)} stå för figurens nummer. En regel hjälper oss att räkna ut en stor figur utan att rita alla tidigare figurer.`,
  idea:`Skriv mönstrets regel som ${math(T`f(n)=an+b`)}: ${math(T`a`)} per steg och ${math(T`b`)} som fast del.`,
  steps:[
   {heading:'Jämför de första figurerna',text:'Startmönstret har 5, 8 och 11 brickor i figur 1, 2 och 3. Antalet ökar med tre varje gång.',tex:T`5\xrightarrow{+3}8\xrightarrow{+3}11`},
   {heading:'Dela upp figuren i två delar',text:`Figur ${math(T`n`)} har ${math(T`n`)} grupper med tre mintgröna brickor. De två gula brickorna finns i varje figur.`,tex:T`f(n)=3n+2`},
   {heading:'Kontrollera med en liten figur',text:'Prova regeln med en figur du kan räkna. Då ser du om den fasta delen och ökningen stämmer.',tex:T`f(1)=3\cdot1+2=5,\qquad f(3)=3\cdot3+2=11`},
   {heading:'Ta ett stort språng',text:'I figur 20 finns 20 grupper med tre brickor och fortfarande bara två fasta brickor.',tex:T`f(20)=3\cdot20+2=62`,after:'I labbet kan du ändra både ökningen och den fasta delen, spela fram figurerna och jämföra med ett sparat mönster.'}
  ],pitfall:`Ökningen ${math(T`3`)} är inte hela regeln. ${math(T`3n`)} missar de två fasta brickorna. Figurnumret är inte samma sak som antalet brickor.`,
  investigate:'Bygg ett nytt mönster som växer med fyra och har en fast bricka. Förutsäg figur 10 innan du bygger den.'
 },
 {
  title:'Samma värde kan skrivas enklare.',
  lead:'Att förenkla betyder att samla liknande termer utan att ändra uttryckets värde. Bokstävernas sort och termens tecken spelar roll.',
  idea:`Samla ${math(T`x`)} med ${math(T`x`)}, ${math(T`y`)} med ${math(T`y`)} och tal med tal. Ett nollpar uppfyller ${math(T`x+(-x)=0`)}.`,
  steps:[
   {heading:'Flytta hela termen med dess tecken',text:'Här finns två x-termer och två taltermer. Minustecknet följer med ettan.',tex:T`4x+3+2x-1=(4x+2x)+(3-1)`},
   {heading:'Samla en sort i taget',text:'Fyra x och två x blir sex x. Tre minus ett blir två.',tex:T`4x+2x=6x,\qquad3-1=2`,after:`Hela uttrycket blir ${math(T`6x+2`)}.`},
   {heading:'Se vad ett negativt tecken gör',text:'En positiv x-bricka och en negativ x-bricka bildar ett nollpar. Fem positiva och två negativa lämnar tre positiva kvar.',tex:T`5x-2x=3x`},
   {heading:'Håll olika bokstäver isär',text:'Olika variabler är olika sorters termer. Samla först x-termerna, sedan y-termerna och till sist talen.',tex:T`3x+2y+x-y+4=4x+y+4`},
   {heading:'Kontrollera med ett värde',text:`Vid ${math(T`x=3`)} ska ursprungsuttrycket och det förenklade uttrycket ge samma värde.`,tex:T`4\cdot3+3+2\cdot3-1=20`,after:`Och ${math(T`6\cdot3+2=20`)}. Att prova ett värde är en bra kontroll, men det är reglerna för liknande termer som visar varför förenklingen alltid gäller.`}
  ],pitfall:`${math(T`x+3`)} kan inte förenklas till ${math(T`4x`)}. Vid ${math(T`x=2`)} blir de ${math(T`5`)} respektive ${math(T`8`)}.`,
  investigate:'Bygg två uttryck som ser olika ut men förenklas till 4x + 3. Kan du också bygga ett uttryck som blir noll?'
 },
 {
  title:'Bevara likheten, steg för steg.',
  lead:`En ekvation innehåller ett likhetstecken. Vi söker det värde på ${math(T`x`)} som gör vänsterled och högerled lika stora. Vågen jämför deras talvärden.`,
  idea:`I ${math(T`3x+4=19`)} får du subtrahera samma tal eller dividera med samma tal, utom noll, i båda leden.`,
  steps:[
   {heading:'Börja med det ursprungliga sambandet',text:'Tre x-delar och fyra enheter ska tillsammans ha värdet nitton.',tex:T`3x+4=19`},
   {heading:'Ta bort fyra från båda leden',text:'Vi gör samma operation på båda sidor. Lösningen bevaras.',tex:T`3x+4-4=19-4\quad\Longrightarrow\quad3x=15`},
   {heading:'Dela båda leden i tre lika delar',text:'Tre lika x-delar har tillsammans värdet femton. En x-del har därför värdet fem.',tex:T`\frac{3x}{3}=\frac{15}{3}\quad\Longrightarrow\quad x=5`},
   {heading:'Kontrollera i den ursprungliga ekvationen',text:'Sätt tillbaka lösningen i ekvationen som du började med.',tex:T`3\cdot5+4=15+4=19`,after:'Båda leden är nitton. Prova ett annat värde på x i labbet och se varför vågen då inte är i balans.'}
  ],pitfall:'Att bara ändra ett led förstör likheten. Gör operationen i båda leden. Vågen är en matematisk modell; negativa termer visas som symboler, inte som fysiska negativa vikter.',
  investigate:'Bygg en egen ekvation med lösningen x = 4. Lös den på två olika sätt och kontrollera båda vägarna.'
 },
 {
  title:'Låt en berättelse bli en ekvation.',
  lead:'Börja med vad du vill ta reda på. Bestäm vad variabeln betyder, skriv sambandet, lös och tolka svaret i situationen.',
  idea:`I nöjesparken beskriver ${math(T`K=35+15x`)} kostnaden i kronor när ${math(T`x`)} är antalet åkturer.`,
  steps:[
   {heading:'Bestäm vad x betyder',text:'Entrén kostar 35 kr. Varje åktur kostar 15 kr. Du har 125 kr och vill veta hur många åkturer pengarna räcker till.',tex:T`x=\text{antal åkturer}`},
   {heading:'Skriv kostnaden och budgeten',text:'Den fasta entrén betalas en gång. Priset per åktur multipliceras med antalet åkturer.',tex:T`35+15x=125`},
   {heading:'Ta bort entrén och dela resten',text:'Efter entrén finns 90 kr kvar. Varje åktur tar 15 kr av dessa pengar.',tex:T`15x=125-35=90\quad\Longrightarrow\quad x=\frac{90}{15}=6`},
   {heading:'Svara med betydelse och enhet',text:'Du kan åka sex gånger och använda hela budgeten. Kontrollera mot berättelsen.',tex:T`35+15\cdot6=125\ \text{kr}`},
   {heading:'Fundera på vad som är möjligt i verkligheten',text:'I en annan park är entrén 40 kr, varje åktur 25 kr och budgeten 180 kr. Ekvationen ger ett decimaltal, men antalet åkturer måste vara ett heltal.',tex:T`40+25x=180\quad\Longrightarrow\quad x=5{,}6`,after:`Du kan alltså åka högst ${math(T`5`)} gånger. Det kostar ${math(T`40+25\cdot5=165`)} kr, så ${math(T`15`)} kr blir kvar.`}
  ],pitfall:'Ett tal räcker inte alltid som svar. Fråga vad x betyder, vilken enhet som behövs och om lösningen är möjlig. Du kan hyra en cykel 1,5 timmar men inte köpa 1,5 hela åkturer i det här labbet.',
  investigate:'Ändra entré, åkturens pris och budget. Skapa först en dag där budgeten räcker exakt, sedan en dag där pengar blir kvar.'
 },
 {
  title:'Samma x kan finnas på båda sidor.',
  lead:'Du kan samla x-termer i ett led och tal i det andra genom att göra samma operation i båda leden. Kontrollera även vad som händer om alla x-termer försvinner.',
  idea:`I ${math(T`4x+2=2x+12`)} kan du börja med att ta bort ${math(T`2x`)} från båda leden.`,
  steps:[
   {heading:'Ta bort lika många x-delar från båda leden',text:'Fyra x-delar till vänster och två till höger. När två x-delar tas bort från båda sidor återstår två till vänster.',tex:T`4x+2-2x=2x+12-2x\quad\Longrightarrow\quad2x+2=12`},
   {heading:'Få x ensamt',text:'Subtrahera två från båda leden och dela sedan båda leden med två.',tex:T`2x=10\quad\Longrightarrow\quad x=5`,after:`Kontroll: ${math(T`4\cdot5+2=22`)} och ${math(T`2\cdot5+12=22`)}.`},
   {heading:'Ibland fungerar alla värden',text:'Här är leden samma uttryck. Ta bort 2x från båda sidor och se vad som återstår.',tex:T`2x+4=2x+4\quad\Longrightarrow\quad4=4`,after:'Det är sant för alla värden på x. Ekvationen har oändligt många lösningar.'},
   {heading:'Ibland fungerar inget värde',text:'Om lika många x-delar försvinner men de kvarvarande talen är olika, kan inget värde på x göra leden lika.',tex:T`2x+4=2x+7\quad\Longrightarrow\quad4=7`,after:'Fyra är inte sju. Ekvationen har ingen lösning.'}
  ],pitfall:'”Flytta över” är en förkortning för att utföra samma operation i båda leden. Behåll förståelsen för operationen. Alla ekvationer har inte exakt en lösning.',
  investigate:'Bygg tre egna ekvationer: en med en lösning, en med ingen lösning och en som är sann för alla x. Förklara hur du vet skillnaden.'
 }
];
export function explanationPreview(index){return explanations[index].idea;}
export function mountExplanation(host,index){
 const e=explanations[index];
 host.innerHTML=`<article class="explanation"><header class="explanation-heading"><p class="eyebrow">FÖRSTÅ SAMBANDET · 2.${index+1}</p><h2>${e.title}</h2><p>${e.lead}</p></header><div class="explanation-layout"><div class="explanation-steps">${e.steps.map((s,i)=>`<section class="explanation-step"><span class="step-number">${i+1}</span><div><h3>${s.heading}</h3><p>${s.text}</p><div class="explanation-math">${math(s.tex)}</div>${s.after?`<p>${s.after}</p>`:''}</div></section>`).join('')}</div><aside class="explanation-aside"><h3>Håll utkik efter det här</h3><p>${e.pitfall}</p><h3>Från förklaring till experiment</h3><p>Prova idén själv. Dra och bygg i labbet, och följ hur bilden och uttrycket ändras tillsammans.</p><a href="#del-${index+1}">Till det interaktiva labbet ↗</a></aside></div><footer class="explanation-check"><strong>En idé att undersöka</strong>${e.investigate}</footer></article>`;
 renderMath(host);
}
