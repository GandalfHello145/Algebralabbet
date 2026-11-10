import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {explanations} from '../dist/explanations.js';
const module={exports:{}};
vm.runInNewContext(readFileSync(new URL('../dist/vendor/katex/katex.min.js',import.meta.url),'utf8'),{module,exports:module.exports,console});
const katex=module.exports;
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
test('all six explanations have a complete worked example and every formula renders as valid LaTeX',()=>{
 assert.equal(explanations.length,6);let count=0;
 for(const explanation of explanations){
  assert.ok(explanation.steps.length>=4);
  const fields=[explanation.lead,explanation.idea,explanation.pitfall,...explanation.steps.flatMap(step=>[step.text,step.after||''])];
  const sources=[...explanation.steps.map(step=>step.tex),...fields.flatMap(html=>[...html.matchAll(/data-tex="([^"]+)"/g)].map(match=>decode(match[1])))];
  for(const source of sources){assert.doesNotMatch(source,/(?<!\\)(?:cdot|frac|qquad)\b/,'A LaTeX command lost its backslash: '+source);assert.doesNotThrow(()=>katex.renderToString(source,{throwOnError:true,strict:'error'}),source);count++;}
 }
 assert.ok(count>70,`Checked ${count} distinct uses of mathematical notation`);
});
