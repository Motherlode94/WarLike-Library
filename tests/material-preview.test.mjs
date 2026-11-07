import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectModelColors} from '../js/material-preview.js';
const bufferFor=doc=>{
 const bytes=new TextEncoder().encode(JSON.stringify({asset:{version:'2.0'},...doc}));
 const padding=(4-bytes.length%4)%4;
 const out=new ArrayBuffer(20+bytes.length+padding),v=new DataView(out),u=new Uint8Array(out);
 v.setUint32(0,0x46546c67,true);v.setUint32(4,2,true);v.setUint32(8,out.byteLength,true);
 v.setUint32(12,bytes.length+padding,true);v.setUint32(16,0x4e4f534a,true);
 u.set(bytes,20);u.fill(0x20,20+bytes.length);return out;
};
test('GLB reports actual author-assigned base colors',()=>{
 const data=inspectModelColors(bufferFor({materials:[{pbrMetallicRoughness:{baseColorFactor:[0.2,0.4,0.6,1]}}],meshes:[{primitives:[{attributes:{POSITION:0},material:0}]}]}));
 assert.equal(data.coloredMaterials,1);assert.equal(data.referencedMaterials,1);assert.equal(data.warning,'');
});
test('GLB without materials or vertex colors identifies the missing source data',()=>{
 const data=inspectModelColors(bufferFor({meshes:[{primitives:[{attributes:{POSITION:0}}]}]}));
 assert.equal(data.materials,0);assert.match(data.warning,/Aucun matériau/);
});
test('GLB external textures are detected, not silently treated as embedded',()=>{
 const data=inspectModelColors(bufferFor({images:[{uri:'textures/albedo.png'}],materials:[{pbrMetallicRoughness:{baseColorTexture:{index:0}}}],meshes:[{primitives:[{attributes:{POSITION:0},material:0}]}]}));
 assert.deepEqual(data.externalImages,['textures/albedo.png']);assert.match(data.warning,/Dépendances externes/);
});
test('vertex colored meshes are not mislabeled material-less',()=>{
 const data=inspectModelColors(bufferFor({meshes:[{primitives:[{attributes:{POSITION:0,COLOR_0:2}}]}]}));
 assert.equal(data.vertexColors,1);assert.equal(data.warning,'');
});
