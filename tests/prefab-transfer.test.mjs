import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPrefab,readPrefabs,savePrefab,resolvePrefab,exportPrefabPackage} from '../js/prefab-studio.js';
import {inspectImportedBytes} from '../js/import-validation.js';
const catalog=JSON.parse(readFileSync(new URL('../assets/catalog.json',import.meta.url),'utf8'));
const model=catalog.find(a=>a.kind==='model'&&a.url.endsWith('.glb'));
const image=catalog.find(a=>a.kind==='image'&&a.url.endsWith('.png'));
const store=()=>{const cache=new Map();return{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)}};
test('prefabs validate components, preserve inherited values and apply variants',()=>{
 const storage=store();
 const parent=savePrefab(createPrefab(model,{id:'base',name:'Base',components:{transform:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]},collider:{enabled:true,shape:'capsule',isTrigger:false}}}),storage);
 const child=savePrefab(createPrefab(model,{id:'variant',name:'Variant',parentId:parent.id,components:{renderer:{visible:true,castShadow:false}}}),storage);
 const result=resolvePrefab(child.id,readPrefabs(storage));
 assert.equal(result.components.collider.shape,'capsule');
 assert.equal(result.components.renderer.castShadow,false);
 assert.deepEqual(result.components.transform.scale,[1,1,1]);
 assert.throws(()=>savePrefab({...parent,parentId:child.id},storage),/cyclique/);
 assert.throws(()=>savePrefab({...child,assetId:'wrong'},storage),/conserver le modèle/);
});
test('prefab export preserves provenance while accurately declaring missing binary payload',()=>{
 const storage=store(),p=savePrefab(createPrefab(image,{id:'image-1',components:{renderer:{visible:true}}}),storage);
 const pkg=exportPrefabPackage(p.id,readPrefabs(storage),image);
 assert.equal(pkg.schema,'warlike.library.transfer.v1');
 assert.equal(pkg.asset.id,image.id);
 assert.equal(pkg.prefab.mode,'2d');
 assert.ok(pkg.note.includes('ne sont pas intégrés'));
});
test('import validates real bundled GLB and PNG and refuses disguised images',()=>{
 const glb=readFileSync(new URL('../'+model.url,import.meta.url));
 const png=readFileSync(new URL('../'+image.url,import.meta.url));
 const toBuffer=buffer=>buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength);
 assert.ok(inspectImportedBytes(model.filename,toBuffer(glb)).meshes>=1);
 assert.equal(inspectImportedBytes(image.filename,toBuffer(png)).kind,'image');
 assert.throws(()=>inspectImportedBytes('fake.png',new TextEncoder().encode('not an image').buffer),/PNG invalide/);
 assert.throws(()=>inspectImportedBytes('fake.gltf',new TextEncoder().encode('{"asset":{"version":"2.0"},"meshes":[],"buffers":[{"uri":"foo.bin"}]}').buffer),/externes/);
});
test('standalone Prefab Studio has source selection and export controls',()=>{
 const html=readFileSync(new URL('../prefab-studio.html',import.meta.url),'utf8');
 for(const id of ['source','parent','existing','components','download'])assert.ok(html.includes('id="'+id+'"'));
});
