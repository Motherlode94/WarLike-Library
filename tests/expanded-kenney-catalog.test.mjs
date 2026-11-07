import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const root=new URL('../',import.meta.url);
const assets=JSON.parse(readFileSync(new URL('assets/catalog.json',root),'utf8'));
const incoming=assets.filter(a=>a.id.startsWith('builtin-kenney-expanded-'));
import {safeCatalogPath as safePath} from '../js/catalog-path.js';
test('real Kenney expanded assets and thumbnails are bundled and byte-verified',()=>{
 assert.equal(incoming.filter(a=>a.kind==='model').length,154);
 assert.equal(incoming.filter(a=>a.kind==='image').length,232);
 const seen=new Set();
 for(const a of incoming){
  assert.equal(a.author,'Kenney');assert.equal(a.license,'CC0-1.0');
  assert.match(a.sourceRepository,/^https:\/\/github\.com\/(Hidencod\/tge-assets|shorepine\/kenney)$/);
  assert.match(a.sourceRevision,/^[a-f0-9]{40}$/);
  assert.ok(!seen.has(a.id));seen.add(a.id);
  assert.equal(safePath(a.url),a.url,'Store rejects '+a.url);
  assert.match(a.url,/^\.\/assets\/kenney-expanded\//);
  const bytes=readFileSync(new URL(a.url.slice(2),root));
  assert.equal(bytes.length,a.size,a.url);
  if(a.kind==='model'){
   assert.equal(bytes.toString('ascii',0,4),'glTF',a.filename);
   assert.ok(a.meshes>=1);
   assert.ok(a.thumbnail,a.name+' is missing a thumbnail');
   assert.equal(safePath(a.thumbnail),a.thumbnail);
   assert.equal(readFileSync(new URL(a.thumbnail.slice(2),root)).toString('ascii',0,4),'RIFF');
  }else{
   assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
   assert.ok(a.width>0&&a.height>0);
  }
 }
});
test('Library validates builtin source paths and rejects traversal or remote URLs',()=>{
 assert.equal(safePath('./assets/kenney-expanded/3d/car-kit/../../evil.glb'),null);
 assert.equal(safePath('https://untrusted.invalid/evil.glb'),null);
});
test('expanded Kenney packs refer only to actual catalog assets',()=>{
 const packs=JSON.parse(readFileSync(new URL('assets/packs.json',root),'utf8')).packs.filter(p=>p.id.startsWith('kenney-'));
 assert.equal(packs.length,26);
 const ids=new Set(incoming.map(a=>a.id));
 const all=packs.flatMap(p=>p.assetIds);
 assert.equal(new Set(all).size,incoming.length);
 for(const id of all)assert.ok(ids.has(id),'Unknown file '+id);
});
