import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {Script} from 'node:vm';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('assets/catalog.json',root),'utf8'));
const manifest=JSON.parse(readFileSync(new URL('assets/packs.json',root),'utf8'));
test('all pack references point to real assets and do not promise playable prefabs',()=>{
 assert.equal(manifest.schema,'warlike.library.packs.v1');
 const ids=new Set(catalog.map(a=>a.id));
 const seen=new Set();
 for(const pack of manifest.packs){
  assert.ok(pack.assetIds.length>0);
  assert.match(pack.status,/^(art-assets|sprite-assets)$/);
  for(const id of pack.assetIds){
   assert.ok(ids.has(id),'asset does not exist: '+id);
   assert.ok(!seen.has(id),'duplicate pack asset: '+id);
   seen.add(id);
   const a=catalog.find(a=>a.id===id);
   assert.ok(existsSync(new URL(a.url.slice(2),root)),id);
   assert.equal(a.kind,pack.format==='png'?'image':'model');
  }
 }
});
test('old Library store bookmarks redirect to the standalone provider',()=>{
 const html=readFileSync(new URL('store.html',root),'utf8');
 assert.ok(html.includes('https://warlike-asset-stores.pages.dev/'));
 assert.ok(html.includes('location.search+location.hash'));
 assert.ok(!html.includes('assetViewer'));
});
