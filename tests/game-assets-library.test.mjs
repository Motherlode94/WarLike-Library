import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {gltfSummary,classify} from '../js/core.js';
const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('assets/catalog.json',root),'utf8'));
const latest=['rpg-mage','rpg-skeleton','fps-medic','fps-ammo','rts-command','rts-resource','sim-counter','sim-tractor','horror-key','horror-eye','sport-ball','platform-crystal','fps-supply-crate','rts-radar-tower','sim-market-stall','horror-stone-altar','rpg-treasure-chest','sport-goal'];
test('new 2D and 3D items refer to files actually included in WarLike-Library',()=>{
 for(const id of latest){
  const item=catalog.find(a=>a.id==='builtin-community-'+id);
  assert.ok(item,'Missing '+id);
  assert.ok(item.url.startsWith('./assets/community/'));
  assert.ok(existsSync(new URL(item.url.slice(2),root)),item.url);
  assert.equal(classify(item.filename),item.kind);
  assert.ok(item.collection);
  assert.ok(item.license);
 }
});
test('all new 3D glTF objects are self-contained, with real geometry and mesh accessors',()=>{
 for(const id of latest.filter(id=>id.endsWith('-3d')||['fps-supply-crate','rts-radar-tower','sim-market-stall','horror-stone-altar','rpg-treasure-chest','sport-goal'].includes(id))){
  const item=catalog.find(a=>a.id==='builtin-community-'+id);
  const raw=readFileSync(new URL(item.url.slice(2),root),'utf8');
  const doc=JSON.parse(raw);
  const summary=gltfSummary(raw);
  assert.ok(summary.meshes>0,id);
  assert.ok(doc.buffers.every(b=>b.uri.startsWith('data:')),id);
  assert.ok(doc.accessors.some(a=>a.type==='VEC3'&&a.count>=8),id);
 }
});
test('all new SVG sprites are actual vector files, not placeholder links',()=>{
 for(const id of latest.slice(0,12)){
  const item=catalog.find(a=>a.id==='builtin-community-'+id);
  const svg=readFileSync(new URL(item.url.slice(2),root),'utf8');
  assert.match(svg,/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.ok(svg.includes('<path')||svg.includes('<rect')||svg.includes('<circle'));
 }
});
