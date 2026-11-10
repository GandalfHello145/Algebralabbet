import {math, renderMath, createStudio, dragTiles, reducedMotion} from './lab-kit.js?v=studio-2';

// Exact rational arithmetic keeps every displayed operation mathematically reversible.
const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b]}return a||1n;};
export function rational(value,denominator=1){
 if(value&&typeof value==='object'&&'n'in value)return rational(value.n,value.d);
 if(typeof value==='string'&&value.includes('/')){const parts=value.split('/');if(parts.length!==2)throw new TypeError('Skriv ett tal eller ett bråk.');return divide(rational(parts[0]),rational(parts[1]));}
 let n,d;
 if(typeof value==='number'&&!Number.isFinite(value))throw new TypeError('Talet måste vara ändligt.');
 const text=String(value).trim().replace(',','.').replace('−','-');
 if(!/^[+-]?\d+(?:\.\d+)?$/.test(text))throw new TypeError('Skriv ett tal eller ett bråk.');
 if(text.includes('.')){const [whole,fraction]=text.split('.');n=BigInt(whole+fraction);d=10n**BigInt(fraction.length);}else{n=BigInt(text);d=1n;}
 const den=BigInt(denominator);if(den===0n)throw new RangeError('Division med noll är inte tillåten.');d*=den;
 if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return Object.freeze({n:n/g,d:d/g});
}
const add=(a,b)=>{a=rational(a);b=rational(b);return rational(a.n*b.d+b.n*a.d,a.d*b.d);};
const multiply=(a,b)=>{a=rational(a);b=rational(b);return rational(a.n*b.n,a.d*b.d);};
const divide=(a,b)=>{a=rational(a);b=rational(b);if(b.n===0n)throw new RangeError('Division med noll är inte tillåten.');return rational(a.n*b.d,a.d*b.n);};
const neg=a=>multiply(a,-1);
const equal=(a,b)=>{a=rational(a);b=rational(b);return a.n===b.n&&a.d===b.d;};
const numeric=a=>Number(a.n)/Number(a.d);
export const fractionTex=a=>{a=rational(a);return a.d===1n?String(a.n):`${a.n<0n?'-':''}\\frac{${a.n<0n?-a.n:a.n}}{${a.d}}`;};
export const makeEquation=(a,b,c,d)=>[a,b,c,d].map(x=>rational(x));
export function applyEquationOperation(equation,operation){
 const e=equation.map(x=>rational(x));
 if(operation.kind==='add'){const x=rational(operation.x??0),unit=rational(operation.constant??0);return [add(e[0],x),add(e[1],unit),add(e[2],x),add(e[3],unit)];}
 if(operation.kind==='divide'){const divisor=rational(operation.divisor);return e.map(v=>divide(v,divisor));}
 if(operation.kind==='multiply'){const factor=rational(operation.factor);if(factor.n===0n)throw new RangeError('Multiplikation med noll bevarar inte lösningarna.');return e.map(v=>multiply(v,factor));}
 throw new TypeError('Okänd operation.');
}
export function solveEquation(e){
 const slope=add(e[0],neg(e[2])),constant=add(e[3],neg(e[1]));
 if(slope.n===0n)return {kind:constant.n===0n?'all':'none'};
 return {kind:'unique',value:divide(constant,slope)};
}
export function evaluateEquation(e,x){x=rational(x);return {left:add(multiply(e[0],x),e[1]),right:add(multiply(e[2],x),e[3])};}
function sideTex(a,b){
 const x=a.n===0n?'':`${a.n<0n?'-':''}${equal(a,1)||equal(a,-1)?'':fractionTex(a.n<0n?neg(a):a)}x`;
 if(b.n===0n)return x||'0';return x?x+(b.n<0n?'-':'+')+fractionTex(b.n<0n?neg(b):b):fractionTex(b);
}
const equationTex=e=>sideTex(e[0],e[1])+'='+sideTex(e[2],e[3]);
const inBounds=e=>e.every(v=>v.d<=100000n&&v.n<=1000000n&&v.n>=-1000000n);
const styles=`
.equation-studio [hidden]{display:none!important}.equation-studio .eq-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;width:100%}.equation-studio .eq-tools .eq-spacer{flex:1}.equation-studio .eq-mode{display:flex;gap:4px;padding:4px;border:1px solid #d7e3d6;border-radius:9px;background:#edf4e9}.equation-studio .eq-mode button{padding:9px 12px;border-radius:6px;background:transparent;color:#57745d;font-size:11px;min-height:38px}.equation-studio .eq-mode button[aria-pressed=true]{background:#fff;color:#245e48;box-shadow:0 2px 6px #17322312}.equation-studio .eq-stage-title{font-size:9px;color:#8cae9e;letter-spacing:1.4px;display:flex;justify-content:space-between;gap:10px;margin:0 0 15px}.equation-studio .eq-original{color:#91ad9e;font-size:11px;text-align:center;line-height:2;overflow-x:auto}.equation-studio .eq-main-formula{font-size:26px;text-align:center;overflow-x:auto;padding:8px 2px 13px;min-height:59px}.equation-studio .eq-visual{position:relative;min-height:246px;margin-top:5px}.equation-studio .eq-scale{position:absolute;inset:0;width:100%;height:246px;pointer-events:none}.equation-studio .eq-beam{transform-origin:320px 180px;transition:transform .75s cubic-bezier(.18,1.6,.4,1)}.equation-studio .eq-pans{display:grid;grid-template-columns:minmax(0,1fr) 34px minmax(0,1fr);gap:12px;padding:22px 8px 0;align-items:start;position:relative;z-index:1}.equation-studio .eq-pan{border:1px solid #57dbb761;border-bottom:3px solid #57dbb7;border-radius:14px;background:linear-gradient(160deg,#183a3e,#162c37);padding:14px 10px;text-align:center;min-height:121px;transform:translateY(var(--offset,0px));transition:transform .75s cubic-bezier(.18,1.6,.4,1),box-shadow .4s;position:relative}.equation-studio .eq-pan.right{border-color:#e5b86666;border-bottom-color:#e5b866;background:linear-gradient(160deg,#37372f,#26302f)}.equation-studio .eq-pan-label{color:#91b4a5;font-size:8px;letter-spacing:1.3px;margin-bottom:12px}.equation-studio .right .eq-pan-label{color:#c0b38b}.equation-studio .eq-pan-symbols{display:flex;justify-content:center;align-items:center;gap:7px;min-height:38px;flex-wrap:wrap}.equation-studio .eq-symbol{display:inline-block;background:#57dbb714;border:1px solid #57dbb75c;padding:7px 11px;border-radius:7px;color:#57dbb7;font-size:18px}.equation-studio .eq-symbol.unit{color:#e5b866;border-color:#e5b86665;background:#e5b86610}.equation-studio .eq-symbol.negative{border-style:dashed;color:#eda292}.equation-studio .eq-equals{color:#9eb9a9;text-align:center;font-size:26px;padding-top:55px}.equation-studio .eq-evaluated{font-size:13px;color:#d4e7da;margin-top:12px;min-height:25px}.equation-studio .eq-operation-flash{position:absolute;left:50%;top:-16px;transform:translateX(-50%);background:#d7f7e8;color:#184333;border:1px solid #8bcbb2;font-size:13px;padding:5px 10px;border-radius:20px;z-index:4;box-shadow:0 4px 18px #06190c33}.equation-studio .eq-operation-zone{border:1px dashed #70ae964d;background:#57dbb707;border-radius:11px;min-height:65px;text-align:center;padding:15px 10px;color:#a7c9b7;position:relative;z-index:1;font-size:11px}.equation-studio .eq-operation-zone strong{display:block;color:#d8e9df;margin-bottom:5px;font-size:12px}.equation-studio .eq-cards{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin:14px 0 8px}.equation-studio .eq-card{min-width:51px;min-height:48px;font-size:17px;padding:8px 12px;touch-action:none}.equation-studio .eq-card.recommended{border-color:#e5b866;color:#e5b866;background:#e5b86612}.equation-studio .eq-card small{display:block;font:8px/1.5 -apple-system,sans-serif;color:#a4c1b0;max-width:130px;margin-top:3px}.equation-studio .eq-note{color:#89aa99;font-size:10px;line-height:1.8;text-align:center;margin:11px 0 0}.equation-studio .eq-control-label{display:block;font-size:11px;font-weight:600;margin:16px 0 7px;color:#46694e}.equation-studio select,.equation-studio .eq-number,.equation-studio .eq-guess{width:100%;background:#f9fbf7;border:1px solid #cfddcb;border-radius:7px;color:#244931;padding:10px;font:inherit;font-size:12px;min-height:42px}.equation-studio .eq-range-label{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin:18px 0 9px;color:#345f44}.equation-studio .eq-range-label output{padding:4px 9px;background:#e6f0e1;border-radius:6px}.equation-studio input[type=range]{width:100%;accent-color:#398664;height:24px}.equation-studio .eq-feedback{padding:12px 13px;border-radius:8px;background:#e9f2e4;color:#365f3f;font-size:11px;line-height:1.9;margin-top:13px;min-height:44px}.equation-studio .eq-feedback.error{background:#faeee7;color:#87543f}.equation-studio .eq-feedback:empty{display:none}.equation-studio .eq-history{margin:12px 0 0;padding:0;list-style:none;max-height:192px;overflow-y:auto;font-size:11px;color:#56715a}.equation-studio .eq-history li{padding:10px 0;border-top:1px solid #dfe8da;line-height:1.7}.equation-studio .eq-history small{display:block;color:#6b8066;margin-bottom:4px}.equation-studio .eq-builder-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.equation-studio .eq-builder-grid label{font-size:10px;color:#567750;line-height:1.7}.equation-studio .eq-builder-grid input{margin-top:4px}.equation-studio .eq-targets{display:flex;gap:6px;margin:12px 0}.equation-studio .eq-targets button{flex:1;min-height:42px;font-size:10px;padding:7px;border:1px solid #cadbc5;background:#f9fbf7;color:#486e4c;border-radius:7px}.equation-studio .eq-targets button[aria-pressed=true]{background:#d8ebd0;border-color:#6d9b65;color:#285b34}.equation-studio .eq-type{font-size:10px;line-height:1.8;padding:9px 12px;margin-top:12px;border:1px solid #d9e5d3;border-radius:7px;color:#55704e}.equation-studio .eq-build-hint{font-size:10px;color:#bfd1c4;line-height:1.8;text-align:center;margin:10px}.equation-studio .eq-builder-palette{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}.equation-studio .eq-pan.is-over{box-shadow:0 0 0 3px #8ae3bd55,0 0 35px #57dbb733}.equation-studio .eq-bottom-tools{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.equation-studio .eq-bottom-tools button{flex:1;min-height:42px}.equation-studio .eq-control-divider{border:0;border-top:1px solid #dce6d7;margin:18px 0}.equation-studio .studio-live .katex{font-size:1.05em}.equation-studio .eq-action-hint{display:block;font-size:9px;color:#6f8867;margin-top:5px}.equation-studio .eq-empty{font-size:25px;color:#8baa9a}.equation-studio .eq-builder-action{width:100%;margin-top:10px;min-height:42px}.equation-studio .eq-ghost-label{font-size:9px;letter-spacing:.6px;color:#7b9a88}.equation-studio .eq-tip-tex{overflow-x:auto;padding:5px 0}.reduce-motion .equation-studio .eq-beam,.reduce-motion .equation-studio .eq-pan{transition:none!important}@media(prefers-reduced-motion:reduce){.equation-studio .eq-beam,.equation-studio .eq-pan{transition:none!important}}@media(max-width:650px){.equation-studio .eq-main-formula{font-size:22px}.equation-studio .eq-pans{gap:6px;grid-template-columns:minmax(0,1fr) 24px minmax(0,1fr);padding-left:0;padding-right:0}.equation-studio .eq-pan{padding:13px 6px;min-height:122px}.equation-studio .eq-symbol{font-size:15px;padding:7px}.equation-studio .eq-pan-label{font-size:7px;letter-spacing:1px}.equation-studio .eq-card{min-width:47px;padding:8px 10px}.equation-studio .eq-tools .eq-spacer{display:none}.equation-studio .eq-mode{flex:1}.equation-studio .eq-mode button{flex:1;padding:8px;font-size:10px}.equation-studio .eq-tools>button{font-size:10px}.equation-studio .eq-number,.equation-studio .eq-guess{font-size:16px}.equation-studio .eq-stage-title{font-size:8px}.equation-studio .eq-pan-symbols{gap:4px}.equation-studio .eq-pan .katex{font-size:1em}.equation-studio .eq-feedback{font-size:12px}}
`;

export function mountEquations(host,{bothSides=false}={}){
 const presets=bothSides?[
  {label:'En lösning · 4x + 2 = 2x + 12',v:[4,2,2,12]},
  {label:'Ingen lösning · 2x + 4 = 2x + 7',v:[2,4,2,7]},
  {label:'Alla x · 2x + 4 = 2x + 4',v:[2,4,2,4]},
  {label:'Negativa termer · 3x + 8 = 5x + 2',v:[3,8,5,2]}
 ]:[
  {label:'Tre lika grupper · 3x + 4 = 19',v:[3,4,0,19]},
  {label:'Kom igång · x + 7 = 12',v:[1,7,0,12]},
  {label:'En halv lösning · 2x + 1 = 8',v:[2,1,0,8]}
 ];
 let original=makeEquation(...presets[0].v),eq=[...original],trial=rational(2),mode='solve',target='left',history=[],challengeIndex=0,disposed=false;
 const animations=new Set();
 const studio=createStudio(host,{
  id:bothSides?'eq-both-studio':'eq-balance-studio',
  title:bothSides?'Två sidor, ett x.':'Balanslabbet.',
  subtitle:'Dra, bygg och pröva. Se samma operation ske i båda leden.',
  tools:`<div class="eq-tools"><div class="eq-mode" aria-label="Välj arbetssätt"><button data-mode="solve" aria-pressed="true">↔ Lös ekvationen</button><button data-mode="build" aria-pressed="false">＋ Bygg en egen</button></div><span class="eq-spacer"></span><button class="studio-button" data-action="undo">Ångra ↶</button><button class="studio-button" data-action="reset">Börja om ↺</button></div>`,
  stage:`<style>${styles}</style><div class="eq-stage-title"><span>01 / SAMMA VÄRDE PÅ BÅDA SIDOR</span><span data-mode-label>PRÖVA & FÖRÄNDRA</span></div><div class="eq-original" data-original></div><div class="eq-main-formula" data-equation></div><div class="eq-visual"><svg class="eq-scale" viewBox="0 0 640 260" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${bothSides?'eb':'es'}-beam"><stop stop-color="#57dbb7"/><stop offset="1" stop-color="#e5b866"/></linearGradient></defs><ellipse cx="320" cy="250" rx="114" ry="7" fill="#6db091" opacity=".08"/><path d="M291 244L320 192L349 244Z" fill="#335b50" stroke="#6f9f88" stroke-width="1.5"/><circle cx="320" cy="180" r="7" fill="#b2d4bf"/><g class="eq-beam" data-beam><path d="M120 180H520" stroke="url(#${bothSides?'eb':'es'}-beam)" stroke-width="4" stroke-linecap="round"/><path d="M120 173V187M520 173V187" stroke="#7da08f" stroke-width="2"/></g></svg><div class="eq-pans"><div class="eq-pan studio-dropzone" data-zone="left"><div class="eq-pan-label">VÄNSTERLED</div><div class="eq-pan-symbols" data-left-symbols></div><div class="eq-evaluated" data-left-value></div></div><div class="eq-equals" data-equals>≠</div><div class="eq-pan right studio-dropzone" data-zone="right"><div class="eq-pan-label">HÖGERLED</div><div class="eq-pan-symbols" data-right-symbols></div><div class="eq-evaluated" data-right-value></div></div></div></div><div data-solving><div class="eq-operation-zone studio-dropzone" data-zone="operation"><strong>↔ Släpp en operation här</strong>Samma kort används i båda leden samtidigt.</div><div class="eq-cards" data-operations></div><p class="eq-note">Dra ett kort till mitten, eller klicka på det. Balansen jämför talvärden — negativa termer är algebraiska symboler.</p></div><div data-building hidden><p class="eq-build-hint">Dra en bricka till vänster eller höger led. Vid klick används den sida du valt i panelen.</p><div class="eq-builder-palette">${[['x',1,'x'],['x',-1,'-x'],['unit',1,'+1'],['unit',-1,'-1']].map(([variable,amount,label])=>`<button type="button" class="studio-token eq-card ${variable==='unit'?'unit':''} ${amount<0?'negative':''}" data-tile="build-${variable}-${amount}" data-kind="build" data-variable="${variable}" data-amount="${amount}" aria-label="Lägg till ${label} på vald sida">${math(label)}</button>`).join('')}</div></div>`,
  controls:`<h3>Välj ett experiment</h3><label class="eq-control-label" for="${bothSides?'eb':'es'}-preset">Startekvation</label><select id="${bothSides?'eb':'es'}-preset" data-preset>${presets.map((p,i)=>`<option value="${i}">${p.label}</option>`).join('')}<option value="custom">Egen ekvation / utmaning</option></select><label class="eq-range-label" for="${bothSides?'eb':'es'}-trial"><span>Pröva värdet på x</span><output data-trial-output>2</output></label><input id="${bothSides?'eb':'es'}-trial" type="range" min="-6" max="10" step="0.5" value="2" data-trial aria-label="Pröva värdet på x"><label class="eq-control-label" for="${bothSides?'eb':'es'}-guess">Eller skriv ett exakt värde</label><input id="${bothSides?'eb':'es'}-guess" class="eq-guess" data-guess value="2" inputmode="decimal" aria-label="Exakt värde på x" placeholder="Till exempel 5 eller 3/2"><button class="studio-button eq-builder-action" data-action="check">Kontrollera mitt värde →</button><div class="eq-type" data-type></div><div data-build-controls hidden><hr class="eq-control-divider"><h3>Bygg din ekvation</h3><div class="eq-targets" aria-label="Sida för klickade byggbrickor"><button data-target="left" aria-pressed="true">Vänster led</button><button data-target="right" aria-pressed="false">Höger led</button></div><div class="eq-builder-grid">${[['a','x i vänster led',-8,8],['b','Tal i vänster led',-30,30],['c','x i höger led',-8,8],['d','Tal i höger led',-30,30]].map(([key,label,min,max])=>`<label>${label}<input class="eq-number" type="number" step="1" min="${min}" max="${max}" data-coefficient="${key}" aria-label="${label}"></label>`).join('')}</div><button class="studio-button eq-builder-action" data-action="clear-side">Töm vald sida</button></div><hr class="eq-control-divider"><h3>Gör en upptäckt</h3><p class="studio-note" data-challenge>Gör x ensamt och kontrollera sedan ditt värde i startekvationen.</p><div class="eq-bottom-tools"><button class="studio-button" data-action="hint">Nästa idé ✧</button><button class="studio-button" data-action="challenge">Nytt uppdrag</button></div><div class="eq-feedback" data-feedback role="status" aria-live="polite"></div><ol class="eq-history" data-history aria-label="Dina ekvationssteg"></ol>`,
  readout:'Pröva ett x-värde. Dra sedan ett operationskort till mitten.',
  hint:`<strong>Varför fungerar det?</strong><p>En ekvation säger att två uttryck har samma värde. Samma addition, subtraktion eller division med ett tal som inte är noll bevarar lösningarna.</p><div class="eq-tip-tex">${math('A=B\\quad\\Longrightarrow\\quad A-k=B-k')}</div>`
 });
 const {root,stage,live}=studio;root.classList.add('equation-studio');
 const q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
 const say=(text,error=false)=>{q('[data-feedback]').classList.toggle('error',error);q('[data-feedback]').innerHTML=text;renderMath(q('[data-feedback]'));};
 function recommended(){
  if(eq[2].n!==0n)return {kind:'add',x:neg(eq[2]),constant:0};
  if(eq[1].n!==0n)return {kind:'add',x:0,constant:neg(eq[1])};
  if(eq[0].n!==0n&&!equal(eq[0],1))return {kind:'divide',divisor:eq[0]};
  return null;
 }
 function operationLabel(op){
  if(op.kind==='divide')return `\\div\\left(${fractionTex(op.divisor)}\\right)`;
  if(op.kind==='multiply')return `\\times ${fractionTex(op.factor)}`;
  const v=rational(op.x??0),u=rational(op.constant??0);
  if(v.n!==0n)return (v.n>0n?'+':'-')+sideTex(v.n<0n?neg(v):v,rational(0));
  return (u.n>=0n?'+':'-')+fractionTex(u.n<0n?neg(u):u);
 }
 function operationFor(key){
  const fixed={minus1:{kind:'add',constant:-1},minusx:{kind:'add',x:-1},plus1:{kind:'add',constant:1},plusx:{kind:'add',x:1},divide2:{kind:'divide',divisor:2},divide3:{kind:'divide',divisor:3}};
  return key==='recommended'?recommended():fixed[key];
 }
 function remember(label){history.push({eq:[...eq],original:[...original],mode,label});if(history.length>20)history.shift();}
 function flash(label){
  if(reducedMotion())return;
  qa('.eq-pan').forEach(pan=>{
   const marker=document.createElement('span');marker.className='eq-operation-flash';marker.innerHTML=math(label);pan.append(marker);renderMath(marker);
   const anim=marker.animate([{opacity:0,transform:'translate(-50%,18px) scale(.8)'},{opacity:1,transform:'translate(-50%,-8px) scale(1)',offset:.35},{opacity:0,transform:'translate(-50%,-38px) scale(.96)'}],{duration:1000,easing:'ease-out'});animations.add(anim);anim.onfinish=()=>{animations.delete(anim);marker.remove();};
  });
 }
 function update(){
  if(disposed)return;
  const values=evaluateEquation(eq,trial),same=equal(values.left,values.right),l=numeric(values.left),r=numeric(values.right),angle=same?0:Math.max(-8,Math.min(8,(r-l)/Math.max(2,Math.abs(l),Math.abs(r))*11));
  q('[data-original]').innerHTML='Start: '+math(equationTex(original));q('[data-equation]').innerHTML=math(equationTex(eq));
  const symbols=(a,b)=>{const parts=[];if(a.n!==0n)parts.push(`<span class="eq-symbol ${a.n<0n?'negative':''}">${math(sideTex(a,rational(0)))}</span>`);if(b.n!==0n)parts.push(`<span class="eq-symbol unit ${b.n<0n?'negative':''}">${math((parts.length&&b.n>0n?'+':'')+fractionTex(b))}</span>`);return parts.join('')||'<span class="eq-empty">0</span>';};
  q('[data-left-symbols]').innerHTML=symbols(eq[0],eq[1]);q('[data-right-symbols]').innerHTML=symbols(eq[2],eq[3]);
  q('[data-left-value]').innerHTML=math(fractionTex(values.left));q('[data-right-value]').innerHTML=math(fractionTex(values.right));q('[data-equals]').textContent=same?'=':'≠';
  q('[data-beam]').style.transform=`rotate(${angle}deg)`;q('[data-zone=left]').style.setProperty('--offset',-angle*2.4+'px');q('[data-zone=right]').style.setProperty('--offset',angle*2.4+'px');
  const trialNumber=numeric(trial);q('[data-trial-output]').textContent=trial.d===1n?String(trial.n):`${trial.n}/${trial.d}`;q('[data-trial]').value=String(Math.max(-6,Math.min(10,trialNumber)));
  if(document.activeElement!==q('[data-guess]'))q('[data-guess]').value=trial.d===1n?String(trial.n):`${trial.n}/${trial.d}`;
  const solution=solveEquation(original);q('[data-type]').innerHTML=solution.kind==='unique'?'Lösningstyp: <strong>exakt en lösning</strong>. Vilket x gör leden lika?':solution.kind==='none'?'Lösningstyp: <strong>ingen lösning</strong>. Undersök vad som händer när x-termerna försvinner.':'Lösningstyp: <strong>alla värden på x</strong>. Båda leden beskriver samma uttryck.';
  q('[data-solving]').hidden=mode!=='solve';q('[data-building]').hidden=mode!=='build';q('[data-build-controls]').hidden=mode!=='build';q('[data-mode-label]').textContent=mode==='build'?'BYGG EN NY EKVATION':'PRÖVA & FÖRÄNDRA';
  qa('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===mode));qa('[data-target]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.target===target));q('[data-action=undo]').disabled=history.length===0;
  const hint=recommended();q('[data-operations]').innerHTML=[['minus1','-1'],['minusx','-x'],['divide2','\\div2'],['divide3','\\div3'],['plus1','+1'],['plusx','+x']].map(([key,label])=>`<button type="button" class="studio-token eq-card" data-tile="op-${key}" data-kind="operation" data-operation="${key}" aria-label="Gör ${label.replace('\\div','division med ')} i båda leden">${math(label)}</button>`).join('')+(hint?`<button type="button" class="studio-token eq-card recommended" data-tile="op-recommended" data-kind="operation" data-operation="recommended" aria-label="Föreslaget nästa steg i båda leden">${math(operationLabel(hint))}<small>ett möjligt nästa steg</small></button>`:'');
  qa('[data-coefficient]').forEach((input,i)=>{if(document.activeElement!==input)input.value=String(numeric(original[i]));});
  q('[data-history]').innerHTML=history.slice(-5).map((entry,i)=>`<li><small>${history.length-Math.min(5,history.length)+i+1}. ${entry.label.startsWith('Bygg')?entry.label:math(entry.label)+' i båda leden'}</small>${math(equationTex(i===Math.min(5,history.length)-1?eq:history[history.length-Math.min(5,history.length)+i+1].eq))}</li>`).join('');
  live.innerHTML=mode==='build'?`Din ekvation är ${math(equationTex(eq))}. Dra fler brickor till valfri sida.`:`När ${math('x='+fractionTex(trial))} är vänsterled ${math(fractionTex(values.left))} och högerled ${math(fractionTex(values.right))}. ${same?'Leden är lika stora.':'Pröva ett annat värde, eller förändra båda leden på samma sätt.'}`;
  renderMath(root);
 }
 function perform(key){
  if(mode!=='solve'){say('Byt till Lös ekvationen för att använda operationskorten.');return;}
  if(history.length>=20){say('Du har gjort 20 steg. Ångra ett steg eller börja om för ett nytt experiment.',true);return;}
  const op=operationFor(key);if(!op){say('Nu är x ensamt. Kontrollera ditt värde i startekvationen.');return;}
  try{const next=applyEquationOperation(eq,op);if(!inBounds(next)){say('Talen blir för stora eller bråken för långa för den här vyn. Ångra eller börja om.',true);return;}const label=operationLabel(op);remember(label);eq=next;update();flash(label);say('Samma operation har utförts i båda leden: '+math(label)+'. Lösningarna är bevarade.');}catch(error){say(error.message,true);}
 }
 function build(variable,amount,side=target){
  if(mode!=='build'){say('Välj Bygg en egen för att dra byggbrickor till leden.');return;}
  const index=(side==='left'?0:2)+(variable==='unit'?1:0),next=[...eq];next[index]=add(next[index],amount);
  const limit=variable==='x'?8:30;if(Math.abs(numeric(next[index]))>limit){say(`Du kan bygga med högst ${limit} ${variable==='x'?'x':'enheter'} i varje led. Använd en negativ bricka för att minska.`,true);return;}
  remember('Byggde om '+(side==='left'?'vänsterled':'högerled'));eq=next;original=[...eq];q('[data-preset]').value='custom';update();say(`En ${variable==='x'?'x-bricka':'enhetsbricka'} ${amount>0?'lades till':'togs bort från'} ${side==='left'?'vänster':'höger'} led. Det här är nu en ny ekvation.`);
 }
 const disposeDrag=dragTiles(root,{onTap:tile=>tile.dataset.kind==='operation'?perform(tile.dataset.operation):build(tile.dataset.variable,+tile.dataset.amount),onDrop:(tile,zone)=>{if(tile.dataset.kind==='operation'){if(zone.dataset.zone==='operation')perform(tile.dataset.operation);else say('Släpp operationskortet i mitten så att båda leden förändras.');}else if(zone.dataset.zone==='left'||zone.dataset.zone==='right')build(tile.dataset.variable,+tile.dataset.amount,zone.dataset.zone);else say('Släpp byggbrickan i vänster eller höger led.');}});
 function choosePreset(index){original=makeEquation(...presets[index].v);eq=[...original];mode='solve';history=[];trial=rational(2);say('');update();}
 q('[data-preset]').onchange=e=>{if(e.target.value!=='custom')choosePreset(+e.target.value);};
 q('[data-trial]').oninput=e=>{trial=rational(e.target.value);q('[data-guess]').value=e.target.value;update();};
 q('[data-guess]').onchange=e=>{try{const candidate=rational(e.target.value);if(Math.abs(numeric(candidate))>1000)throw new RangeError('Pröva ett x mellan −1000 och 1000.');trial=candidate;say('');update();}catch(error){say(error.message,true);}};
 qa('[data-mode]').forEach(button=>button.onclick=()=>{if(mode===button.dataset.mode)return;mode=button.dataset.mode;if(mode==='build'){eq=[...original];history=[];say('Byggläget utgår från startekvationen. Varje byggändring skapar en ny ekvation.');}else{original=[...eq];history=[];say('Din egen ekvation är redo. Samma operation i båda leden bevarar dess lösningar.');}update();});
 qa('[data-target]').forEach(button=>button.onclick=()=>{target=button.dataset.target;update();});
 qa('[data-coefficient]').forEach((input,index)=>input.onchange=()=>{const value=Number(input.value),limit=index%2?30:8;if(!Number.isInteger(value)||Math.abs(value)>limit){say(`Skriv ett heltal mellan −${limit} och ${limit}.`,true);input.value=String(numeric(original[index]));return;}remember('Byggde om ekvationen');eq=[...original];eq[index]=rational(value);original=[...eq];q('[data-preset]').value='custom';update();say('Koefficienten ändrades. Undersök den nya ekvationens lösning.');});
 qa('[data-action]').forEach(button=>button.onclick=()=>{
  const action=button.dataset.action;
  if(action==='undo'){const previous=history.pop();if(previous){eq=previous.eq;original=previous.original;mode=previous.mode;update();say('Det senaste steget är ångrat.');}}
  if(action==='reset'){const selected=+q('[data-preset]').value;choosePreset(Number.isInteger(selected)&&selected<presets.length?selected:0);q('[data-preset]').value=String(Number.isInteger(selected)&&selected<presets.length?selected:0);}
  if(action==='clear-side'){remember('Byggde om '+(target==='left'?'vänsterled':'högerled'));const index=target==='left'?0:2;eq[index]=rational(0);eq[index+1]=rational(0);original=[...eq];q('[data-preset]').value='custom';update();say('Den valda sidan är tom. Ett tomt led har värdet noll.');}
  if(action==='check'){
   try{const guess=rational(q('[data-guess]').value);if(Math.abs(numeric(guess))>1000)throw new RangeError('Pröva ett x mellan −1000 och 1000.');trial=guess;const values=evaluateEquation(original,trial),solution=solveEquation(original);update();if(solution.kind==='all')say('Ja — leden är lika för detta x, och för alla andra värden. Båda leden är samma uttryck.');else if(solution.kind==='none')say('Inget värde kan göra leden lika. När samma x-termer tas bort återstår två olika tal.');else if(equal(values.left,values.right))say('Precis! '+math('x='+fractionTex(trial))+' ger '+math(fractionTex(values.left)+'='+fractionTex(values.right))+' i startekvationen.');else say('Inte balans än. I startekvationen blir leden '+math(fractionTex(values.left))+' och '+math(fractionTex(values.right))+'. Prova igen eller använd Nästa idé.',true);}catch(error){say(error.message,true);}
  }
  if(action==='hint'){const op=recommended();if(op)say('Prova '+math(operationLabel(op))+' i båda leden. '+(op.kind==='divide'?'Då ändras alla termer i båda leden med samma faktor.':'Det tar bort en term och bevarar lösningarna.'));else{const solution=solveEquation(eq);say(solution.kind==='all'?'Nu återstår samma tal i båda leden: alla x fungerar.':solution.kind==='none'?'Nu återstår olika tal: inget x kan göra dem lika.':'x är redan ensamt. Kontrollera det i startekvationen.');}}
  if(action==='challenge'){challengeIndex++;const answer=2+(challengeIndex%5),a=2+(challengeIndex%3),c=bothSides?1+(challengeIndex%2):0,b=2+(challengeIndex%4);original=makeEquation(a,b,c,(a-c)*answer+b);eq=[...original];mode='solve';history=[];trial=rational(1);q('[data-preset]').value='custom';q('[data-challenge]').textContent='Ditt nya uppdrag: gör x ensamt med så få begripliga steg som möjligt. Kontrollera sedan i startekvationen.';say('Ett nytt uppdrag är byggt. Förutsäg lösningen innan du provar.');update();}
 });
 update();
 return ()=>{disposed=true;disposeDrag();animations.forEach(a=>a.cancel());animations.clear();studio.destroy();};
}
