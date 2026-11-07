import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {glbSummary} from '../js/core.js';

const root=new URL('../',import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('assets/catalog.json',root),'utf8'));
const files=['police-car.glb','ambulance.glb','suv.glb','character-male-b.glb','character-female-b.glb','topdown-soldier-stand.png','topdown-soldier-machine.png','pixel-police.png','pixel-buggy.png'];
test('CC0 Kenney originals are actual downloaded PNG/GLB files, not placeholder previews',()=>{
 for(const filename of files){
  const a=catalog.find(x=>x.url==='./assets/kenney/'+filename);
  assert.ok(a,'missing '+filename);
  assert.equal(a.author,'Kenney');
  assert.equal(a.license,'CC0-1.0');
  assert.match(a.sourceUrl,/^https:\/\/kenney.nl\/assets\//);
  const bytes=readFileSync(new URL(a.url.slice(2),root));
  assert.equal(bytes.length,a.size,filename);
  if(filename.endsWith('.png')){
   assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',filename);
   assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0);
  }else{
   assert.equal(bytes.subarray(0,4).toString('ascii'),'glTF');
   assert.ok(glbSummary(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)).meshes>0,filename);
   assert.ok(a.thumbnail,'model thumbnail missing: '+filename);
   const thumb=readFileSync(new URL(a.thumbnail.slice(2),root));
   assert.equal(thumb.subarray(0,4).toString('ascii'),'RIFF');
   assert.equal(thumb.subarray(8,12).toString('ascii'),'WEBP');
  }
 }
});
