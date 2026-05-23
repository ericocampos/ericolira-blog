import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { readingTimeMinutes } from './reading-time.ts';

test('retorna 1 minuto para body vazio', () => {
  assert.equal(readingTimeMinutes(''), 1);
});

test('retorna 1 minuto para textos curtos', () => {
  assert.equal(readingTimeMinutes('uma frase curta com poucas palavras.'), 1);
});

test('arredonda pra cima', () => {
  // 221 palavras / 220 ≈ 1.005 → 2 min
  const words = Array(221).fill('palavra').join(' ');
  assert.equal(readingTimeMinutes(words), 2);
});

test('ignora blocos de código markdown', () => {
  const body = '\n```js\n' + Array(500).fill('x').join('\n') + '\n```\n' + 'duas palavras';
  assert.equal(readingTimeMinutes(body), 1);
});
