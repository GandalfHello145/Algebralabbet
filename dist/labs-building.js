import { $, $$, math, renderMath, createStudio, dragTiles, animateFlip, reducedMotion, number } from './lab-kit.js?v=studio-2';
import { evaluateExpression, patternCount } from './model.js';

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const fmt = value => Number(value.toFixed(4)).toLocaleString('sv-SE', { maximumFractionDigits: 4 });
const linear = (a, b, variable = 'x') => `${a ? (a === 1 ? '' : a) + variable : ''}${b ? (a && b > 0 ? '+' : '') + b : ''}` || '0';
const equationValue = (a, b, x) => `${linear(a,b)}=${a}\\cdot(${x})${b ? (b > 0 ? '+' : '') + b : ''}=${evaluateExpression(a,b,x)}`;
const button = (label, action, extra = '') => `<button class="studio-button" data-action="${action}" ${extra}>${label}</button>`;

const styles = `
.building-studio .eb-mobile-palette{display:none!important}.building-studio .eb-palette{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 8px}.building-studio .eb-palette .studio-token{min-width:51px;min-height:48px;cursor:grab;touch-action:none}
.building-studio .eb-palette .studio-token:active{cursor:grabbing}.building-studio .eb-label{font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#a1bfb2;display:flex;justify-content:space-between;gap:10px;margin:0 0 14px}.building-studio .eb-label span{color:#779a8b}
.building-studio .eb-workspace{border:1px dashed #57dbb75c;background:linear-gradient(125deg,#57dbb70b,transparent);border-radius:15px;padding:20px 15px;min-height:166px;display:flex;gap:10px;flex-wrap:wrap;align-content:center;align-items:center;justify-content:center;position:relative;transition:border-color .2s,background .2s}
.building-studio .eb-workspace:empty:after{content:'Dra hit en byggsten';font-size:13px;color:#8fafa0}.building-studio .eb-token{position:relative;isolation:isolate;overflow:hidden;min-width:48px;min-height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:grab;touch-action:none;transition:background .3s,border-color .3s,box-shadow .3s;box-shadow:0 6px 20px #00000012}
.building-studio .eb-token.variable{width:57px;height:79px;border-radius:10px}.building-studio .eb-token.variable .katex{font-size:1.55em}.building-studio .eb-token.unit{min-width:44px;min-height:44px;width:44px;height:44px;border-radius:8px}.building-studio .eb-token small{font-size:10px;color:#c4dbd0}.building-studio .eb-token .tex,.building-studio .eb-token small{z-index:1;position:relative}.building-studio .eb-fill{position:absolute;inset:auto 0 0;height:0;background:linear-gradient(0deg,#57dbb740,#57dbb70a);z-index:0;transition:height .45s cubic-bezier(.22,.75,.25,1),background .3s}.building-studio .eb-token.is-negative-value .eb-fill{background:linear-gradient(0deg,#ed998b3c,#ed998b0a)}
.building-studio .eb-empty{font-size:12px;color:#a8c1b4;padding:28px 6px;text-align:center}.building-studio .eb-build-hint{font-size:10px;color:#8cad9c;text-align:center;line-height:1.65;margin:10px 0 0}.building-studio .eb-value-strip{display:grid;grid-template-columns:1fr auto;align-items:center;gap:15px;margin:20px 0 0;padding:16px 18px;border:1px solid #57dbb72f;border-radius:12px;background:#57dbb70b}.building-studio .eb-value-strip .studio-formula{padding:0;min-height:34px;margin:0;text-align:left;font-size:21px}.building-studio .eb-big-value{font-size:35px;letter-spacing:-1px;color:#57dbb7;font-weight:550;line-height:1}.building-studio .eb-small-label{display:block;font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#8caf9b;margin-bottom:7px}.building-studio .eb-arrow{color:#7fac97;margin:0 10px}.building-studio .eb-trash{border:1px dashed #ed998b75;background:#ed998b08;border-radius:10px;padding:13px;text-align:center;color:#bd9e93;font-size:11px;min-height:47px;margin-top:14px}.building-studio .eb-trash button{background:none;color:inherit;border:0;font-size:11px;cursor:pointer}
.building-studio .eb-stage-metrics{display:flex;gap:12px;flex-wrap:wrap;margin:0 0 17px}.building-studio .eb-stage-metrics>span{font-size:10px;color:#9cb9aa;background:#ffffff06;border:1px solid #ffffff13;padding:8px 10px;border-radius:7px}.building-studio .eb-stage-metrics b{font-size:13px;color:#e9f3ed;margin-left:5px}.building-studio .eb-comparison{border-top:1px solid #ffffff15;margin-top:18px;padding-top:15px}.building-studio .eb-comparison .studio-formula{font-size:15px;text-align:left;min-height:30px;padding:0}.building-studio .eb-comparison p{font-size:11px;color:#a4c1b1;line-height:1.75;margin:7px 0 0}.building-studio .eb-comparison[hidden]{display:none}.building-studio .eb-control-stack{display:grid;gap:10px}.building-studio .eb-control-stack .studio-button{width:100%}.building-studio .eb-help{font-size:11px;line-height:1.8;color:#617360;margin:8px 0 13px}.building-studio .eb-control-title{font-size:12px;font-weight:650;color:#294e3c;margin:21px 0 5px}.building-studio .eb-control-title:first-child{margin-top:0}.building-studio .eb-control-number{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;margin:17px 0 7px;color:#385d43}.building-studio .eb-control-number output{padding:5px 9px;border-radius:6px;background:#e8f1e3;color:#2c6b4b;font-weight:650}.building-studio input[type=range]{width:100%;accent-color:#2f8b64;min-height:25px}.building-studio select{width:100%;padding:10px;border:1px solid #cfdcc9;border-radius:7px;background:#f8faf4;color:#345439;font-size:11px;line-height:1.4}.building-studio .eb-divider{border:0;border-top:1px solid #dfe8da;margin:20px 0}.building-studio .eb-toggle{display:flex;align-items:center;gap:8px;font-size:11px;line-height:1.6;color:#526b4f;margin:13px 0}.building-studio .eb-toggle input{accent-color:#2f8b64;width:16px;height:16px;flex-shrink:0}.building-studio .eb-challenge{margin-top:20px;border-top:1px solid #dfe8da;padding-top:16px}.building-studio .eb-challenge summary{font-size:12px;font-weight:650;color:#315a3e;cursor:pointer;line-height:1.6}.building-studio .eb-challenge p{font-size:11px;line-height:1.8;color:#5c7356;margin:10px 0}.building-studio .eb-feedback{padding:11px 12px;border-radius:8px;background:#eaf4e4;color:#355e3b;font-size:11px;line-height:1.7;margin-top:11px}.building-studio .eb-feedback:empty{display:none}.building-studio .eb-feedback.is-wrong{background:#f8eee8;color:#805140}.building-studio .eb-inline-tex .katex{font-size:1em}.building-studio .eb-range-ends{display:flex;justify-content:space-between;font-size:9px;color:#809077;margin-top:1px}.building-studio .studio-live .eb-status{color:#355f40}.building-studio .eb-status{font-size:11px;line-height:1.8;color:#a4c5b0;min-height:22px;margin:0}
.pattern-builder .pb-svg{width:100%;height:auto;aspect-ratio:620 / 250;max-height:360px;display:block;overflow:visible;margin:0 auto 2px}.pattern-builder .pb-dot{transform-box:fill-box;transform-origin:center;transition:opacity .45s,transform .6s cubic-bezier(.2,.85,.3,1);opacity:1}.pattern-builder .pb-dot.is-hidden{opacity:.06;transform:scale(.55)}.pattern-builder .pb-current{fill:#57dbb708;stroke:#57dbb72a;stroke-width:1;transition:x .5s,width .5s}.pattern-builder .pb-group-label{fill:#91b6a1;font:13px -apple-system,BlinkMacSystemFont,sans-serif;transition:opacity .3s}.pattern-builder .pb-group-label.is-hidden{opacity:.15}.pattern-builder .pb-construction{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:17px}.pattern-builder .pb-part{min-height:94px;padding:13px;border-radius:11px;border:1px dashed #57dbb759;background:#57dbb708;min-width:0}.pattern-builder .pb-part.fixed{border-color:#e5b86665;background:#e5b86608}.pattern-builder .pb-part h3{font-size:10px;font-weight:550;color:#8fb49f;margin:0 0 11px}.pattern-builder .pb-part.fixed h3{color:#cab27f}.pattern-builder .pb-part-tiles{display:flex;gap:5px;flex-wrap:wrap;min-height:27px;align-items:center}.pattern-builder .pb-part-tiles .studio-token{min-width:44px;min-height:44px;padding:8px 10px;cursor:grab;touch-action:none;font-size:11px;border-radius:6px}.pattern-builder .pb-part-tiles .pb-none{font-size:10px;color:#8aa794}.pattern-builder .pb-equation{margin:5px 0 7px;text-align:center;font-size:23px;color:#e9f3ed;min-height:43px}.pattern-builder .pb-readout{display:flex;justify-content:center;align-items:center;gap:14px;margin-top:15px;padding-top:15px;border-top:1px solid #ffffff14;color:#9cbaa7;font-size:12px}.pattern-builder .pb-readout strong{font-size:27px;color:#57dbb7;font-weight:500}.pattern-builder .pb-table{width:100%;border-collapse:collapse;margin-top:16px;font-size:10px;color:#527149}.pattern-builder .pb-table th,.pattern-builder .pb-table td{padding:7px 4px;text-align:center;border:1px solid #dce6d6}.pattern-builder .pb-table th{background:#edf4e7;font-size:9px;font-weight:550}.pattern-builder .pb-table td.current{background:#e7f2df;color:#1f6743;font-weight:700}.pattern-builder .pb-play-row{display:grid;grid-template-columns:1fr 85px;gap:8px;margin:13px 0}.pattern-builder .pb-play-row label{margin:0}.pattern-builder .pb-play-row select{font-size:10px;padding:9px 6px}.pattern-builder .pb-camera-tools{display:flex;gap:6px;justify-content:end;margin:4px 0 -4px}.pattern-builder .pb-camera-tools button{background:#ffffff07;border:1px solid #ffffff20;color:#9ebaaa;border-radius:6px;font-size:9px;padding:6px 9px;cursor:pointer}.pattern-builder .pb-legend{display:flex;justify-content:center;gap:17px;font-size:9px;color:#96b8a4;margin:8px 0 0}.pattern-builder .pb-legend i{display:inline-block;width:6px;height:6px;border-radius:2px;background:#57dbb7;margin-right:5px}.pattern-builder .pb-legend span:last-child i{background:#e5b866}.pattern-builder .pb-controls-note{font-size:10px;line-height:1.7;color:#6b805e;margin:9px 0 0}
@media(max-width:650px){.building-studio .eb-mobile-palette{display:flex!important;margin:0 0 14px}.building-studio .studio-controls>.eb-palette{display:none}.building-studio .eb-workspace{min-height:161px;padding:18px 10px;gap:8px}.building-studio .eb-token.variable{width:46px;height:65px;min-width:46px}.building-studio .eb-token.unit{width:44px;height:44px;min-width:44px;min-height:44px}.building-studio .eb-value-strip{padding:14px 13px;gap:8px}.building-studio .eb-value-strip .studio-formula{font-size:18px}.building-studio .eb-big-value{font-size:29px}.building-studio .eb-stage-metrics{gap:7px}.building-studio .eb-stage-metrics>span{font-size:9px;padding:7px}.building-studio .eb-label{font-size:8px;letter-spacing:.7px}.pattern-builder .pb-construction{gap:9px}.pattern-builder .pb-part{padding:11px;min-height:96px}.pattern-builder .pb-equation{font-size:20px}.pattern-builder .pb-svg{aspect-ratio:620 / 270;min-height:170px}.pattern-builder .pb-group-label{font-size:16px}.pattern-builder .pb-legend{font-size:9px;gap:11px}}
@media(prefers-reduced-motion:reduce){.building-studio .eb-fill,.building-studio .eb-token,.pattern-builder .pb-dot,.pattern-builder .pb-current,.pattern-builder .pb-group-label{transition:none!important}}
`;

/** Manipulate an expression with genuine draggable, individually keyed tiles. */
export function mountExpressions(host) {
  let serial = 0, x = 3, tiles = [], snapshot = null, showValues = true, disposed = false;
  const make = kind => ({ id: `expression-${++serial}`, kind });
  const initial = () => { tiles = [make('x'), make('x'), make('x'), make('1'), make('1')]; x = 3; };
  initial();
  const ui = createStudio(host, {
    id: 'expression-studio', title: 'Uttrycksbyggaren',
    subtitle: 'Bygg ett uttryck. Ge x ett värde. Följ varje byggsten hela vägen till svaret.',
    tools: `${button('Spara att jämföra ◇','save')}${button('Börja om ↺','reset')}`,
    stage: `<div class="eb-stage-metrics"><span>x-block <b data-metric="a">3</b></span><span>Enheter tillsammans <b data-metric="b">2</b></span><span>Värdet på x <b data-metric="x">3</b></span></div>
      <div class="eb-label">01 / BYGG DITT UTTRYCK <span>Dra hit · klicka för att ta bort</span></div>
      <div class="eb-palette eb-mobile-palette" aria-label="Dra byggstenar till byggytan"><button class="studio-token" data-tile="x" data-source="palette" aria-label="Dra ett x-block till byggytan">${math('x')}</button><button class="studio-token unit" data-tile="1" data-source="palette" aria-label="Dra en positiv etta till byggytan">${math('+1')}</button><button class="studio-token negative" data-tile="-1" data-source="palette" aria-label="Dra en negativ etta till byggytan">${math('-1')}</button></div>
      <div class="eb-workspace studio-dropzone" data-zone="build" aria-label="Byggyta för algebraiska uttryck"></div>
      <p class="eb-build-hint">Varje x-block står för samma tal. Gula ettor är positiva, korallfärgade är negativa.</p>
      <div class="eb-value-strip"><div><span class="eb-small-label">02 / SÄTT IN VÄRDET</span><div class="studio-formula" data-expression="formula"></div></div><div><span class="eb-small-label">VÄRDE</span><output class="eb-big-value" data-expression="value">11</output></div></div>
      <div class="eb-comparison" data-expression="comparison" hidden></div>
      <div class="eb-trash studio-dropzone" data-zone="trash" aria-label="Papperskorg för byggstenar">⌫ Dra en byggsten hit för att ta bort den</div>`,
    controls: `<h3 class="eb-control-title">Byggstenar att leka med</h3><p class="eb-help">Dra till byggytan eller tryck på en byggsten. Ett tryck på en byggd bricka tar bort den.</p>
      <div class="eb-palette" aria-label="Lägg till byggsten"><button class="studio-token" data-tile="x" data-source="palette" aria-label="Lägg till ett x-block">${math('x')}</button><button class="studio-token unit" data-tile="1" data-source="palette" aria-label="Lägg till en positiv etta">${math('+1')}</button><button class="studio-token negative" data-tile="-1" data-source="palette" aria-label="Lägg till en negativ etta">${math('-1')}</button></div>
      <label class="eb-control-number" for="expression-x">Värdet på ${math('x')} <output data-control="x">3</output></label><input class="studio-range" id="expression-x" type="range" min="-5" max="10" value="3"><div class="eb-range-ends"><span>−5</span><span>10</span></div>
      <label class="eb-toggle"><input type="checkbox" data-control="show-values" checked> Visa talvärdet i varje x-block</label>
      <hr class="eb-divider"><label class="eb-control-title" for="expression-preset">Prova en start</label><select class="studio-preset" id="expression-preset"><option value="start">Tre x och två enheter</option><option value="negative">Fyra x minus tre</option><option value="empty">Tom byggyta</option></select>
      <details class="eb-challenge"><summary>✧ Utmana din byggare</summary><p data-expression="challenge"></p><label class="eb-help" for="expression-challenge">Välj uppdrag</label><select id="expression-challenge"><option value="0">Bygg värdet 17 vid x = 3</option><option value="1">Bygg värdet −7 vid x = −2</option><option value="2">Bygg värdet 20 vid x = 4</option></select><div class="eb-control-stack" style="margin-top:10px">${button('Testa mitt bygge →','check')}</div><div class="eb-feedback" data-expression="feedback" aria-live="polite"></div></details>`,
    readout: '<p class="eb-status">Lägg till en byggsten och upptäck vad som förändras.</p>',
    hint: 'Prova att spara ett uttryck, bygga ett nytt och sedan ändra x. Lika värde vid ett enda x betyder inte alltid att uttrycken är lika för alla x.'
  });
  ui.root.classList.add('building-studio', 'expression-builder');
  ui.root.insertAdjacentHTML('afterbegin', `<style>${styles}</style>`);
  const q = selector => $(selector, ui.root);
  const qa = selector => $$(selector, ui.root);
  const model = () => ({ a: tiles.filter(t => t.kind === 'x').length, b: tiles.filter(t => t.kind !== 'x').reduce((sum,t) => sum + Number(t.kind),0) });
  const status = text => { ui.live.innerHTML = `<p class="eb-status">${text}</p>`; renderMath(ui.live); };
  const tokenHTML = tile => {
    const variable = tile.kind === 'x';
    return `<button class="studio-token eb-token ${variable ? 'variable' : Number(tile.kind) < 0 ? 'unit negative' : 'unit'}" data-tile="${tile.kind}" data-existing="${tile.id}" data-key="${tile.id}" aria-label="Ta bort ${variable ? 'x-blocket' : Number(tile.kind) < 0 ? 'en negativ etta' : 'en positiv etta'}" title="Dra till papperskorgen eller tryck för att ta bort">${variable ? '<span class="eb-fill" aria-hidden="true"></span>' : ''}${math(variable ? 'x' : Number(tile.kind) > 0 ? '+1' : '-1')}${variable ? '<small data-tile-value></small>' : ''}</button>`;
  };
  function syncTiles() {
    const workspace = q('[data-zone="build"]');
    const existing = new Map(qa('[data-existing]').map(el => [el.dataset.existing, el]));
    const wanted = new Set(tiles.map(t => t.id));
    for (const [id, el] of existing) if (!wanted.has(id)) el.remove();
    for (const tile of tiles) if (!existing.has(tile.id)) workspace.insertAdjacentHTML('beforeend', tokenHTML(tile));
    let empty = $('.eb-empty', workspace);
    if (!tiles.length && !empty) workspace.insertAdjacentHTML('beforeend','<p class="eb-empty">Byggytan är tom.<br>Dra hit ett x-block eller en enhet.</p>');
    if (tiles.length && empty) empty.remove();
    renderMath(workspace);
  }
  function update({ structural = false } = {}) {
    if (disposed) return;
    if (structural) syncTiles();
    const { a, b } = model(), value = evaluateExpression(a,b,x);
    q('[data-metric="a"]').textContent = a; q('[data-metric="b"]').textContent = fmt(b); q('[data-metric="x"]').textContent = fmt(x);
    q('[data-control="x"]').textContent = fmt(x); q('#expression-x').value = x;
    q('[data-expression="formula"]').innerHTML = math(equationValue(a,b,x));
    q('[data-expression="value"]').textContent = fmt(value);
    for (const tile of qa('[data-existing][data-tile="x"]')) {
      $('.eb-fill',tile).style.height = `${Math.abs(x)*10}%`;
      tile.classList.toggle('is-negative-value',x<0);
      const label = $('[data-tile-value]',tile); label.textContent = `= ${fmt(x)}`; label.hidden = !showValues;
    }
    const comparison = q('[data-expression="comparison"]'); comparison.hidden = !snapshot;
    if (snapshot) {
      const savedValue = evaluateExpression(snapshot.a,snapshot.b,x), identical = a === snapshot.a && b === snapshot.b;
      comparison.innerHTML = `<span class="eb-small-label">SPARAT ATT JÄMFÖRA</span><div class="studio-formula">${math(`${linear(snapshot.a,snapshot.b)}=${savedValue}\\quad\\text{när }x=${x}`)}</div><p>${identical ? 'Du har byggt samma förenklade uttryck. De har lika värde för alla x.' : savedValue === value ? 'Lika just nu! Ändra x och undersök om uttrycken fortsätter ge samma värde.' : `Det sparade uttrycket ger ${fmt(savedValue)}. Ditt nya uttryck ger ${fmt(value)}. Ändra x och jämför igen.`}</p>`;
    }
    renderMath(q('[data-expression="formula"]')); if (snapshot) renderMath(comparison);
  }
  function changeTiles(mutate, message) {
    animateFlip(ui.root, '[data-existing]', () => { mutate(); update({ structural:true }); });
    if (message) status(message);
  }
  function add(kind) {
    const {a,b}=model();
    if (kind==='x' && a>=8) { status('Byggytan rymmer högst åtta x-block. Ta bort ett block för att prova ett nytt bygge.'); return; }
    if (kind!=='x' && (tiles.filter(t=>t.kind===kind).length>=8 || tiles.filter(t=>t.kind!=='x').length>=12)) { status('Använd högst åtta enhetsbrickor av varje tecken och tolv totalt. Ta bort några brickor först.'); return; }
    changeTiles(()=>tiles.push(make(kind)), kind==='x' ? 'Ett x-block till. Ändra x och följ alla block samtidigt.' : `Du lade till ${kind==='1'?'en positiv':'en negativ'} enhet. Tecknet följer brickan.`);
  }
  function remove(id) { const wasFocused=document.activeElement?.dataset.existing===id;changeTiles(()=>{tiles=tiles.filter(t=>t.id!==id);},'En byggsten är borttagen. Hur ändrades uttrycket och dess värde?');if(wasFocused)(qa('[data-existing]')[0]||qa('[data-source="palette"]').find(el=>el.getClientRects().length))?.focus({preventScroll:true}); }
  const disposeDrag = dragTiles(ui.root, {
    tileSelector:'[data-tile]', zoneSelector:'[data-zone]',
    onDrop(tile,zone) {
      if (tile.dataset.source==='palette' && zone.dataset.zone==='build') add(tile.dataset.tile);
      else if (tile.dataset.existing && zone.dataset.zone==='trash') remove(tile.dataset.existing);
      else if (tile.dataset.existing && zone.dataset.zone==='build') status('Byggstenen är kvar i uttrycket. Dra den till papperskorgen om du vill ta bort den.');
    },
    onTap(tile) { if(tile.dataset.existing)remove(tile.dataset.existing);else add(tile.dataset.tile); }
  });
  q('#expression-x').addEventListener('input',event=>{x=Number(event.target.value);update();});
  q('[data-control="show-values"]').addEventListener('change',event=>{showValues=event.target.checked;update();});
  q('#expression-preset').addEventListener('change',event=>{
    changeTiles(()=>{const key=event.target.value;tiles=key==='empty'?[]:Array.from({length:key==='negative'?4:3},()=>make('x')).concat(Array.from({length:key==='negative'?3:2},()=>make(key==='negative'?'-1':'1')));},'Ett nytt startbygge är klart. Dra, ändra x och undersök.');
    q('[data-expression="feedback"]').textContent='';
  });
  const challenges=[{x:3,target:17,min:2},{x:-2,target:-7,min:2},{x:4,target:20,min:1}];
  let challenge=0;
  function setChallenge() {const c=challenges[challenge];q('[data-expression="challenge"]').innerHTML=`Bygg ett uttryck med minst ${c.min} x-block som ger ${math(String(c.target))} när ${math(`x=${c.x}`)}. Det finns flera möjliga byggen.`;renderMath(q('[data-expression="challenge"]'));}
  q('#expression-challenge').addEventListener('change',event=>{challenge=Number(event.target.value);x=challenges[challenge].x;setChallenge();update();q('[data-expression="feedback"]').textContent='';});
  ui.root.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;
    if(action==='save'){snapshot={...model()};update();status('Uttrycket är sparat. Bygg ett annat och jämför vid samma x.');}
    if(action==='reset'){snapshot=null;initial();q('#expression-preset').value='start';q('[data-expression="feedback"]').textContent='';changeTiles(()=>{},'Tillbaka till tre x-block och två enheter.');}
    if(action==='check'){
      const c=challenges[challenge],{a,b}=model(),value=evaluateExpression(a,b,c.x),ok=a>=c.min&&value===c.target,feedback=q('[data-expression="feedback"]');
      x=c.x;update();feedback.classList.toggle('is-wrong',!ok);feedback.innerHTML=ok?`Precis! ${math(equationValue(a,b,c.x))}. Kan du bygga ett annat uttryck som också fungerar?`:`Ditt bygge ger ${math(String(value))} när ${math(`x=${c.x}`)}. Målet är ${math(String(c.target))} med minst ${c.min} x-block. Prova att ändra antal block eller enheter.`;renderMath(feedback);
    }
  });
  ui.root.addEventListener('keydown',event=>{const tile=event.target.closest('[data-existing]');if(tile&&(event.key==='Delete'||event.key==='Backspace')){event.preventDefault();remove(tile.dataset.existing);}});
  setChallenge();update({structural:true});renderMath(ui.root);
  return ()=>{disposed=true;disposeDrag();ui.destroy();};
}

/** A pattern model in which fixed and repeated parts are built independently. */
export function mountPatterns(host) {
  let step=3,base=2,n=3,snapshot=null,running=false,speed=1,frame=0,last=0,elapsed=0,disposed=false,zoomed=false;
  const dots = Array.from({length:10},(_,column)=>`<g data-pattern-group="${column+1}">${Array.from({length:5},(_,row)=>`<circle class="pb-dot" data-pattern-dot="${row+1}" cx="${100+column*48}" cy="${48+row*31}" r="8.5" fill="#57dbb7"/>`).join('')}<text class="pb-group-label" data-pattern-label="${column+1}" x="${100+column*48}" y="224" text-anchor="middle">${column+1}</text></g>`).join('');
  const fixed=Array.from({length:5},(_,row)=>`<circle class="pb-dot" data-pattern-fixed="${row+1}" cx="32" cy="${48+row*31}" r="8.5" fill="#e5b866"/>`).join('');
  const ui=createStudio(host,{
    id:'pattern-studio',title:'Mönsterbyggaren',subtitle:'Bygg det som växer och det som är fast. Följ samma mönster genom bild, tabell och regel.',
    tools:`${button('Spara att jämföra ◇','save')}${button('Börja om ↺','reset')}`,
    stage:`<div class="eb-label">01 / ETT MÖNSTER SOM DU STYR <span data-pattern="figure-label">Figur 3</span></div>
      <div class="pb-equation studio-formula" data-pattern="formula"></div>
      <div class="pb-camera-tools">${button('Närbild +','zoom','aria-pressed="false"')}</div>
      <svg class="studio-svg pb-svg" viewBox="0 0 620 250" role="img" aria-label="Mönster med en fast gul grupp och växande mintgröna grupper" data-pattern="svg"><defs><pattern id="pb-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#9bbaa6" opacity=".13"/></pattern></defs><rect width="620" height="250" fill="url(#pb-grid)"/><path d="M67 24V196" stroke="#ffffff18" stroke-dasharray="3 5"/><rect class="pb-current" x="80" y="25" width="40" height="177" rx="11" data-pattern="current"/>${fixed}${dots}</svg>
      <div class="pb-legend"><span><i></i>En grupp för varje figurnummer</span><span><i></i>Fast del</span></div>
      <div class="eb-palette eb-mobile-palette" aria-label="Dra prickar till mönsterregelns delar"><button class="studio-token" data-tile="growth" data-source="palette" aria-label="Dra en prick till den växande gruppen">${math('+n')}</button><button class="studio-token unit" data-tile="fixed" data-source="palette" aria-label="Dra en prick till den fasta delen">${math('+1')}</button></div>
      <div class="pb-construction"><div class="pb-part studio-dropzone" data-zone="growth"><h3>02 / VÄXANDE GRUPP</h3><div class="pb-part-tiles" data-pattern="growth-tiles"></div></div><div class="pb-part fixed studio-dropzone" data-zone="fixed"><h3>03 / FAST DEL</h3><div class="pb-part-tiles" data-pattern="fixed-tiles"></div></div></div>
      <div class="pb-readout"><span>Figur <b data-pattern="n">3</b> innehåller</span><strong data-pattern="count">11</strong><span>prickar</span></div>
      <div class="eb-comparison" data-pattern="comparison" hidden></div>
      <div class="eb-trash studio-dropzone" data-zone="trash" aria-label="Ta bort en byggsten ur mönsterregeln">⌫ Dra hit en byggd prick för att ta bort den</div>`,
    controls:`<h3 class="eb-control-title">Bygg din regel</h3><p class="eb-help">Dra en prick till rätt del. Eller tryck för att lägga till. Tryck på en byggd prick för att ta bort den.</p>
      <div class="eb-palette"><button class="studio-token" data-tile="growth" data-source="palette" aria-label="Lägg till en prick i den växande gruppen">${math('+n')}</button><button class="studio-token unit" data-tile="fixed" data-source="palette" aria-label="Lägg till en prick i den fasta delen">${math('+1')}</button></div>
      <label class="eb-control-number" for="pattern-n">Figurnummer ${math('n')} <output data-control="n">3</output></label><input class="studio-range" id="pattern-n" type="range" min="1" max="10" value="3"><div class="eb-range-ends"><span>1</span><span>10</span></div>
      <div class="pb-play-row">${button('Spela mönstret ▷','play','aria-pressed="false"')}<label><span class="sr-only">Animationshastighet</span><select aria-label="Animationshastighet" data-control="speed"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label></div>
      <p class="pb-controls-note">Pausa när du vill undersöka en figur. Mönstret börjar om efter figur 10.</p>
      <table class="pb-table" aria-label="Värdetabell för ditt mönster"><thead><tr><th scope="col">Figur</th><th scope="col">1</th><th scope="col">2</th><th scope="col">3</th><th scope="col">10</th><th scope="col">20</th></tr></thead><tbody><tr data-pattern="table"><th scope="row">Antal</th></tr></tbody></table>
      <details class="eb-challenge"><summary>✧ Hitta den hemliga regeln</summary><p data-pattern="challenge"></p><label class="eb-help" for="pattern-challenge">Välj uppdrag</label><select id="pattern-challenge"><option value="0">Figur 1: 5 · Figur 4: 17</option><option value="1">Figur 1: 5 · Figur 4: 11</option><option value="2">Figur 1: 5 · Figur 6: 10</option></select><div class="eb-control-stack" style="margin-top:10px">${button('Pröva min regel →','check')}${button('Visa en ledtråd','hint')}</div><div class="eb-feedback" data-pattern="feedback" aria-live="polite"></div></details>`,
    readout:'<p class="eb-status">Varje mintgrön kolumn är en kopia av din växande grupp. Gult ändras inte när n ändras.</p>',
    hint:'Figurnumret räknar grupper, inte prickar. Spara en regel och bygg en annan för att jämföra vid samma figurnummer.'
  });
  ui.root.classList.add('building-studio','pattern-builder');ui.root.insertAdjacentHTML('afterbegin',`<style>${styles}</style>`);
  const q=selector=>$(selector,ui.root),qa=selector=>$$(selector,ui.root);
  const status=text=>{ui.live.innerHTML=`<p class="eb-status">${text}</p>`;renderMath(ui.live);};
  function syncParts(){
    for(const [kind,count] of [['growth',step],['fixed',base]]){
      const zone=q(`[data-pattern="${kind}-tiles"]`),current=new Map([...zone.querySelectorAll('[data-existing]')].map(el=>[Number(el.dataset.position),el]));
      for(const [i,el]of current)if(i>=count)el.remove();
      for(let i=0;i<count;i++)if(!current.has(i))zone.insertAdjacentHTML('beforeend',`<button class="studio-token ${kind==='fixed'?'unit':''}" data-tile="${kind}" data-existing="${kind}-${i}" data-position="${i}" data-key="${kind}-${i}" aria-label="Ta bort en prick från ${kind==='fixed'?'fasta delen':'växande gruppen'}">${math('1')}</button>`);
      const empty=$('.pb-none',zone);if(count===0&&!empty)zone.insertAdjacentHTML('beforeend','<span class="pb-none">Ingen prick ännu · dra hit</span>');if(count>0&&empty)empty.remove();renderMath(zone);
    }
  }
  function update({structural=false}={}){
    if(disposed)return;if(structural)syncParts();
    q('[data-pattern="figure-label"]').textContent=`Figur ${n}`;q('[data-pattern="n"]').textContent=n;q('[data-control="n"]').textContent=n;q('#pattern-n').value=n;q('[data-pattern="count"]').textContent=patternCount(n,step,base);
    q('[data-pattern="formula"]').innerHTML=math(`P(n)=${linear(step,base,'n')}\\quad\\Rightarrow\\quad P(${n})=${patternCount(n,step,base)}`);renderMath(q('[data-pattern="formula"]'));
    for(const group of qa('[data-pattern-group]')){const visible=Number(group.dataset.patternGroup)<=n;for(const dot of group.querySelectorAll('[data-pattern-dot]'))dot.classList.toggle('is-hidden',!visible||Number(dot.dataset.patternDot)>step);group.querySelector('[data-pattern-label]').classList.toggle('is-hidden',!visible);}
    for(const dot of qa('[data-pattern-fixed]'))dot.classList.toggle('is-hidden',Number(dot.dataset.patternFixed)>base);
    q('[data-pattern="current"]').setAttribute('x',String(80+(n-1)*48));q('[data-pattern="current"]').setAttribute('opacity',step?'.9':'.25');
    const viewWidth=zoomed?Math.max(250,Math.min(620,126+n*48)):620;q('[data-pattern="svg"]').setAttribute('viewBox',`0 0 ${viewWidth} 250`);q('[data-pattern="svg"]').style.aspectRatio=`${viewWidth} / 250`;q('[data-pattern="svg"]').setAttribute('aria-label',`Figur ${n}: ${base} fasta prickar och ${n} grupper med ${step} prickar; totalt ${patternCount(n,step,base)} prickar.`);
    q('[data-pattern="table"]').innerHTML='<th scope="row">Antal</th>'+[1,2,3,10,20].map(k=>`<td${k===n?' class="current"':''}>${patternCount(k,step,base)}</td>`).join('');
    const comparison=q('[data-pattern="comparison"]');comparison.hidden=!snapshot;if(snapshot){const saved=patternCount(n,snapshot.step,snapshot.base),value=patternCount(n,step,base);comparison.innerHTML=`<span class="eb-small-label">SPARAD REGEL VID SAMMA FIGURNUMMER</span><div class="studio-formula">${math(`Q(n)=${linear(snapshot.step,snapshot.base,'n')}\\quad Q(${n})=${saved}`)}</div><p>${snapshot.step===step&&snapshot.base===base?'Samma regel ger samma antal i varje figur.':saved===value?'Reglerna ger samma antal i just den här figuren. Prova ett annat n.':`Din nya figur har ${value} prickar. Den sparade regeln ger ${saved}.`}</p>`;renderMath(comparison);}
    const play=q('[data-action="play"]');play.textContent=running?'Pausa mönstret Ⅱ':'Spela mönstret ▷';play.setAttribute('aria-pressed',String(running));
  }
  function changePart(kind,delta){
    const focusedKey=document.activeElement?.dataset.existing;const old=kind==='growth'?step:base,next=clamp(old+delta,0,5);
    if(next===old){status(delta>0?'Varje del får ha högst fem prickar. Ta bort en prick för att prova något annat.':'Den här delen är redan tom.');return;}
    animateFlip(ui.root,'[data-existing]',()=>{if(kind==='growth')step=next;else base=next;update({structural:true});});
    if(focusedKey&&!q(`[data-existing="${focusedKey}"]`))qa(`[data-source="palette"][data-tile="${kind}"]`).find(el=>el.getClientRects().length)?.focus({preventScroll:true});
    status(kind==='growth'?`Den växande gruppen har nu ${step} prickar. Hur ändras skillnaden mellan två figurer?`:`Den fasta delen har nu ${base} prickar. Jämför flera figurnummer.`);
  }
  const disposeDrag=dragTiles(ui.root,{tileSelector:'[data-tile]',zoneSelector:'[data-zone]',onDrop(tile,zone){const kind=tile.dataset.tile;if(tile.dataset.source==='palette'){if(zone.dataset.zone===kind)changePart(kind,1);else if(zone.dataset.zone!=='trash')status('Lägg mintgrönt i den växande gruppen och gult i den fasta delen.');}else if(zone.dataset.zone==='trash')changePart(kind,-1);},onTap(tile){changePart(tile.dataset.tile,tile.dataset.existing?-1:1);}});
  function pause(){running=false;cancelAnimationFrame(frame);frame=0;last=0;elapsed=0;update();}
  function tick(time){
    if(!running||disposed)return;
    if(!last)last=time;const delta=Math.min(time-last,150);last=time;
    if(document.visibilityState!=='hidden')elapsed+=delta;
    if(elapsed>=1400/speed){elapsed=0;n=n===10?1:n+1;update();}
    frame=requestAnimationFrame(tick);
  }
  const motionObserver=new MutationObserver(()=>{if(running&&reducedMotion()){pause();status('Mönstret är pausat eftersom du valde mindre rörelser. Du kan fortfarande byta figur med reglaget.');}});motionObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  q('#pattern-n').addEventListener('input',event=>{n=Number(event.target.value);elapsed=0;update();});
  q('[data-control="speed"]').addEventListener('change',event=>{speed=Number(event.target.value);elapsed=0;});
  const tasks=[{step:4,base:1,lastN:4},{step:2,base:3,lastN:4},{step:1,base:4,lastN:6}];let task=0;
  function challenge(){const t=tasks[task];q('[data-pattern="challenge"]').innerHTML=`Figur 1 har ${math(String(patternCount(1,t.step,t.base)))} prickar. Figur ${t.lastN} har ${math(String(patternCount(t.lastN,t.step,t.base)))}. Bygg en växande grupp och en fast del som stämmer med båda.`;renderMath(q('[data-pattern="challenge"]'));}
  q('#pattern-challenge').addEventListener('change',event=>{task=Number(event.target.value);q('[data-pattern="feedback"]').textContent='';challenge();});
  ui.root.addEventListener('click',event=>{const control=event.target.closest('[data-action]');const action=control?.dataset.action;if(!action)return;
    if(action==='play'){if(running)pause();else{running=true;last=0;elapsed=0;update();frame=requestAnimationFrame(tick);status(reducedMotion()?'Mönstret växlar figurer. Större rörelser är avstängda.':'Följ en figur i taget. Pausa för att bygga om eller undersöka en regel.');}}
    if(action==='save'){snapshot={step,base};update();status('Regeln är sparad. Bygg om och jämför båda mönstren vid samma n.');}
    if(action==='reset'){pause();step=3;base=2;n=3;snapshot=null;q('[data-pattern="feedback"]').textContent='';update({structural:true});status('Startmönstret är tillbaka: tre per grupp och två fasta prickar.');}
    if(action==='zoom'){zoomed=!zoomed;control.textContent=zoomed?'Hela bilden −':'Närbild +';control.setAttribute('aria-pressed',String(zoomed));update();}
    if(action==='hint'){const t=tasks[task],first=patternCount(1,t.step,t.base),lastCount=patternCount(t.lastN,t.step,t.base);q('[data-pattern="feedback"]').classList.remove('is-wrong');q('[data-pattern="feedback"]').innerHTML=`Mellan figur 1 och ${t.lastN} finns ${t.lastN-1} steg. ${math(`\\text{ökning per steg}=\\frac{${lastCount}-${first}}{${t.lastN}-1}`)}. Vad måste sedan vara kvar som fast del?`;renderMath(q('[data-pattern="feedback"]'));}
    if(action==='check'){const t=tasks[task],ok=step===t.step&&base===t.base,feedback=q('[data-pattern="feedback"]');feedback.classList.toggle('is-wrong',!ok);feedback.innerHTML=ok?`Det stämmer! ${math(`P(n)=${linear(step,base,'n')}`)} passar båda figurerna. Testa också figur 20.`:`Din regel ger ${math(`P(1)=${patternCount(1,step,base)}`)} och ${math(`P(${t.lastN})=${patternCount(t.lastN,step,base)}`)}. Jämför med uppdraget och bygg om en del i taget.`;renderMath(feedback);}
  });
  ui.root.addEventListener('keydown',event=>{const tile=event.target.closest('[data-existing]');if(tile&&(event.key==='Delete'||event.key==='Backspace')){event.preventDefault();changePart(tile.dataset.tile,-1);}});
  challenge();update({structural:true});renderMath(ui.root);
  return()=>{disposed=true;running=false;cancelAnimationFrame(frame);motionObserver.disconnect();disposeDrag();ui.destroy();};
}
