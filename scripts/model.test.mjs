import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// A data URL keeps these tests independent of a bundler or package.json mode.
const source = await readFile(new URL('../dist/model.js', import.meta.url), 'utf8');
const { evaluateExpression, solveLinear, reduceTerms, patternCount, generateTask } =
  await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('substitution respects multiplication, negative numbers and fractions', () => {
  assert.equal(evaluateExpression(3, 2, 4), 14);
  assert.equal(evaluateExpression(-3, 0.5, -1.5), 5);
  assert.equal(evaluateExpression(0, -7, 20), -7);
  assert.equal(Object.is(evaluateExpression(-1, -0, 0), -0), false);
});

test('linear solutions satisfy the original equation, including fractional roots', () => {
  for (const coefficients of [[3, 4, 0, 19], [4, 2, 2, 12], [-4, 0.5, 2, 9.5], [0.5, -2, -1.5, 3]]) {
    const [a, b, c, d] = coefficients;
    const result = solveLinear(a, b, c, d);
    assert.equal(result.kind, 'unique');
    assert.ok(Math.abs(a * result.value + b - (c * result.value + d)) < 1e-10);
  }
  assert.deepEqual(solveLinear(2, 4, 2, 4), { kind: 'all' });
  assert.deepEqual(solveLinear(2, 4, 2, 7), { kind: 'none' });
  assert.deepEqual(solveLinear(0, 0, 0, 0), { kind: 'all' });
  assert.deepEqual(solveLinear(0, 0, 0, 3), { kind: 'none' });
});

test('term reduction preserves expression values and never combines unlike terms', () => {
  const terms = [
    { coefficient: 4, variable: 'x' }, { coefficient: 3, variable: '' },
    { coefficient: -1.5, variable: 'x' }, { coefficient: 2, variable: 'y' },
    { coefficient: -1, variable: '' }, { coefficient: -3, variable: 'y' },
  ];
  const snapshot = structuredClone(terms);
  const result = reduceTerms(terms);
  assert.deepEqual(result, [{ coefficient: 2.5, variable: 'x' }, { coefficient: -1, variable: 'y' }, { coefficient: 2, variable: '' }]);
  assert.deepEqual(terms, snapshot, 'input must not be mutated');
  for (const [x, y] of [[-2, 0.5], [0, -3], [4, 7]]) {
    const value = (list) => list.reduce((sum, t) => sum + t.coefficient * (t.variable === 'x' ? x : t.variable === 'y' ? y : 1), 0);
    assert.equal(value(terms), value(result));
  }
  assert.deepEqual(reduceTerms([{ coefficient: 2, variable: 'x' }, { coefficient: -2, variable: 'x' }]), [{ coefficient: 0, variable: '' }]);
  assert.deepEqual(reduceTerms([]), [{ coefficient: 0, variable: '' }]);
});

test('pattern indices begin at one and preserve the stated common difference', () => {
  assert.equal(patternCount(1), 5);
  assert.equal(patternCount(20), 62);
  for (let n = 1; n < 30; n++) {
    assert.equal(patternCount(n + 1, -3, 100) - patternCount(n, -3, 100), -3);
  }
  assert.equal(patternCount(3, 0.5, 2), 3.5);
});

test('all chapter topics and levels produce deterministic, complete numeric tasks', () => {
  for (let topic = 0; topic < 6; topic++) {
    for (const level of ['start', 'explore', 'challenge']) {
      const examples = [];
      for (let seed = 0; seed < 100; seed++) {
        const task = generateTask(topic, level, seed);
        assert.deepEqual(task, generateTask(topic, level, seed));
        for (const field of ['prompt', 'tex', 'hint', 'explanation']) assert.ok(typeof task[field] === 'string' && task[field].length > 5);
        assert.ok(Number.isFinite(task.answer));
        assert.ok(!task.tex.includes('undefined') && !task.tex.includes('NaN'));
        if (topic === 1) assert.ok(Number.isInteger(task.answer) && task.answer > 0, 'brick counts must be positive integers');
        examples.push(task.tex);
      }
      assert.ok(new Set(examples).size > 20, 'seed should produce varied practice');
    }
  }
});

test('equation task answers solve independently parsed linear equations', () => {
  // Start/explore coefficients are integers, allowing a second, small parser to
  // independently verify generated answers against the displayed equation.
  const parse = (s) => {
    if (!s.includes('x')) return [0, Number(s)];
    const match = s.match(/^(-?\d*)x(?: ([+-]) (\d+))?$/);
    assert.ok(match, `unrecognized linear expression: ${s}`);
    const a = match[1] === '' ? 1 : match[1] === '-' ? -1 : Number(match[1]);
    return [a, match[2] ? Number(match[3]) * (match[2] === '-' ? -1 : 1) : 0];
  };
  for (const topic of [3, 5]) for (const level of ['start', 'explore']) for (let seed = 0; seed < 100; seed++) {
    const task = generateTask(topic, level, seed);
    const [left, right] = task.tex.split('=');
    const [a, b] = parse(left);
    const [c, d] = parse(right);
    assert.equal(a * task.answer + b, c * task.answer + d);
  }
});

test('challenge practice includes fractional answers and negative values', () => {
  const tasks = Array.from({ length: 60 }, (_, seed) => [0, 3, 4, 5].map((t) => generateTask(t, 'challenge', seed))).flat();
  assert.ok(tasks.some((t) => t.answer < 0));
  assert.ok(tasks.some((t) => !Number.isInteger(t.answer)));
  assert.ok(tasks.some((t) => t.tex.includes('\\frac')));
  for (let seed = 0; seed < 20; seed++) assert.equal(generateTask(4, 'challenge', seed).answer % 1, 0.5);
});

test('invalid values fail explicitly instead of leaking NaN into student tasks', () => {
  for (const value of [NaN, Infinity, '2', null]) assert.throws(() => evaluateExpression(2, 3, value), TypeError);
  assert.throws(() => solveLinear(1, 2, Infinity, 3), TypeError);
  assert.throws(() => reduceTerms([{ coefficient: 1, variable: 'z' }]), TypeError);
  assert.throws(() => reduceTerms([{ coefficient: NaN, variable: 'x' }]), TypeError);
  for (const index of [0, -1, 1.5]) assert.throws(() => patternCount(index), RangeError);
  assert.throws(() => generateTask(6, 'start', 1), RangeError);
  assert.throws(() => generateTask(0, 'unknown', 1), RangeError);
  assert.throws(() => generateTask(0, 'start', NaN), TypeError);
});
