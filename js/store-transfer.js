import {inspectImportedBytes} from './import-validation.js';
import {MAX_FILE} from './core.js';
export const STORE_ORIGIN='https://warlike-asset-stores.pages.dev';
export function validStoreMessage(event,{opener,channel}){return !!opener&&event.source===opener&&event.origin===STORE_ORIGIN&&event.data?.channel===channel&&/^[a-f0-9]{40}$/.test(channel||'');}
const text=(v,max)=>typeof v==='string'&&v.trim()&&v.length<=max?v.trim():null;
export async function parseStoreAsset(pack,{digest=bytes=>crypto.subtle.digest('SHA-256',bytes),now=()=>new Date().toISOString()}={}){
 if(pack?.schema!=='warlike.store.asset.v1'||pack.version!==1||!pack.asset||!pack.binary)throw Error('Paquet Store non reconnu.');
 const a=pack.asset,b=pack.binary,name=text(a.name,160),filename=text(a.filename,180);
 if(!name||!filename||!/^[a-zA-Z0-9_. -]+\.(glb|png|webp|jpg|jpeg|ogg|wav)$/i.test(filename)||typeof a.id!=='string'||!a.id||a.id.length>180)throw Error('Métadonnées de ressource invalides.');
 const provider=new URL(a.providerUrl);if(provider.origin!==STORE_ORIGIN||!provider.pathname.startsWith('/assets/free/'))throw Error('Fournisseur non autorisé.');
 if(b.encoding!=='base64'||typeof b.data!=='string'||b.data.length>MAX_FILE*1.34||!Number.isSafeInteger(b.byteLength)||b.byteLength<1||b.byteLength>25*1024*1024||!/^[a-f0-9]{64}$/.test(b.sha256||''))throw Error('Contenu binaire invalide.');
 let bytes;try{const raw=atob(b.data);bytes=Uint8Array.from(raw,c=>c.charCodeAt(0))}catch{throw Error('Contenu binaire illisible.')}
 if(bytes.byteLength!==b.byteLength)throw Error('Taille binaire incohérente.');
 const actual=Array.from(new Uint8Array(await digest(bytes)),n=>n.toString(16).padStart(2,'0')).join('');if(actual!==b.sha256)throw Error('Empreinte SHA-256 incorrecte.');
 const info=inspectImportedBytes(filename,bytes.buffer),type=filename.split('.').at(-1).toLowerCase();
 const mime={glb:'model/gltf-binary',png:'image/png',webp:'image/webp',jpg:'image/jpeg',jpeg:'image/jpeg',ogg:'audio/ogg',wav:'audio/wav'}[type];
 return {id:'store-'+actual,name,filename,kind:info.kind,collection:text(a.collection,80)||'Store',tags:['Store',String(a.pack||'').slice(0,80)].filter(Boolean),author:text(a.author,100)||'Auteur non précisé',license:text(a.license,100)||'Licence non précisée',sourceUrl:typeof a.sourceUrl==='string'&&a.sourceUrl.startsWith('https://')?a.sourceUrl:null,thumbnail:(()=>{try{const u=new URL(a.thumbnail);return u.origin===STORE_ORIGIN&&u.pathname.startsWith('/assets/free/')?u.href:undefined}catch{return undefined}})(),providerUrl:provider.href,storeAssetId:a.id,blob:new Blob([bytes],{type:mime}),size:bytes.length,sha256:actual,addedAt:now(),width:Number(a.width)||0,height:Number(a.height)||0,sourceFrames:a.frames&&typeof a.frames==='object'?structuredClone(a.frames):null,...info};
}
export function planStoreImport(record,existing){
 const match=existing.find(x=>!x.deleted&&x.sha256===record.sha256);return match?{record:match,added:false}:{record,added:true};
}
