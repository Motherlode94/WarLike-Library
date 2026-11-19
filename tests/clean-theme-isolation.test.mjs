import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');

test('Clean fallback never overrides explicitly selected Store themes', () => {
  const html = read('index.html');
  const clean = read('design-system/warlike-clean.css');
  const palette = read('design-system/warlike-palette-v2.css');
  const parity = read('library-store-theme-parity.css');

  for (const name of ['sand-light', 'tactical', 'heritage']) {
    assert.ok(palette.includes('data-wl-theme="' + name + '"'), 'Missing theme: ' + name);
  }
  assert.match(palette, /--wl-bg:/);
  assert.match(palette, /--wl-fg:/);
  assert.match(parity, /\[data-wl-theme\]/);

  assert.ok(html.includes('library-store-theme-parity.css'));
  assert.ok(html.includes('library-brand-lockup.css'));
  assert.ok(html.includes('warlike-clean.css'));

  // Clean loads last. Every rule must be gated to the fallback mode
  // or it will silently reset selected dark themes to white.
  const selectors = [...clean.matchAll(/(?:^|\})\s*([^{}]+)\{/g)]
    .map(match => match[1].trim())
    .filter(selector => !selector.startsWith('/*') && !selector.startsWith('@'));
  assert.ok(selectors.length > 5);
  assert.ok(clean.includes('html[data-warlike-app]:not([data-wl-theme]){'));
  assert.ok(!clean.includes(':root,html[data-warlike-app]{'));
  for (const selector of selectors) {
    assert.ok(selector.includes(':not([data-wl-theme])'), 'Ungated Clean selector: ' + selector);
  }
});

test('Library remains mobile-aware and preserves resource views', () => {
  const html = read('index.html');
  const sidebar = read('library-sidebar-layout-fix.css');
  assert.match(html, /name="viewport"/);
  assert.match(html, /id="assets"/);
  assert.match(html, /id="inspector"/);
  assert.match(sidebar, /@media/);
});
