/** Pure, deterministic mathematics for Algebralabbet. No DOM or stored state. */
const LEVELS = ['start', 'explore', 'challenge'];

function finite(value, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} måste vara ett ändligt tal.`);
  }
  return value;
}

const positiveZero = (value) => Object.is(value, -0) ? 0 : value;
const sv = (value) => String(positiveZero(value)).replace('.', ',');

/** Evaluate ax+b. Coefficient, constant and x may be negative or fractional. */
export function evaluateExpression(coefficient, constant, x) {
  [coefficient, constant, x].forEach((n) => finite(n, 'Värdet'));
  return positiveZero(coefficient * x + constant);
}

/** Solve ax+b=cx+d, including identities and contradictions. */
export function solveLinear(a, b, c, d) {
  [a, b, c, d].forEach((n) => finite(n, 'Koefficienten'));
  const slope = a - c;
  const constant = d - b;
  if (slope === 0) return { kind: constant === 0 ? 'all' : 'none' };
  return { kind: 'unique', value: positiveZero(constant / slope) };
}

/** Combine like terms; a negative coefficient retains its sign. */
export function reduceTerms(terms) {
  if (!Array.isArray(terms)) throw new TypeError('Termer måste vara en array.');
  const totals = new Map([['x', 0], ['y', 0], ['', 0]]);
  for (const term of terms) {
    if (!term || !totals.has(term.variable)) throw new TypeError('Variabeln måste vara x, y eller en tom sträng.');
    finite(term.coefficient, 'Koefficienten');
    totals.set(term.variable, totals.get(term.variable) + term.coefficient);
  }
  const result = [...totals].filter(([, n]) => n !== 0)
    .map(([variable, coefficient]) => ({ coefficient: positiveZero(coefficient), variable }));
  return result.length ? result : [{ coefficient: 0, variable: '' }];
}

/** Figure numbers begin at 1: the first figure contains step+base items. */
export function patternCount(n, step = 3, base = 2) {
  finite(n, 'Figurnumret');
  finite(step, 'Förändringen');
  finite(base, 'Den fasta delen');
  if (!Number.isInteger(n) || n < 1) throw new RangeError('Figurnumret måste vara ett heltal från 1.');
  return positiveZero(step * n + base);
}

function randomFrom(seed) {
  let state = Math.trunc(finite(seed, 'Fröet')) >>> 0;
  return (min, max) => {
    state = (state + 0x6D2B79F5) >>> 0;
    let n = Math.imul(state ^ (state >>> 15), 1 | state);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    const fraction = ((n ^ (n >>> 14)) >>> 0) / 4294967296;
    return min + Math.floor(fraction * (max - min + 1));
  };
}

function texNumber(n) {
  if (Number.isInteger(n)) return String(positiveZero(n));
  if (Number.isInteger(n * 2)) return `${n < 0 ? '-' : ''}\\frac{${Math.abs(n * 2)}}{2}`;
  return String(n).replace('.', '{,}');
}

function polynomial(terms) {
  const visible = terms.filter(({ coefficient }) => coefficient !== 0);
  if (!visible.length) return '0';
  return visible.map(({ coefficient, variable }, i) => {
    const magnitude = Math.abs(coefficient);
    const body = `${variable && magnitude === 1 ? '' : texNumber(magnitude)}${variable}`;
    return `${coefficient < 0 ? (i ? ' - ' : '-') : (i ? ' + ' : '')}${body}`;
  }).join('');
}

const linearTex = (a, b) => polynomial([{ coefficient: a, variable: 'x' }, { coefficient: b, variable: '' }]);

/**
 * Chapter topics 0..5 correspond to Matematik X sections 2.1..2.6.
 * Every task has one numeric answer; fractional answers use ordinary numbers.
 */
export function generateTask(topic, level = 'start', seed = 1) {
  if (!Number.isInteger(topic) || topic < 0 || topic > 5) throw new RangeError('Ämnet måste vara 0–5.');
  if (!LEVELS.includes(level)) throw new RangeError('Nivån måste vara start, explore eller challenge.');
  const pick = randomFrom(seed);
  const challenge = level === 'challenge';
  const explore = level === 'explore';

  if (topic === 0) {
    const a = challenge ? -pick(2, 7) : pick(2, explore ? 9 : 5);
    const b = challenge ? pick(-9, 9) / 2 : pick(1, explore ? 15 : 8);
    const x = challenge ? pick(-9, -1) / 2 : pick(1, explore ? 9 : 5);
    const answer = evaluateExpression(a, b, x);
    return {
      prompt: `Beräkna uttryckets värde när x = ${sv(x)}.`,
      tex: `${linearTex(a, b)},\\qquad x=${texNumber(x)}`,
      answer,
      hint: 'Byt ut varje x mot det givna talet. Multiplikation görs före addition.',
      explanation: `${sv(a)} · (${sv(x)}) + (${sv(b)}) = ${sv(a * x)} + (${sv(b)}) = ${sv(answer)}.`,
    };
  }

  if (topic === 1) {
    const step = challenge ? -pick(2, 5) : pick(2, explore ? 7 : 4);
    const n = challenge ? pick(9, 16) : pick(explore ? 10 : 3, explore ? 24 : 7);
    const base = challenge ? -step * (n + pick(3, 8)) : pick(1, 6);
    const first = patternCount(1, step, base);
    const second = patternCount(2, step, base);
    const third = patternCount(3, step, base);
    const answer = patternCount(n, step, base);
    return {
      prompt: `Figur 1, 2 och 3 har ${first}, ${second} och ${third} brickor. Förändringen är lika stor varje gång. Hur många brickor har figur ${n}?`,
      tex: `f(1)=${first},\\quad f(2)=${second},\\quad f(3)=${third},\\quad f(${n})=?`,
      answer, unit: 'brickor',
      hint: `Från figur 1 till figur ${n} är det ${n - 1} steg. Varje steg ${step < 0 ? 'tar bort' : 'lägger till'} ${Math.abs(step)} brickor.`,
      explanation: `${first} + (${n} − 1) · (${step}) = ${answer}. Regeln är f(n) = ${step}n + ${base}.`,
    };
  }

  if (topic === 2) {
    const p = challenge ? -pick(1, 9) / 2 : pick(2, 7);
    const q = challenge ? pick(-7, 7) / 2 : pick(1, 6);
    const r = challenge ? pick(-9, 9) / 2 : pick(1, 6);
    const constant = pick(-8, 8);
    const terms = [{ coefficient: p, variable: 'x' }, { coefficient: constant, variable: '' }, { coefficient: r, variable: 'x' }];
    if (explore || challenge) terms.splice(1, 0, { coefficient: q, variable: 'y' }, { coefficient: -q + pick(1, 4), variable: 'y' });
    const reduced = reduceTerms(terms);
    const answer = reduced.find((term) => term.variable === 'x')?.coefficient ?? 0;
    return {
      prompt: 'Förenkla uttrycket. Vilket tal är koefficienten framför x? Svara 0 om alla x-termer försvinner.',
      tex: polynomial(terms), answer,
      hint: 'Samla bara x-termerna. Behåll deras tecken. y-termer och vanliga tal hör till andra grupper.',
      explanation: `Koefficienten är ${sv(p)} + (${sv(r)}) = ${sv(answer)}. Hela uttrycket förenklas till ${polynomial(reduced)}.`,
    };
  }

  if (topic === 3) {
    const a = challenge ? -pick(2, 6) : (explore ? pick(2, 7) : 1);
    const b = challenge ? pick(-9, 9) / 2 : pick(1, 12);
    const x = challenge ? pick(-11, 11) / 2 : pick(1, explore ? 12 : 9);
    const d = evaluateExpression(a, b, x);
    return {
      prompt: 'Lös ekvationen. Vilket värde på x gör båda leden lika stora?',
      tex: `${linearTex(a, b)}=${texNumber(d)}`, answer: x,
      hint: `Subtrahera ${sv(b)} från båda leden. Dela sedan båda leden med ${a}.`,
      explanation: `Efter samma operation i båda leden blir ${a}x = ${sv(d - b)}, alltså x = ${sv(x)}. Kontroll: ${sv(a)} · (${sv(x)}) + (${sv(b)}) = ${sv(d)}.`,
    };
  }

  if (topic === 4) {
    const fee = pick(2, 8) * 5;
    const rate = pick(2, explore || challenge ? 8 : 5) * 4;
    const x = challenge ? (pick(1, 6) + 0.5) : pick(2, explore ? 9 : 5);
    const total = fee + rate * x;
    return {
      prompt: `En cykeluthyrning tar ${fee} kr i startavgift och ${rate} kr per timme. Du betalar totalt ${total} kr. Hur många timmar hyrde du cykeln?`,
      tex: `${fee}+${rate}x=${total},\\qquad x=\\text{antal timmar}`, answer: x, unit: 'timmar',
      hint: 'Ta först bort startavgiften från totalsumman. Dela resten med priset per timme.',
      explanation: `(${total} − ${fee}) / ${rate} = ${sv(x)} timmar. Kontroll: ${fee} + ${rate} · ${sv(x)} = ${total} kr.`,
    };
  }

  const a = challenge ? -pick(2, 6) : pick(3, explore ? 9 : 6);
  const c = challenge ? pick(1, 5) : pick(1, a - 1);
  const b = challenge ? pick(-9, 9) / 2 : pick(1, 12);
  const x = challenge ? pick(-11, 11) / 2 : pick(1, explore ? 12 : 7);
  const d = evaluateExpression(a - c, b, x);
  return {
    prompt: 'Lös ekvationen med x i båda leden. Svara med värdet på x.',
    tex: `${linearTex(a, b)}=${linearTex(c, d)}`, answer: x,
    hint: `Subtrahera ${c}x från båda leden. Subtrahera sedan ${sv(b)} från båda leden.`,
    explanation: `Då återstår ${a - c}x = ${sv(d - b)}. Dela båda leden med ${a - c}: x = ${sv(x)}. Vid kontroll får båda leden värdet ${sv(evaluateExpression(a, b, x))}.`,
  };
}
