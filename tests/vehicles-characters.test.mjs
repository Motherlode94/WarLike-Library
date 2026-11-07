import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gltfSummary} from '../js/core.js';

const catalog=JSON.parse(readFileSync(new URL('../assets/catalog.json',import.meta.url),'utf8'));
const ids=['vehicle-scout-buggy','vehicle-armored-carrier','character-scout','character-field-medic'];
test('new vehicles and characters are unique, categorized, downloadable real 3D files',()=>{
 const allIds=new Set(catalog.map(x=>x.id));
 assert.equal(allIds.size,catalog.length);
 for(const id of ids){
  const a=catalog.find(x=>x.id==='builtin-community-'+id);
  assert.ok(a,'missing catalog asset '+id);
  assert.equal(a.kind,'model');
  assert.equal(a.collection,id.startsWith('vehicle-')?'Véhicules':'Personnages');
  assert.equal(a.license,'MIT');
  const data=readFileSync(new URL('../'+a.url,import.meta.url));
  assert.equal(data.byteLength,a.size);
  const doc=JSON.parse(data.toString('utf8'));
  assert.equal(doc.asset.version,'2.0');
  assert.ok(gltfSummary(data.toString('utf8')).meshes>0);
  assert.ok(doc.buffers[0].uri.startsWith('data:application/octet-stream;base64,'));
  const buf=Buffer.from(doc.buffers[0].uri.split(',')[1],'base64');
  assert.equal(buf.length,doc.buffers[0].byteLength);
  let count=0;
  for(const mesh of doc.meshes)for(const primitive of mesh.primitives){
   assert.equal(primitive.mode,4);
   const accessor=doc.accessors[primitive.attributes.POSITION];
   assert.equal(accessor.count%3,0);
   const view=doc.bufferViews[accessor.bufferView];
   const v=new Float32Array(buf.buffer,buf.byteOffset+view.byteOffset,accessor.count*3);
   assert.ok(v.every(Number.isFinite),'invalid coordinates: '+id);
   assert.ok(accessor.min.every(Number.isFinite)&&accessor.max.every(Number.isFinite));
   count+=accessor.count/3;
  }
  assert.ok(count>300);
  assert.equal(count,a.triangles);
 }
});
