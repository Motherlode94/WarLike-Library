// WarLike prefab manifests: no executable code, references to real Library assets only.
export const PREFABS_KEY='warlike.library.prefabs.v1';
const cleanText=(v,n=100)=>typeof v==='string'&&v.trim().length&&v.length<=n?v.trim():null;
const finite=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
const componentDefaults={
 transform:{position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]},
 renderer:{visible:true,castShadow:true},
 collider:{enabled:false,shape:'box',isTrigger:false},
 animator:{enabled:false,defaultClip:''},
 rigidbody:{enabled:false,mass:1,useGravity:true}
};
export const supportedComponents=Object.keys(componentDefaults);
const validateComponent=(name,value)=>{
 if(!supportedComponents.includes(name)||!value||typeof value!=='object'||Array.isArray(value))throw Error('Composant non reconnu : '+name);
 const keys=Object.keys(componentDefaults[name]);if(Object.keys(value).some(k=>!keys.includes(k)))throw Error('Propriété de composant inconnue.');
 const v={...structuredClone(componentDefaults[name]),...value};
 if(name==='transform'){if(!['position','rotation','scale'].every(k=>Array.isArray(v[k])&&v[k].length===3&&v[k].every(n=>finite(n,k==='scale'?.001:-100000,k==='scale'?1000:100000))))throw Error('Transform invalide.');}
 if(name==='renderer'&&!['visible','castShadow'].every(k=>typeof v[k]==='boolean'))throw Error('Renderer invalide.');
 if(name==='collider'&&(typeof v.enabled!=='boolean'||typeof v.isTrigger!=='boolean'||!['box','sphere','capsule'].includes(v.shape)))throw Error('Collider invalide.');
 if(name==='animator'&&(typeof v.enabled!=='boolean'||typeof v.defaultClip!=='string'||v.defaultClip.length>160))throw Error('Animator invalide.');
 if(name==='rigidbody'&&(typeof v.enabled!=='boolean'||typeof v.useGravity!=='boolean'||!finite(v.mass,.001,100000)))throw Error('Rigidbody invalide.');
 return v;
};
export function createPrefab(asset,{id,name,parentId=null,components={}}={}){
 if(!asset||!cleanText(asset.id,150)||!['image','model'].includes(asset.kind))throw Error('Asset 2D ou 3D requis.');
 const prefab={schema:'warlike.prefab.v1',id:id||'prefab-'+asset.id,name:name||asset.name,assetId:asset.id,mode:asset.kind==='image'?'2d':'3d',parentId,components};
 return validatePrefab(prefab);
}
export function validatePrefab(item){
 if(item?.schema!=='warlike.prefab.v1'||!cleanText(item.id,160)||!cleanText(item.name,160)||!cleanText(item.assetId,160)||!['2d','3d'].includes(item.mode)||item.parentId!=null&&!cleanText(item.parentId,160)||item.id===item.parentId)throw Error('Définition prefab invalide.');
 if(!item.components||typeof item.components!=='object'||Array.isArray(item.components)||Object.keys(item.components).length>supportedComponents.length)throw Error('Composants invalides.');
 const components={};for(const [name,v] of Object.entries(item.components))components[name]=validateComponent(name,v);
 return {...item,components};
}
export function resolvePrefab(id,library,visited=new Set()){
 if(visited.has(id))throw Error('Héritage de prefabs cyclique.');
 const child=library.find(p=>p.id===id);if(!child)throw Error('Prefab introuvable : '+id);
 const item=validatePrefab(child);if(!item.parentId)return {...item,components:structuredClone(item.components)};
 visited.add(id);const parent=resolvePrefab(item.parentId,library,visited);
 if(item.assetId!==parent.assetId||item.mode!==parent.mode)throw Error('Une variante doit conserver le modèle et le mode de son parent.');
 return {...item,components:{...parent.components,...item.components}};
}
export function savePrefab(prefab,storage=globalThis.localStorage){
 const item=validatePrefab(prefab),list=readPrefabs(storage);
 const next=list.filter(p=>p.id!==item.id);next.push(item);
 if(next.length>500)throw Error('500 prefabs locaux maximum.');
 // Validate inheritance before writing, including cycles and mismatched assets.
 resolvePrefab(item.id,next);
 storage.setItem(PREFABS_KEY,JSON.stringify(next));return item;
}
export function readPrefabs(storage=globalThis.localStorage){
 let data;try{data=JSON.parse(storage.getItem(PREFABS_KEY)||'[]')}catch{throw Error('Bibliothèque de prefabs corrompue.')}
 if(!Array.isArray(data)||data.length>500)throw Error('Bibliothèque de prefabs invalide.');
 return data.map(validatePrefab);
}
export function exportPrefabPackage(id,prefabs,asset){
 const item=resolvePrefab(id,prefabs);
 if(!asset||asset.id!==item.assetId||asset.kind!==(item.mode==='2d'?'image':'model'))throw Error('Fichier source de prefab absent.');
 return {schema:'warlike.library.transfer.v1',version:1,prefab:item,asset:{id:asset.id,name:asset.name,kind:asset.kind,filename:asset.filename,license:asset.license||'Non précisée',sourceUrl:asset.sourceUrl||null,url:asset.url||null},requirements:['WarLike Engine import of model/sprite and components'],note:'Manifeste transportable. Les fichiers binaires ne sont pas intégrés et Engine doit résoudre/importer l’asset source avant instanciation.'};
}
