import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../assets/catalog.json',import.meta.url),'utf8'));
const verified=a=>['Kenney','Quaternius'].includes(a.author)&&a.license==='CC0-1.0'&&a.sourceUrl?.startsWith('https://')&&((a.kind==='model'&&a.filename?.endsWith('.glb'))||(a.kind==='image'&&/\\.(png|webp)$/i.test(a.filename||'')));
test('authentic 2D and 3D pack resources have real bundled files and provenance',()=>{
 const group=catalog.filter(verified);
 assert.ok(group.filter(a=>a.kind==='model').length>=10);
 assert.ok(group.filter(a=>a.kind==='image').length>=6);
 for(const a of group){
   assert.match(a.url,/^[.]\\/assets\\/[a-z0-9_./-]+$/i);
   const file=readFileSync(new URL('../'+a.url,import.meta.url));
   assert.equal(file.length,a.size,a.filename+' size mismatch');
   if(a.kind==='model'){
     assert.equal(file.toString('ascii',0,4),'glTF',a.filename+' is not a real GLB');
   }else{
     const signature=file.subarray(0,8).toString('hex');
     assert.ok(signature==='89504e470d0a1a0a'||file.toString('ascii',0,4)==='RIFF',a.filename+' not PNG/WebP');
   }
 }
});
test('procedural WarLike community files are not mislabeled as authentic publisher assets',()=>{
 for(const a of catalog.filter(a=>a.url?.startsWith('./assets/community/')))assert.ok(!verified(a),a.filename);
});
