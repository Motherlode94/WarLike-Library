import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('Library wordmark has independent icon, title and description',()=>{
 const html=read('index.html');
 assert.match(html,/class="brand-copy"/);
 assert.match(html,/class="brand-title"/);
 assert.match(html,/class="brand-tagline"/);
 assert.match(html,/aria-label="WarLike Library — Accueil"/);
 assert.ok(html.indexOf('library-sidebar-layout-fix.css')<html.indexOf('library-brand-lockup.css'));
});
test('Logo and brand text cannot shrink onto each other in sidebar',()=>{
 const css=read('library-brand-lockup.css');
 assert.match(css,/grid-template-columns:42px minmax\(0,1fr\)/);
 assert.match(css,/min-width:42px/);
 assert.match(css,/\.brand-title b\{/);
 assert.match(css,/@media\(max-width:850px\)/);
});
