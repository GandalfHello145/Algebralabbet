import { math, renderMath, createStudio, dragTiles, animateFlip, reducedMotion, number, polynomial } from './lab-kit.js?v=studio-2';
import { reduceTerms } from './model.js';

const clone = value => JSON.parse(JSON.stringify(value));
const signed = (value, variable = '') => `${value < 0 ? '-' : '+'}${Math.abs(value) === 1 && variable ? '' : Math.abs(value)}${variable}`;
const tokenKind = variable => variable || 'unit';
const texNum = value => String(value).replace('.', '{,}');
const field = (id, label, min, max, value, step = 1) => `<label class="studio-range" for="${id}"><span>${label}</span><output data-output="${id}" for="${id}">${value}</output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></label>`;

const termsStyle = `<style>
#term-studio .studio-range output{float:right;background:#e6f0df;color:#326647;border-radius:5px;padding:1px 7px;margin-left:7px;font-weight:650}#term-studio .ts-palette{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:13px 0 19px}#term-studio .ts-palette-label{font-size:10px;color:#9bb7ac;width:100%;letter-spacing:.08em}#term-studio .ts-palette .studio-token{min-width:47px;min-height:44px;padding:8px 10px;position:relative}#term-studio .ts-palette .studio-token:after{content:'+';font:11px sans-serif;position:absolute;right:4px;top:3px;opacity:.5}
#term-studio .ts-workspace{min-height:124px;border:1px dashed #7a9b8a77;border-radius:13px;background:#ffffff04;padding:15px;margin:12px 0}#term-studio .ts-zone-label{display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:.08em;color:#a7c3b5;margin:0 0 12px}#term-studio .ts-zone-label small{letter-spacing:0;color:#90a99f;font-size:9px}#term-studio .ts-token-grid{display:flex;gap:7px;flex-wrap:wrap;min-height:42px;align-items:center}#term-studio .ts-token-grid .studio-token{min-width:39px;min-height:42px;padding:8px 9px;will-change:transform}#term-studio .ts-empty{font-size:11px;color:#819f91;line-height:1.7;pointer-events:none}#term-studio .ts-buckets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}#term-studio .ts-bucket{min-height:132px;padding:13px 10px;border:1px dashed #57dbb777;border-radius:12px;background:#57dbb707;min-width:0}#term-studio .ts-bucket.y-bucket{border-color:#b9a7f788;background:#b9a7f708}#term-studio .ts-bucket.unit-bucket{border-color:#e5b86688;background:#e5b86608}#term-studio .ts-bucket h3{font-size:11px;font-weight:600;color:#a6c6b5;margin:0 0 12px}#term-studio .ts-bucket.y-bucket h3{color:#c0b4e6}#term-studio .ts-bucket.unit-bucket h3{color:#dfc593}#term-studio .ts-bucket-total{display:block;text-align:center;font-size:19px;color:#57dbb7;min-height:30px;margin-top:13px}#term-studio .y-token{color:#c3aff8!important;border-color:#b9a7f788!important;background:#b9a7f714!important}#term-studio .ts-trash{border:1px dashed #cb8d7e66;color:#c8a396;background:#e9948907;border-radius:8px;padding:11px;font-size:10px;text-align:center;margin-top:12px}#term-studio .ts-math-line{font-size:18px;overflow-x:auto;text-align:center;padding:10px 4px;max-width:100%;color:#eef4ed}#term-studio .ts-action-stack{display:grid;gap:9px;margin:15px 0}#term-studio .ts-action-stack button{width:100%;min-height:43px}#term-studio .ts-sample-value{font-size:12px;line-height:1.9;color:#49684f;padding:13px;background:#edf4e8;border-radius:9px;margin:15px 0 0}#term-studio .ts-steps{font-size:11px;line-height:1.8;color:#5f735f}#term-studio .ts-bucket .studio-token.negative{color:#eea294!important;border-color:#e9948988!important;background:#e9948910!important}#term-studio .ts-summary{font-size:12px;color:#a2bfaf;line-height:1.8;min-height:34px}#term-studio .ts-counter{font-size:10px;color:#9fb4a8;text-align:right;margin-top:8px}#term-studio .ts-challenge{border-top:1px solid #dce5d8;padding-top:16px;margin-top:18px}#term-studio .ts-challenge p{font-size:11px;line-height:1.8;color:#536f55}#term-studio .ts-value-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}#term-studio .ts-value-fields label{margin-top:8px}#term-studio .ts-value-fields input{width:100%;accent-color:#3b8c6b}#term-studio .ts-token-grid .katex{font-size:1.1em}#term-studio .ts-bucket-total .katex{font-size:1em}#term-studio .ts-workspace:focus-within{border-color:#88cfac}
@media(max-width:650px){#term-studio .ts-buckets{gap:7px}#term-studio .ts-bucket{padding:12px 7px;min-height:145px}#term-studio .ts-token-grid{gap:5px}#term-studio .ts-token-grid .studio-token{min-width:36px;min-height:43px;padding:7px 6px;font-size:12px}#term-studio .ts-zone-label{font-size:9px;gap:9px;line-height:1.6}#term-studio .ts-zone-label small{font-size:8px}#term-studio .ts-math-line{font-size:16px}#term-studio .ts-bucket h3{font-size:10px}}
</style>`;

/** A signed algebra tile workbench. Every token is an actual +1 or -1 term. */
export function mountTerms(host) {
  let nextId = 0, tokens = [], history = [], challenge = false, hadPair = false, disposed = false;
  let x = 2, y = 3, cancelTimer = 0, feedback = 'Dra en bricka till sin grupp. Klick eller Enter fungerar också.';
  const presets = [
    [{ coefficient:4, variable:'x' }, { coefficient:3, variable:'' }, { coefficient:2, variable:'x' }, { coefficient:-1, variable:'' }],
    [{ coefficient:5, variable:'x' }, { coefficient:-2, variable:'x' }, { coefficient:2, variable:'' }],
    [{ coefficient:3, variable:'x' }, { coefficient:2, variable:'y' }, { coefficient:1, variable:'x' }, { coefficient:-1, variable:'y' }, { coefficient:4, variable:'' }],
  ];
  const s = createStudio(host, {
    id:'term-studio', title:'Termverkstaden', subtitle:'Bygg ett uttryck. Samla samma sort. Se vad som tar ut varandra.',
    tools:`<button class="studio-button" data-action="undo">Ångra ↶</button><button class="studio-button" data-action="clear">Töm arbetsytan</button>`,
    stage:`${termsStyle}<div class="ts-palette"><span class="ts-palette-label">BYGGBRICKOR · DRA ELLER KLICKA FÖR ATT LÄGGA TILL</span>${['x','y',''].flatMap(variable=>[1,-1].map(c=>`<button type="button" class="studio-token ${!variable?'unit':''} ${variable==='y'?'y-token':''} ${c<0?'negative':''}" data-tile="palette" data-variable="${variable}" data-coefficient="${c}" aria-label="Lägg till ${c<0?'minus ':''}${variable||'ett'}">${math(signed(c,variable))}</button>`)).join('')}</div><div class="ts-math-line" data-ui="expression"></div><div class="ts-workspace studio-dropzone" data-zone="workspace" aria-label="Arbetsyta för osorterade termer"><p class="ts-zone-label"><span>ARBETSYTA</span><small>Klicka på en term för att samla den.</small></p><div class="ts-token-grid" data-ui="workspace"></div></div><div class="ts-buckets">${['x','y','unit'].map(kind=>`<section class="ts-bucket studio-dropzone ${kind}-bucket" data-zone="${kind}" aria-label="${kind==='unit'?'Gruppen för vanliga tal':`Gruppen för ${kind}-termer`}"><h3>${kind==='unit'?'Vanliga tal':`${kind}-termer`}</h3><div class="ts-token-grid" data-ui="bucket-${kind}"></div><output class="ts-bucket-total" data-ui="total-${kind}"></output></section>`).join('')}</div><div class="ts-trash studio-dropzone" data-zone="trash" aria-label="Ta bort en term">↘ Släpp en bricka här för att ta bort den</div><div class="ts-counter" data-ui="count"></div><div class="ts-math-line" data-ui="simplified"></div>`,
    controls:`<h3>Välj ett uttryck</h3><label for="ts-preset">Starta med</label><select id="ts-preset"><option value="0">4x + 3 + 2x − 1</option><option value="1">5x − 2x + 2</option><option value="2">3x + 2y + x − y + 4</option><option value="3">Tom arbetsyta</option></select><div class="ts-action-stack"><button class="studio-button" data-action="sort">Samla alla termer →</button><button class="studio-button" data-action="cancel">Ta bort nollpar ⊖</button></div><p class="ts-steps">Ett positivt och ett negativt av samma sort bildar ett nollpar. De kan tas bort tillsammans. Med tangentbord: Enter samlar, Delete tar bort en term.</p><div class="ts-value-fields">${field('ts-x','Prova x',-3,6,x)}${field('ts-y','Prova y',-3,6,y)}</div><div class="ts-sample-value" data-ui="substitution"></div><div class="ts-challenge"><h3>Bygg en utmaning</h3><p>Bygg ett uttryck som blir ${math('3x+2')}. Använd minst ett nollpar.</p><button class="studio-button" data-action="challenge">Börja uppdraget</button><button class="studio-button" data-action="check">Kontrollera mitt bygge</button></div>`,
    readout:'Liknande termer hör ihop.', hint:'Tecknet hör till termen. x, y och vanliga tal är tre olika sorter.'
  });
  const q = selector => s.root.querySelector(selector);
  function save() { history.push({tokens:clone(tokens),hadPair,challenge}); if(history.length>40)history.shift(); }
  function setPreset(index) {
    tokens=[];
    for(const term of presets[index]||[])for(let j=0;j<Math.abs(term.coefficient);j++)tokens.push({id:++nextId,coefficient:Math.sign(term.coefficient),variable:term.variable,zone:'workspace'});
    hadPair=false;challenge=false;history=[];feedback='Dra samma sorts termer till samma grupp. Tecknet följer med.';
  }
  function notePairs() {
    for(const kind of ['x','y',''])if(tokens.some(t=>t.variable===kind&&t.coefficient>0)&&tokens.some(t=>t.variable===kind&&t.coefficient<0))hadPair=true;
  }
  function tokenHTML(t) {
    return `<button type="button" class="studio-token ${!t.variable?'unit':''} ${t.variable==='y'?'y-token':''} ${t.coefficient<0?'negative':''}" data-tile="built" data-key="term-${t.id}" data-token="${t.id}" aria-keyshortcuts="Delete" title="Enter samlar eller lägger tillbaka. Delete tar bort." aria-label="${t.zone==='workspace'?'Samla':'Lägg tillbaka'} termen ${t.coefficient<0?'minus ':''}${t.variable||'ett'}">${math(signed(t.coefficient,t.variable))}</button>`;
  }
  function render() {
    if(disposed)return;
    const focusKey = document.activeElement?.dataset?.key;
    const totals=reduceTerms(tokens);
    animateFlip(s.root,'[data-key]',()=>{
      q('[data-ui="workspace"]').innerHTML=tokens.filter(t=>t.zone==='workspace').map(tokenHTML).join('')||'<span class="ts-empty">Tomt här. Dra hit fler brickor eller lägg tillbaka en term från en grupp.</span>';
      for(const kind of ['x','y','unit']){
        const items=tokens.filter(t=>t.zone===kind);
        q(`[data-ui="bucket-${kind}"]`).innerHTML=items.map(tokenHTML).join('')||'<span class="ts-empty">Släpp här</span>';
        const total=items.reduce((a,t)=>a+t.coefficient,0);
        q(`[data-ui="total-${kind}"]`).innerHTML=math(polynomial([{coefficient:total,variable:kind==='unit'?'':kind}]));
      }
    });
    // Keep the expression compact while showing signed groups separately.
    const sourceGroups=[];
    for(const variable of ['x','y',''])for(const sign of [1,-1]){
      const coefficient=tokens.filter(t=>t.variable===variable&&Math.sign(t.coefficient)===sign).reduce((n,t)=>n+t.coefficient,0);
      if(coefficient)sourceGroups.push({coefficient,variable});
    }
    const input=polynomial(sourceGroups),result=polynomial(totals);
    q('[data-ui="expression"]').innerHTML=math(input);
    q('[data-ui="simplified"]').innerHTML=`<span style="font-size:10px;display:block;color:#93b09f;margin-bottom:7px">SAMMA VÄRDE · FÖRENKLAD FORM</span>${math(result)}`;
    const value=totals.reduce((n,t)=>n+t.coefficient*(t.variable==='x'?x:t.variable==='y'?y:1),0);
    q('[data-ui="substitution"]').innerHTML=`Kontroll med ${math(`x=${x},\\;y=${y}`)}<br>${math(`${result}=${texNum(value)}`)}<br><span>Värdet bevaras när du sorterar och tar bort nollpar.</span>`;
    q('[data-ui="count"]').textContent=`${tokens.length} / 32 brickor · ${tokens.filter(t=>t.zone==='workspace').length} att sortera`;
    q('[data-action="undo"]').disabled=!history.length;
    q('[data-action="cancel"]').disabled=!['x','y','unit'].some(kind=>tokens.some(t=>t.zone===kind&&t.coefficient>0)&&tokens.some(t=>t.zone===kind&&t.coefficient<0));
    s.live.textContent=feedback;
    renderMath(s.root);
    if(focusKey)s.root.querySelector(`[data-key="${focusKey}"]`)?.focus({preventScroll:true});
  }
  function add(variable,coefficient,zone='workspace') {
    if(tokens.length>=32){feedback='Arbetsytan rymmer 32 brickor. Ta bort eller förenkla några innan du bygger vidare.';render();return;}
    save();tokens.push({id:++nextId,variable,coefficient,zone});notePairs();feedback=`En ${coefficient<0?'negativ':'positiv'} ${variable?`${variable}-term`:'enhet'} har lagts till.`;render();
  }
  function target(tile,zone) {
    const dest=zone.dataset.zone,variable=tile.dataset.variable??tokens.find(t=>t.id===+tile.dataset.token)?.variable;
    if(variable===undefined)return;
    if(dest!=='workspace'&&dest!=='trash'&&dest!==tokenKind(variable)){
      feedback=`${variable?`Det är en ${variable}-term`:'Det är ett vanligt tal'}. Den hör till ${variable?`${variable}-gruppen`:'gruppen för vanliga tal'}. Olika sorter kan inte slås ihop.`;render();return;
    }
    if(tile.dataset.tile==='palette'){
      if(dest!=='trash')add(variable,+tile.dataset.coefficient,dest);
      return;
    }
    const token=tokens.find(t=>t.id===+tile.dataset.token);if(!token||token.zone===dest)return;
    save();if(dest==='trash')tokens=tokens.filter(t=>t.id!==token.id);else token.zone=dest;
    feedback=dest==='trash'?'Termen är borttagen: uttrycket kan nu få ett annat värde. Ångra om du vill.':dest==='workspace'?'Termen är tillbaka på arbetsytan.':'Samma term, samma tecken — nu i rätt grupp.';render();
  }
  const removeDrag=dragTiles(s.root,{tileSelector:'[data-tile]',zoneSelector:'[data-zone]',onDrop:target,onTap:tile=>{
    if(tile.dataset.tile==='palette')add(tile.dataset.variable,+tile.dataset.coefficient);
    else {const t=tokens.find(t=>t.id===+tile.dataset.token);if(t)target(tile,{dataset:{zone:t.zone==='workspace'?tokenKind(t.variable):'workspace'}});}
  }});
  const removeKey=e=>{const tile=e.target.closest?.('[data-token]');if(tile&&(e.key==='Delete'||e.key==='Backspace')){e.preventDefault();target(tile,{dataset:{zone:'trash'}});}};s.root.addEventListener('keydown',removeKey);
  q('#ts-preset').onchange=e=>{setPreset(+e.target.value);render();};
  q('[data-action="undo"]').onclick=()=>{const prev=history.pop();if(prev){tokens=prev.tokens;hadPair=prev.hadPair;challenge=prev.challenge;feedback='Senaste ändringen är ångrad.';render();}};
  q('[data-action="clear"]').onclick=()=>{save();tokens=[];hadPair=false;feedback='Tom arbetsyta. Bygg ett eget uttryck med brickorna.';render();};
  q('[data-action="sort"]').onclick=()=>{save();tokens.forEach(t=>t.zone=tokenKind(t.variable));feedback='Alla termer är samlade efter sort. Nu kan du ta bort eventuella nollpar.';render();};
  q('[data-action="cancel"]').onclick=()=>{
    const ids=[];
    for(const kind of ['x','y','unit']){
      const pos=tokens.filter(t=>t.zone===kind&&t.coefficient>0),neg=tokens.filter(t=>t.zone===kind&&t.coefficient<0);
      for(let i=0;i<Math.min(pos.length,neg.length);i++)ids.push(pos[i].id,neg[i].id);
    }
    if(!ids.length){feedback='Inga nollpar i grupperna ännu. Samla först en positiv och en negativ term av samma sort.';render();return;}
    save();hadPair=true;tokens=tokens.filter(t=>!ids.includes(t.id));
    feedback=`${ids.length/2} nollpar borttagna. Ett positivt och ett negativt av samma sort tog ut varandra; uttryckets värde är samma.`;s.live.textContent=feedback;
    const finish=()=>{cancelTimer=0;if(disposed)return;render();};
    if(reducedMotion()){finish();return;}
    for(const id of ids){const el=q(`[data-token="${id}"]`);el?.animate?.([{transform:'scale(1)',opacity:1},{transform:'scale(.2)',opacity:0}],{duration:320,easing:'ease-in'});}
    cancelTimer=window.setTimeout(finish,330);
  };
  q('[data-action="challenge"]').onclick=()=>{save();tokens=[];hadPair=false;challenge=true;feedback='Uppdrag: bygg 3x + 2 och låt ett nollpar ingå i ditt bygge. Välj brickor från paletten.';render();};
  q('[data-action="check"]').onclick=()=>{
    const totals=reduceTerms(tokens),sum=v=>totals.find(t=>t.variable===v)?.coefficient||0;
    const correct=sum('x')===3&&sum('y')===0&&sum('')===2;
    feedback=correct&&hadPair?'Precis! Ditt uttryck blir 3x + 2, och du har använt ett nollpar. Förklara varför paret inte ändrar värdet.':correct?'Uttrycket blir 3x + 2. Lägg också till ett positivt och ett negativt av samma sort för att skapa ett nollpar.':'Prova igen: efter förenkling ska det finnas tre x och två enheter, men inga y. Nollpar får gärna finnas med.';
    render();
  };
  for(const id of ['ts-x','ts-y'])q('#'+id).oninput=e=>{const v=+e.target.value;if(id==='ts-x')x=v;else y=v;q(`[data-output="${id}"]`).textContent=v;render();};
  setPreset(0);render();
  return ()=>{disposed=true;window.clearTimeout(cancelTimer);removeDrag?.();s.root.removeEventListener('keydown',removeKey);s.destroy();};
}

const storyStyle = `<style>
#park-studio .studio-range output{float:right;background:#e6f0df;color:#326647;border-radius:5px;padding:1px 7px;margin-left:7px;font-weight:650}#park-studio .np-scene{display:grid;grid-template-columns:minmax(0,1fr) 174px;align-items:center;gap:16px;margin-top:12px}#park-studio .np-wheel{width:100%;max-width:390px;min-height:210px;display:block;overflow:visible}#park-studio .np-wheel .np-spoke{stroke:#75b5a033;stroke-width:2}#park-studio .np-wheel .np-rim{fill:none;stroke:#5c9e8844;stroke-width:5}#park-studio .np-wheel .np-hub{fill:#b4e3c6;stroke:#57dbb755;stroke-width:9}#park-studio .np-wheel .np-gondola{fill:#244739;stroke:#7dbb9e;stroke-width:1.5;transition:fill .35s}#park-studio .np-wheel .np-gondola.active{fill:#57dbb7;stroke:#9bf3d2}#park-studio .np-wheel-label{fill:#94b3a2;font-size:10px;font-family:inherit;letter-spacing:1.5px}#park-studio .np-receipt{background:#ffffff06;border:1px solid #ffffff1b;border-radius:14px;padding:18px 14px;font-size:11px;align-self:stretch;display:flex;flex-direction:column;justify-content:center}#park-studio .np-receipt h3{color:#afc9b9;font-size:11px;letter-spacing:.08em;margin:0 0 17px}#park-studio .np-receipt p{display:flex;justify-content:space-between;gap:10px;font-size:11px;color:#a8c0b2;margin:8px 0}#park-studio .np-receipt strong{color:#eef5e9;font-weight:500}#park-studio .np-receipt .np-total{border-top:1px dashed #ffffff24;margin-top:12px;padding-top:14px}#park-studio .np-total strong{color:#e5b866}#park-studio .np-budget-meter{height:5px;overflow:hidden;background:#ffffff10;border-radius:8px;margin:15px 0 5px}#park-studio .np-budget-meter>span{display:block;height:100%;width:0;background:#57dbb7;transition:width .45s,background .3s}#park-studio .np-over .np-budget-meter>span{background:#e99489}#park-studio .np-budget-status{font-size:10px!important;line-height:1.65!important;color:#b6d1bb!important;display:block!important}#park-studio .np-ticket-area{margin-top:18px}#park-studio .np-ticket-head{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:12px}#park-studio .np-ticket-head>span{font-size:10px;color:#9dbbac;letter-spacing:.08em}#park-studio .np-ticket-wallet{padding:14px;border:1px dashed #57dbb777;border-radius:12px;background:#57dbb706;min-height:84px;display:flex;gap:7px;flex-wrap:wrap;align-items:center;max-height:181px;overflow-y:auto}#park-studio .np-ticket{min-width:38px;min-height:49px;border:1px dashed #57dbb799!important;border-radius:7px!important;background:#57dbb712!important;color:#83e0bb!important;padding:7px!important;position:relative;font-size:11px}#park-studio .np-ticket small{font:8px sans-serif;display:block;color:#aecbb8;margin-top:5px}#park-studio .np-ticket-palette{min-height:45px!important;padding:8px 12px!important;white-space:nowrap;min-width:110px!important}#park-studio .np-wallet-empty{font-size:11px;color:#87a694;line-height:1.8}#park-studio .np-trash{margin-top:8px;border:1px dashed #e9948944;padding:10px;border-radius:8px;font-size:10px;color:#bda494;text-align:center}#park-studio .np-status{font-size:12px;line-height:1.8;min-height:39px;color:#d4e7d5;margin:15px 0 4px}#park-studio .np-math{font-size:21px;text-align:center;overflow-x:auto;padding:8px 0;max-width:100%}#park-studio .np-ticket-actions{display:flex;gap:8px;margin:14px 0}#park-studio .np-ticket-actions button{flex:1;min-height:44px}#park-studio .np-saved{border:1px solid #d6e4d1;background:#eff5e9;border-radius:10px;padding:13px;margin-top:15px;color:#4d6c4f;font-size:11px;line-height:1.8}#park-studio .np-saved h4{font-size:11px;margin:0 0 7px}#park-studio .np-saved .katex{font-size:1em}#park-studio .np-experiment-note{font-size:10px;line-height:1.8;color:#5b745b;margin:14px 0}#park-studio .np-actions{display:grid;gap:8px;margin-top:15px}#park-studio .np-actions button{min-height:43px}#park-studio .np-legend{font-size:9px;color:#92ad9e;margin:7px 0;text-align:center}#park-studio .np-compare-current{border-top:1px solid #dbe7d6;margin-top:9px;padding-top:9px}#park-studio .np-receipt .katex{font-size:1em}#park-studio .np-subtle{font-size:9px;color:#8dab9c;line-height:1.7}
@media(max-width:650px){#park-studio .np-scene{grid-template-columns:minmax(0,1fr) 133px;gap:8px}#park-studio .np-wheel{min-height:180px}#park-studio .np-receipt{padding:13px 10px}#park-studio .np-receipt p{font-size:10px;gap:6px}#park-studio .np-receipt h3{font-size:10px}#park-studio .np-math{font-size:17px}#park-studio .np-ticket-head{gap:8px}#park-studio .np-ticket-head>span{font-size:9px}#park-studio .np-ticket-palette{min-width:98px!important;font-size:11px!important}#park-studio .np-ticket{min-width:35px;padding:7px 5px!important}}
@media(max-width:370px){#park-studio .np-scene{grid-template-columns:1fr}#park-studio .np-wheel{max-height:190px;min-height:150px}#park-studio .np-receipt{display:grid;grid-template-columns:1fr 1fr;gap:5px 13px}#park-studio .np-receipt h3{grid-column:1/-1;margin-bottom:4px}#park-studio .np-receipt p{margin:4px 0}#park-studio .np-receipt .np-total{margin-top:0;padding-top:0;border:0}#park-studio .np-budget-meter,#park-studio .np-budget-status{grid-column:1/-1}}
</style>`;

/** An editable admission/ticket model with continuous, pausable visual motion. */
export function mountStory(host) {
  let fee=35,price=15,budget=125,nextId=3,tickets=[1,2,3],saved=null,history=[],disposed=false,phase=0,raf=0,lastTime=0;
  let challengeActive=false,answerRevealed=false;
  let running=!reducedMotion(),visible=true,feedback='Dra en åktursbiljett till ditt parkkort. Varje biljett kostar lika mycket.';
  const initial=[35,15,125],scenarios=[[35,15,125],[50,20,170],[40,25,180]];
  const gondolas=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,x=145+100*Math.cos(a),y=126+100*Math.sin(a);return `<g data-gondola="${i}"><line class="np-spoke" x1="145" y1="126" x2="${x}" y2="${y}"/><g data-car="${i}" transform="translate(${x} ${y})"><rect class="np-gondola" x="-10" y="-4" width="20" height="15" rx="4"/></g></g>`;}).join('');
  const s=createStudio(host,{
    id:'park-studio',title:'Nöjesparkslabbet',subtitle:'Bygg din dag i parken. Koppla biljetter, pengar och en ekvation.',
    tools:`<button class="studio-button" data-action="motion">${running?'Pausa parken Ⅱ':'Starta parken ▷'}</button><button class="studio-button" data-action="reset">Börja om ↺</button>`,
    stage:`${storyStyle}<div class="np-math" data-ui="equation"></div><div class="np-scene"><div><svg class="np-wheel studio-svg" viewBox="0 0 290 280" role="img" aria-label="Rörlig schematisk nöjesparksmodell. Antalet biljetter och priset visas i parkkortet."><defs><linearGradient id="np-metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#8dc2aa"/><stop offset="1" stop-color="#31594c"/></linearGradient></defs><path d="M8 255H282" stroke="#68998144" stroke-width="2"/><path d="M145 126L99 253M145 126L191 253" stroke="url(#np-metal)" stroke-width="8" stroke-linecap="round"/><circle class="np-rim" cx="145" cy="126" r="100"/><circle cx="145" cy="126" r="93" fill="none" stroke="#57dbb70c" stroke-width="9"/><g data-ui="rotor">${gondolas}</g><circle class="np-hub" cx="145" cy="126" r="8"/><path d="M87 254H203" stroke="#86b69c" stroke-width="4" stroke-linecap="round"/><text class="np-wheel-label" x="145" y="276" text-anchor="middle">DIN PARK · EN MODELL</text></svg><p class="np-legend">Parken är en bildmodell. Kostnaden styrs av biljetterna nedan.</p></div><div class="np-receipt" data-ui="receipt"><h3>DITT PARKKORT</h3><p><span>Entré</span><strong data-ui="fee"></strong></p><p><span>Åkturer</span><strong data-ui="ticket-cost"></strong></p><p class="np-total"><span>Kostnad</span><strong data-ui="total"></strong></p><p><span>Budget</span><strong data-ui="budget"></strong></p><div class="np-budget-meter" aria-hidden="true"><span data-ui="meter"></span></div><p class="np-budget-status" data-ui="budget-status"></p></div></div><div class="np-ticket-area"><div class="np-ticket-head"><span>BILJETTER · ${math('x=\\text{antal åkturer}')}</span><button type="button" class="studio-token np-ticket-palette" data-tile="palette" aria-label="Lägg till en åktursbiljett">+ En åktur ↘</button></div><div class="np-ticket-wallet studio-dropzone" data-zone="wallet" data-ui="wallet" aria-label="Mitt parkkort, släpp åktursbiljetter här"></div><div class="np-trash studio-dropzone" data-zone="trash" aria-label="Ta bort en åktursbiljett">↘ Släpp en biljett här för att lämna tillbaka den</div></div><p class="np-status" data-ui="status" aria-live="polite"></p><div class="np-math" data-ui="solution"></div>`,
    controls:`<h3>Ändra villkoren</h3><label for="np-scenario">Välj en dag</label><select id="np-scenario"><option value="0">Entré 35 · åktur 15 · budget 125</option><option value="1">Entré 50 · åktur 20 · budget 170</option><option value="2">Entré 40 · åktur 25 · budget 180</option></select>${field('np-fee','Entré (kr)',0,80,fee,5)}${field('np-price','Pris per åktur (kr)',10,40,price,5)}${field('np-budget','Budget (kr)',40,240,budget,5)}${field('np-rides','Antal åkturer x',0,24,tickets.length)}<div class="np-ticket-actions"><button class="studio-button" data-action="remove" aria-label="Ta bort en åktur">− En åktur</button><button class="studio-button" data-action="add" aria-label="Lägg till en åktur">+ En åktur</button></div><p class="np-experiment-note">Dra biljetter till parkkortet. Klicka på en biljett för att lämna tillbaka den. Alla förändringar syns direkt i formeln.</p><div class="np-actions"><button class="studio-button" data-action="save">Spara en jämförelse</button><button class="studio-button" data-action="undo">Ångra senaste ändringen</button><button class="studio-button" data-action="challenge">Uppdrag: använd hela budgeten</button><button class="studio-button" data-action="check">Kontrollera min dag</button></div><div data-ui="comparison"></div>`,
    readout:'Vad är fast, och vad beror på antalet åkturer?',hint:'Börja med entrén. Varje ny biljett lägger till priset för en åktur.'
  });
  const q=selector=>s.root.querySelector(selector);
  const state=()=>({fee,price,budget,tickets:[...tickets],challengeActive,answerRevealed});
  const push=()=>{history.push(state());if(history.length>40)history.shift();};
  function resizeTickets(count){count=Math.max(0,Math.min(24,Math.round(count)));while(tickets.length<count)tickets.push(++nextId);tickets=tickets.slice(0,count);}
  function render(){
    if(disposed)return;
    const rides=tickets.length,total=fee+price*rides,remaining=budget-total,solution=(budget-fee)/price,canEnter=budget>=fee,maxRides=Math.max(0,Math.floor(solution));
    q('[data-ui="equation"]').innerHTML=math(`K=${fee}+${price}x`);
    q('[data-ui="solution"]').innerHTML=math(`${fee}+${price}\\cdot${rides}=${total}\\;\\text{kr}`);
    for(const [id,value] of [['np-fee',fee],['np-price',price],['np-budget',budget],['np-rides',rides]]){q('#'+id).value=value;q(`[data-output="${id}"]`).textContent=value;}
    q('[data-ui="fee"]').innerHTML=math(`${fee}\\;\\text{kr}`);q('[data-ui="ticket-cost"]').innerHTML=math(`${rides}\\cdot${price}`);q('[data-ui="total"]').innerHTML=math(`${total}\\;\\text{kr}`);q('[data-ui="budget"]').innerHTML=math(`${budget}\\;\\text{kr}`);
    q('[data-ui="receipt"]').classList.toggle('np-over',remaining<0);
    q('[data-ui="meter"]').style.width=Math.min(total/budget*100,100)+'%';
    q('[data-ui="budget-status"]').textContent=remaining===0?'Hela budgeten används.':remaining>0?`${remaining} kr kvar.`:`${-remaining} kr över budgeten.`;
    const focusKey=document.activeElement?.dataset?.key;
    animateFlip(s.root,'[data-key]',()=>{q('[data-ui="wallet"]').innerHTML=tickets.map((id,i)=>`<button type="button" class="studio-token np-ticket" data-tile="ticket" data-ticket="${id}" data-key="ticket-${id}" aria-label="Lämna tillbaka åktursbiljett ${i+1}">${math('1')}<small>ÅKTUR</small></button>`).join('')||'<span class="np-wallet-empty">Tomt parkkort. Dra hit en biljett eller tryck på + En åktur.</span>';});
    q('[data-ui="status"]').textContent=!canEnter?'Budgeten räcker inte till entrén. Höj budgeten eller sänk entrépriset.':challengeActive&&!answerRevealed?(remaining>0?`Din dag kostar ${total} kr. Du har ${remaining} kr kvar. Prova fler biljetter och jämför med budgeten.`:remaining<0?`Din dag kostar ${total} kr och ligger ${-remaining} kr över budgeten. Prova färre biljetter.`:'Kostnaden matchar budgeten. Tryck på Kontrollera min dag och förklara hur du tänkte.'):Number.isInteger(solution)?`Ekvationen ${fee} + ${price}x = ${budget} har lösningen x = ${number(solution)} åkturer.`:`För att använda exakt hela budgeten skulle x bli ${number(solution)}. Du kan åka ${maxRides} hela åkturer och får ${budget-fee-price*maxRides} kr kvar.`;
    q('[data-action="remove"]').disabled=rides===0;q('[data-action="add"]').disabled=rides>=24;q('[data-action="undo"]').disabled=!history.length;
    q('[data-ui="comparison"]').innerHTML=saved?`<aside class="np-saved"><h4>Din sparade dag</h4>${math(`${saved.fee}+${saved.price}\\cdot${saved.rides}=${saved.total}\\;\\text{kr}`)}<div class="np-compare-current">Nu: ${math(`${fee}+${price}\\cdot${rides}=${total}\\;\\text{kr}`)}<br>${total===saved.total?'Samma kostnad.':`${Math.abs(total-saved.total)} kr ${total>saved.total?'dyrare':'billigare'} än den sparade dagen.`}</div><button class="studio-button" data-action="clear-save">Rensa jämförelsen</button></aside>`:'';
    q('[data-action="clear-save"]')?.addEventListener('click',()=>{saved=null;render();});
    const activeCars=Math.min(rides,12);s.root.querySelectorAll('[data-car] .np-gondola').forEach((el,i)=>el.classList.toggle('active',i<activeCars));
    s.live.textContent=feedback;renderMath(s.root);
    if(focusKey)q(`[data-key="${focusKey}"]`)?.focus({preventScroll:true});
  }
  function changeRides(amount){if((tickets.length===0&&amount<0)||(tickets.length===24&&amount>0))return;push();resizeTickets(tickets.length+amount);feedback=amount>0?`En biljett till: kostnaden ökar med ${price} kr.`:`En biljett tillbaka: kostnaden minskar med ${price} kr.`;render();}
  const removeDrag=dragTiles(s.root,{tileSelector:'[data-tile]',zoneSelector:'[data-zone]',onDrop:(tile,zone)=>{
    if(tile.dataset.tile==='palette'&&zone.dataset.zone==='wallet')changeRides(1);
    else if(tile.dataset.tile==='ticket'&&zone.dataset.zone==='trash'){push();tickets=tickets.filter(id=>id!==+tile.dataset.ticket);feedback=`Biljetten är tillbaka. Kostnaden minskar med ${price} kr.`;render();}
  },onTap:tile=>{
    if(tile.dataset.tile==='palette')changeRides(1);
    else{push();tickets=tickets.filter(id=>id!==+tile.dataset.ticket);feedback=`Biljetten är tillbaka. Kostnaden minskar med ${price} kr.`;render();}
  }});
  for(const id of ['np-fee','np-price','np-budget','np-rides']){
    let started=false;
    q('#'+id).addEventListener('pointerdown',()=>{if(!started){push();started=true;}});
    q('#'+id).addEventListener('change',()=>{started=false;});
    q('#'+id).addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key)&&!started){push();started=true;}});
    q('#'+id).addEventListener('keyup',()=>{started=false;});
    q('#'+id).oninput=e=>{const v=+e.target.value;if(id==='np-fee')fee=v;else if(id==='np-price')price=v;else if(id==='np-budget')budget=v;else resizeTickets(v);if(id!=='np-rides')answerRevealed=false;feedback='Nya villkor. Jämför vad som förändras i bilden och formeln.';render();};
  }
  q('#np-scenario').onchange=e=>{push();[fee,price,budget]=scenarios[+e.target.value];answerRevealed=false;feedback='En ny dag med nya priser. Biljetterna finns kvar så att du kan jämföra.';render();};
  q('[data-action="add"]').onclick=()=>changeRides(1);q('[data-action="remove"]').onclick=()=>changeRides(-1);
  q('[data-action="save"]').onclick=()=>{saved={fee,price,budget,rides:tickets.length,total:fee+price*tickets.length};feedback='Dagen är sparad som jämförelse. Ändra priser eller biljetter och undersök skillnaden.';render();};
  q('[data-action="undo"]').onclick=()=>{const prev=history.pop();if(prev){({fee,price,budget,tickets,challengeActive,answerRevealed}=prev);feedback='Senaste ändringen är ångrad.';render();}};
  q('[data-action="reset"]').onclick=()=>{[fee,price,budget]=initial;tickets=[++nextId,++nextId,++nextId];history=[];saved=null;challengeActive=false;answerRevealed=false;q('#np-scenario').value='0';feedback='Tillbaka till början: entré 35 kr och 15 kr per åktur.';render();};
  q('[data-action="challenge"]').onclick=()=>{push();[fee,price,budget]=initial;tickets=[];saved=null;challengeActive=true;answerRevealed=false;q('#np-scenario').value='0';feedback='Uppdrag: använd hela budgeten 125 kr. Entrén kostar 35 kr och varje åktur 15 kr. Bygg din dag med biljetter.';render();};
  q('[data-action="check"]').onclick=()=>{const total=fee+price*tickets.length,solution=(budget-fee)/price;
    if(total===budget||(budget>=fee&&!Number.isInteger(solution)&&tickets.length===Math.floor(solution)))answerRevealed=true;
    feedback=total===budget?`Precis! ${tickets.length} åkturer använder hela budgeten: ${fee} + ${price} · ${tickets.length} = ${budget} kr.`:budget<fee?'Entrén kostar mer än budgeten. Välj en större budget innan du planerar åkturer.':!Number.isInteger(solution)&&tickets.length===Math.floor(solution)?`Bra planerat: ${tickets.length} är det största hela antalet åkturer. ${budget-total} kr blir över eftersom en del av en åktur inte kan köpas.`:total>budget?`Du ligger ${total-budget} kr över budgeten. Lämna tillbaka någon biljett och försök igen.`:`Du har ${budget-total} kr kvar. Hur många fler hela åkturer räcker de till?`;render();};
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=0;}
  function tick(time){raf=0;if(disposed||!running||!visible||document.hidden||reducedMotion()){lastTime=0;return;}const dt=lastTime?Math.min((time-lastTime)/1000,.05):0;lastTime=time;phase=(phase+dt*(5+tickets.length*.35))%360;q('[data-ui="rotor"]').setAttribute('transform',`rotate(${phase} 145 126)`);s.root.querySelectorAll('[data-car]').forEach(el=>{const i=+el.dataset.car,a=i*Math.PI/6,cx=145+100*Math.cos(a),cy=126+100*Math.sin(a);el.setAttribute('transform',`translate(${cx} ${cy}) rotate(${-phase})`);});raf=requestAnimationFrame(tick);}
  function syncMotion(){q('[data-action="motion"]').textContent=running?'Pausa parken Ⅱ':'Starta parken ▷';if(running&&visible&&!document.hidden&&!reducedMotion()&&!raf)raf=requestAnimationFrame(tick);else if(!running||!visible||document.hidden||reducedMotion())stop();}
  q('[data-action="motion"]').onclick=()=>{running=!running;syncMotion();if(reducedMotion()&&running){feedback='Minskad rörelse är aktiverad. Parken står stilla, men biljetter och beräkningar fungerar.';render();}};
  const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;syncMotion();},{threshold:.03}):null;observer?.observe(s.root);
  const motionObserver=typeof MutationObserver==='function'?new MutationObserver(syncMotion):null;motionObserver?.observe(document.body,{attributes:true,attributeFilter:['class']});
  const visibility=()=>syncMotion();document.addEventListener('visibilitychange',visibility);
  render();syncMotion();
  return ()=>{disposed=true;stop();observer?.disconnect();motionObserver?.disconnect();document.removeEventListener('visibilitychange',visibility);removeDrag?.();s.destroy();};
}
