import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
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

test('Prefab Studio and Store inline scripts parse after UI updates',()=>{
 for(const path of ['prefab-studio.html','store.html']){
  const html=readFileSync(new URL('../'+path,import.meta.url),'utf8');
  const sources=[...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  assert.equal(sources.length,1,'one inline module in '+path);
  // Wrap to allow top-level await; parsing catches accidental syntax regressions.
  const source=sources[0].replace(/^import\s+[^;]+;\s*$/gm,'');
  new Script('(async()=>{'+source+'})()',{filename:path});
 }
});

test('Prefab Studio supports direct cross-origin transfer with manual fallback',()=>{
 const html=readFileSync(new URL('../prefab-studio.html',import.meta.url),'utf8');
 for(const token of ['id="directInstall"',"ENGINE_ORIGIN='https://warlike-engine.pages.dev'","warlike-engine-ready-v1","warlike-library-ping-v1","warlike-engine-installed-v1","event.origin!==ENGINE_ORIGIN","event.source!==receiver","preparePack()"])
  assert.ok(html.includes(token),'missing '+token);
});
