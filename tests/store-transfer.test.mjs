import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';
import {parseStoreAsset,validStoreMessage,planStoreImport,STORE_ORIGIN} from '../js/store-transfer.js';
import {createPrefab,exportPrefabPackage} from '../js/prefab-studio.js';
const bytes=readFileSync(new URL('../assets/quaternius-ultimatedanimatedcharacter-soldier-male.glb',import.meta.url));
const pack=()=>({schema:'warlike.store.asset.v1',version:1,asset:{id:'supplier-soldier',name:'Soldier',filename:'soldier.glb',author:'Quaternius',license:'CC0-1.0',providerUrl:STORE_ORIGIN+'/assets/free/quaternius/soldier.glb',sourceUrl:'https://quaternius.com/',collection:'Personnages'},binary:{encoding:'base64',data:bytes.toString('base64'),byteLength:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}});
test('Library verifies bytes, keeps the real animated GLB and makes an Engine-exportable prefab',async()=>{
 const p=pack(),r=await parseStoreAsset(p);assert.equal(r.kind,'model');assert.ok(r.animations.length>0);assert.equal(r.blob.size,bytes.length);assert.equal(r.author,'Quaternius');assert.equal(r.license,'CC0-1.0');assert.equal(r.providerUrl,p.asset.providerUrl);
 assert.equal(createHash('sha256').update(Buffer.from(await r.blob.arrayBuffer())).digest('hex'),p.binary.sha256);
 const prefab=createPrefab(r,{id:'store-prefab-test',name:r.name,components:{transform:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]}}});const out=exportPrefabPackage(prefab.id,[prefab],r);assert.equal(out.schema,'warlike.library.transfer.v1');assert.equal(out.asset.id,r.id);
});
test('tampered binary, foreign providers and malformed metadata never reach Library storage',async()=>{
 const p=pack();p.binary.sha256='0'.repeat(64);await assert.rejects(parseStoreAsset(p),/SHA/);
 const q=pack();q.asset.providerUrl='https://untrusted.invalid/model.glb';await assert.rejects(parseStoreAsset(q),/Fournisseur/);
 const a=pack();a.asset.filename='../bad.glb';await assert.rejects(parseStoreAsset(a),/Métadonnées/);
});
test('handshake binds the expected Store origin, opener and unpredictable channel',()=>{
 const opener={},channel='a'.repeat(40),event={origin:STORE_ORIGIN,source:opener,data:{channel}};assert.ok(validStoreMessage(event,{opener,channel}));assert.ok(!validStoreMessage({...event,source:{}},{opener,channel}));assert.ok(!validStoreMessage({...event,origin:'https://warlike-engine.pages.dev'},{opener,channel}));assert.ok(!validStoreMessage(event,{opener,channel:'b'.repeat(40)}));assert.ok(!validStoreMessage(event,{opener:null,channel}));
});
test('duplicate imports preserve user naming, favorites and prefab customization',async()=>{
 const record=await parseStoreAsset(pack()),edited={...record,name:'My soldier',favorite:true};const plan=planStoreImport(record,[edited]);assert.equal(plan.added,false);assert.equal(plan.record,edited);
});
