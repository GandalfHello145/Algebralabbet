import test from 'node:test';
import assert from 'node:assert/strict';
import {rational, fractionTex, makeEquation, applyEquationOperation, solveEquation, evaluateEquation} from '../dist/labs-equations.js';

const same=(a,b)=>a.n*b.d===b.n*a.d;
function checkRoot(equation,answer){const v=evaluateEquation(equation,answer);assert.ok(same(v.left,v.right), 'A proposed root must satisfy the original equation exactly');}

test('rational parsing normalizes signs, decimals and fractions without floating point drift',()=>{
 assert.deepEqual(rational('2/6'),{n:1n,d:3n});
 assert.deepEqual(rational('-1,25'),{n:-5n,d:4n});
 assert.deepEqual(rational('−0.5'),{n:-1n,d:2n});
 assert.deepEqual(rational(4,-6),{n:-2n,d:3n});
 assert.deepEqual(rational(0,-7),{n:0n,d:1n});
 assert.equal(fractionTex(rational(-4,6)),'-\\frac{2}{3}');
});

test('all allowed equal-side operations preserve independently calculated roots',()=>{
 const operations=[{kind:'add',constant:-4},{kind:'add',x:-2},{kind:'divide',divisor:3},{kind:'add',constant:'1/2'},{kind:'multiply',factor:-2},{kind:'add',x:'-1/3'},{kind:'divide',divisor:-5}];
 let cases=0;
 for(let a=-4;a<=4;a++)for(let c=-3;c<=3;c++){
  if(a===c)continue;
  for(let b=-3;b<=3;b++){
   const d=b+((a*3+c*5)%11),original=makeEquation(a,b,c,d),expected=rational(d-b,a-c);
   checkRoot(original,expected);
   let e=original;
   for(const operation of operations){
    e=applyEquationOperation(e,operation);
    const result=solveEquation(e);
    assert.equal(result.kind,'unique');assert.ok(same(result.value,expected));checkRoot(e,expected);
    // Off-root values must remain off-root as well, so no spurious roots are introduced.
    const trial=evaluateEquation(e,rational(expected.n+expected.d,expected.d));
    assert.ok(!same(trial.left,trial.right));
   }
   cases++;
  }
 }
 assert.ok(cases>300);
});

test('identities and contradictions keep their solution sets through rational transformations',()=>{
 const operations=[{kind:'add',x:-2},{kind:'add',constant:-4},{kind:'divide',divisor:3},{kind:'multiply',factor:-7},{kind:'add',x:'1/5',constant:'-2/7'}];
 for(const [original,kind] of [[makeEquation(2,4,2,4),'all'],[makeEquation(2,4,2,7),'none']]){
  let e=original;
  for(const operation of operations){
   e=applyEquationOperation(e,operation);assert.equal(solveEquation(e).kind,kind);
   for(const trial of [-9,'1/3',0,7]){const values=evaluateEquation(e,trial);assert.equal(same(values.left,values.right),kind==='all');}
  }
 }
});

test('repeated division stays exact and returning to the original state is exact',()=>{
 const original=makeEquation(3,4,0,19);let e=original;
 for(let i=0;i<12;i++)e=applyEquationOperation(e,{kind:'divide',divisor:3});
 assert.equal(e[1].d,531441n);assert.equal(fractionTex(e[1]),'\\frac{4}{531441}');
 assert.deepEqual(solveEquation(e),{kind:'unique',value:rational(5)});checkRoot(e,5);
 for(let i=0;i<12;i++)e=applyEquationOperation(e,{kind:'multiply',factor:3});
 assert.deepEqual(e,original);
});

test('zero divisors and zero scaling are rejected rather than changing the solution set',()=>{
 const e=makeEquation(4,2,2,12),before=e.map(v=>({...v}));
 assert.throws(()=>applyEquationOperation(e,{kind:'divide',divisor:0}),RangeError);
 assert.throws(()=>applyEquationOperation(e,{kind:'multiply',factor:0}),RangeError);
 assert.throws(()=>rational('1/0'),RangeError);
 assert.deepEqual(e,before);
 for(const value of [NaN,Infinity,'x+3','3//2','1e1000','<script>',''])assert.throws(()=>rational(value));
});

test('fractional and negative answers are checked in the untransformed equation',()=>{
 for(const [coefficients,root] of [[[2,1,0,8],'7/2'],[[3,8,5,2],3],[[4,-1,2,-6],'-5/2'],[[0,1,3,2],'-1/3']]){
  const e=makeEquation(...coefficients),solution=solveEquation(e);assert.equal(solution.kind,'unique');assert.ok(same(solution.value,rational(root)));checkRoot(e,root);
 }
});
