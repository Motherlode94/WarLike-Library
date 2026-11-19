import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

test("Store semantic theme tokens drive Library UI without removing the main brand layout", () => {
  const css = read('library-store-theme-parity.css');
  const html = read('index.html');
  assert.ok(html.includes('library-store-theme-parity.css'));
  assert.ok(html.includes('library-brand-lockup.css'));
  for (const token of ['--wl-bg', '--wl-surface', '--wl-sidebar', '--wl-fg', '--wl-accent', '--wl-border']) {
    assert.ok(css.includes(token), token);
  }
  assert.match(css, /data-wl-theme/);
  assert.match(css, /\.asset-card/);
});
