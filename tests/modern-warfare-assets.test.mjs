import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gltfSummary} from '../js/core.js';

const catalog=JSON.parse(readFileSync(new URL('../assets/catalog.json',import.meta.url),'utf8'));
for(const id of ['modern-tactical-4x4','modern-checkpoint']){
 test(id+' is a playable-engine importable mesh, not an empty placeholder',()=>{
  const entry=catalog.find(a=>a.id==='builtin-community-'+id);
  assert.ok(entry,'catalog entry absent');
  assert.equal(entry.kind,'model');
  assert.equal(entry.collection,'Guerre moderne');
  assert.equal(entry.license,'MIT');
  const file=readFileSync(new URL('../'+entry.url,import.meta.url));
  assert.equal(file.byteLength,entry.size);
  const data=JSON.parse(file.toString('utf8'));
  assert.equal(data.asset.version,'2.0');
  assert.ok(gltfSummary(file.toString('utf8')).meshes>=5);
  assert.ok(data.buffers[0].uri.startsWith('data:application/octet-stream;base64,'));
  const packed=Buffer.from(data.buffers[0].uri.split(',')[1],'base64');
  assert.equal(packed.byteLength,data.buffers[0].byteLength);
  let triangles=0;
  for(const mesh of data.meshes)for(const p of mesh.primitives){
   assert.equal(p.mode,4);
   const a=data.accessors[p.attributes.POSITION];
   assert.ok(a.count>=3&&a.count%3===0);
   const view=data.bufferViews[a.bufferView];
   const positions=new Float32Array(packed.buffer,packed.byteOffset+view.byteOffset,a.count*3);
   assert.ok(positions.every(Number.isFinite),'NaN / Infinity vertex');
   assert.ok(a.min.every(Number.isFinite)&&a.max.every(Number.isFinite));
   assert.ok(a.max.some((v,i)=>v>a.min[i]),'degenerate mesh');
   triangles+=a.count/3;
  }
  assert.equal(triangles,entry.triangles);
  assert.ok(triangles>=300,'Model should have actual spatial geometry');
 });
}
