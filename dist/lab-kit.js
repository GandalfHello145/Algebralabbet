/** Shared rendering and direct manipulation for the algebra studios. */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const number = value => Number(Number(value).toFixed(4)).toLocaleString('sv-SE', {maximumFractionDigits:4});
export const reducedMotion = () => typeof document !== 'undefined' && document.body.classList.contains('reduce-motion');
export const math = (source, cls = '') => `<span class="tex ${cls}" data-tex="${escape(source)}">${escape(source)}</span>`;
export function renderMath(root = document) {
  if (!globalThis.katex) return;
  $$('[data-tex]', root).forEach(el => {
    if (el.dataset.rendered === el.dataset.tex && el.querySelector('.katex')) return;
    globalThis.katex.render(el.dataset.tex, el, {throwOnError:false, trust:false, output:'htmlAndMathml'});
    el.dataset.rendered = el.dataset.tex;
  });
}
export const renderedMath = renderMath;
export function rationalTex(value) {
  if (Number.isInteger(value)) return String(value);
  const sign = value < 0 ? '-' : ''; let x = Math.abs(value), h0=0,h1=1,k0=1,k1=0;
  for (let i=0;i<24;i++) {
    const a=Math.floor(x),h=a*h1+h0,k=a*k1+k0;
    if(k>1e9) break;
    if(Math.abs(h/k-Math.abs(value))<1e-10) return `${sign}\\frac{${h}}{${k}}`;
    h0=h1;h1=h;k0=k1;k1=k;x=1/(x-a);if(!Number.isFinite(x))break;
  }
  return String(value).replace('.','{,}');
}
export function polynomial(terms) {
  return terms.filter(t => t.coefficient !== 0).map((t,i) => {
    const n=Math.abs(t.coefficient), v=t.variable||'';
    return `${t.coefficient<0?'-':i?'+':''}${v&&n===1?'':rationalTex(n)}${v}`;
  }).join('') || '0';
}
export function createStudio(host, options) {
  host.innerHTML = `<section class="studio" id="${escape(options.id)}"><header class="studio-header"><div><p class="studio-kicker"><i></i> ETT EXPERIMENT ATT STYRA</p><h2>${escape(options.title)}</h2><p>${escape(options.subtitle||'')}</p></div><span class="studio-stamp">BYGG · PRÖVA<br><b>Se sambandet direkt</b></span></header>${options.tools?`<div class="studio-tools">${options.tools}</div>`:''}<div class="studio-layout"><div class="studio-stage">${options.stage||''}</div><aside class="studio-controls">${options.controls||''}</aside></div><div class="studio-live" role="status" aria-live="polite">${options.readout||''}</div>${options.hint?`<div class="studio-hint"><span>✧</span><div>${options.hint}</div></div>`:''}</section>`;
  const root = host.querySelector('.studio');
  renderMath(root);
  return {root,stage:$('.studio-stage',root),controls:$('.studio-controls',root),live:$('.studio-live',root),destroy(){root.remove();}};
}
export function animateFlip(root, selector, mutate) {
  const positions=new Map($$(selector,root).map((el,i)=>[el.dataset.key??el.dataset.tile??String(i),el.getBoundingClientRect()]));
  const active=document.activeElement, focusKey=active?.dataset?.key;
  mutate();
  if(!reducedMotion()) $$(selector,root).forEach((el,i)=>{
    const old=positions.get(el.dataset.key??el.dataset.tile??String(i));if(!old)return;
    const now=el.getBoundingClientRect(),dx=old.x-now.x,dy=old.y-now.y;
    if(Math.abs(dx)+Math.abs(dy)>1&&el.animate)el.animate([{transform:`translate(${dx}px,${dy}px)`},{transform:'translate(0,0)'}],{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'});
  });
  if(focusKey) $$(selector,root).find(el=>el.dataset.key===focusKey)?.focus({preventScroll:true});
}
export function dragTiles(root,{tileSelector='[data-tile]',zoneSelector='[data-zone]',onDrop=()=>{},onTap=()=>{}}={}) {
  let drag=null,ghost=null,target=null,suppressUntil=0;
  const clearZone=()=>{target?.classList.remove('is-over');target=null;};
  function finish(){
    ghost?.remove();ghost=null;clearZone();root.classList.remove('is-dragging');
    const pointer=drag?.pointer;drag=null;if(pointer!==undefined){try{root.releasePointerCapture(pointer)}catch{}}
    $$(zoneSelector,root).forEach(z=>z.classList.remove('drop-ready'));
  }
  function down(e){
    const tile=e.target.closest(tileSelector);
    if(!tile||!root.contains(tile)||tile.disabled||e.button!==0||e.isPrimary===false)return;
    const rect=tile.getBoundingClientRect();
    drag={tile,pointer:e.pointerId,x:e.clientX,y:e.clientY,rect,moved:false};
    tile.focus?.({preventScroll:true});
    try{root.setPointerCapture(e.pointerId)}catch{}
  }
  function move(e){
    if(!drag||e.pointerId!==drag.pointer)return;
    const distance=Math.hypot(e.clientX-drag.x,e.clientY-drag.y);
    if(!drag.moved&&distance<7)return;
    e.preventDefault();
    if(!drag.moved){
      drag.moved=true;ghost=drag.tile.cloneNode(true);ghost.removeAttribute('id');ghost.removeAttribute('data-tile');ghost.classList.add('studio-drag-ghost');ghost.setAttribute('aria-hidden','true');
      Object.assign(ghost.style,{width:drag.rect.width+'px',height:drag.rect.height+'px',left:drag.rect.left+'px',top:drag.rect.top+'px'});
      document.body.append(ghost);root.classList.add('is-dragging');$$(zoneSelector,root).forEach(z=>z.classList.add('drop-ready'));
    }
    ghost.style.transform=`translate3d(${e.clientX-drag.x}px,${e.clientY-drag.y}px,0) rotate(3deg)`;
    const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(zoneSelector);
    const next=hit&&root.contains(hit)?hit:null;
    if(next!==target){clearZone();target=next;target?.classList.add('is-over');}
  }
  function up(e){
    if(!drag||e.pointerId!==drag.pointer)return;
    const {tile,moved}=drag,zone=target;finish();
    suppressUntil=Date.now()+500;e.preventDefault();if(moved){if(zone)onDrop(tile,zone);}else onTap(tile);
  }
  function click(e){
    const tile=e.target.closest(tileSelector);if(!tile||!root.contains(tile))return;
    if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();return;}
    if(!tile.disabled)onTap(tile);
  }
  function key(e){
    if(e.key==='Escape'){finish();return;}
    const tile=e.target.closest(tileSelector);if(!tile||!root.contains(tile)||tile.disabled)return;
    if(e.key==='Enter'||e.key===' '){e.preventDefault();suppressUntil=Date.now()+500;onTap(tile);}
    if(e.key==='Escape')finish();
  }
  root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move,{passive:false});root.addEventListener('pointerup',up);root.addEventListener('pointercancel',finish);root.addEventListener('lostpointercapture',finish);window.addEventListener('blur',finish);root.addEventListener('click',click,true);root.addEventListener('keydown',key);
  return ()=>{finish();root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',up);root.removeEventListener('pointercancel',finish);root.removeEventListener('lostpointercapture',finish);window.removeEventListener('blur',finish);root.removeEventListener('click',click,true);root.removeEventListener('keydown',key);};
}
