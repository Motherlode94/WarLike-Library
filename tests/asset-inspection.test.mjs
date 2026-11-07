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
test('store exposes genuine 2D inspection controls, 3D metadata and preview buttons',()=>{
 const html=readFileSync(new URL('store.html',root),'utf8');
 for(const fragment of ['previewSprite(a)','previewModel(a)','spriteZoom','sprite-stage checker','inspect3D(buffer,a.filename)','Aperçu 2D','Aperçu 3D'])assert.ok(html.includes(fragment),fragment);
});
