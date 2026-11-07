import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspect3D,imageMode,formatAssetBytes} from '../js/asset-inspection.js';

const root=new URL('../',import.meta.url);
function bytes(path){const file=readFileSync(new URL(path,root));return file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);}
test('inspector reads authentic animated Quaternius GLB metadata',()=>{
 const a=inspect3D(bytes('assets/quaternius-ultimatedanimatedcharacter-soldier-male.glb'),'soldier.glb');
 assert.ok(a.meshes>0&&a.primitives>0);
 assert.ok(a.animations.length>=1);
 assert.ok(a.vertices>0);
 assert.ok(a.triangles>=0);
 assert.ok(a.materials>=0);
});
test('inspector reads procedural glTF geometry without claiming it is animated or rigged',()=>{
 const a=inspect3D(bytes('assets/community/vehicle-scout-buggy.gltf'),'buggy.gltf');
 assert.ok(a.meshes>=5);
 assert.ok(a.triangles>=300);
 assert.equal(a.rigged,false);
 assert.equal(a.animations.length,0);
});
test('inspector rejects non GLB bytes and unsupported formats',()=>{
 assert.throws(()=>inspect3D(new TextEncoder().encode('{}').buffer,'broken.glb'),/GLB/);
 assert.throws(()=>inspect3D(new TextEncoder().encode('{}').buffer,'bad.obj'),/non reconnu/);
 assert.equal(imageMode('sprite.png'),'PNG');
 assert.equal(formatAssetBytes(2048),'2.0 Ko');
});
test('Library links to the independent provider and receives real files',()=>{
 const html=readFileSync(new URL('index.html',root),'utf8');
 assert.ok(html.includes('https://warlike-asset-stores.pages.dev/'));
 const receiver=readFileSync(new URL('store-import.html',root),'utf8');
 assert.ok(receiver.includes('parseStoreAsset'));assert.ok(receiver.includes('writeMany([record])'));
});
