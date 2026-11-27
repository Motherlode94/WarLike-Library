import {inspectImportedBytes} from './import-validation.js';
const LIMIT=20*1024*1024,EXT=new Set(['png','jpg','jpeg','webp','gif','glb','wav','ogg','mp3','flac']);
const mime={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',glb:'model/gltf-binary',wav:'audio/wav',ogg:'audio/ogg',mp3:'audio/mpeg',flac:'audio/flac'};
function label(s){if(typeof s!=='string'||!s.trim()||s.length>100||/[\u0000-\u001f]/.test(s))throw Error('Métadonnées invalides');return s.trim();}
function rel(s){if(typeof s!=='string'||s.length>1024||s.includes('\\')||s.includes(':')||s.split('/').some(x=>!x||x.startsWith('.')||/[<>:"|?*\u0000-\u001f]/.test(x)||/[. ]$/.test(x)))throw Error('Chemin relatif invalide');return s;}
export async function parseLocalPack(pack,{digest=b=>crypto.subtle.digest('SHA-256',b),now=()=>new Date().toISOString()}={}){
 if(pack?.schema!=='warlike.local.assets.v1'||pack.version!==1||!Array.isArray(pack.assets)||!pack.assets.length||pack.assets.length>100)throw Error('Paquet local invalide');
 const records=[],paths=new Set();let total=0;
 for(const a of pack.assets){const relative=rel(a.path),filename=relative.split('/').at(-1),ext=filename.split('.').at(-1).toLowerCase();if(paths.has(relative)||filename!==a.filename||filename.length>180||!EXT.has(ext))throw Error('Fichier non admissible');paths.add(relative);
 if(a.encoding!=='base64'||!Number.isSafeInteger(a.byteLength)||a.byteLength<1||total+a.byteLength>LIMIT||typeof a.data!=='string'||a.data.length!==4*Math.ceil(a.byteLength/3)||!/^[a-f0-9]{64}$/.test(a.sha256||''))throw Error('Binaire invalide');
 let b;try{b=Uint8Array.from(atob(a.data),c=>c.charCodeAt(0))}catch{throw Error('Base64 invalide');}if(b.length!==a.byteLength)throw Error('Taille incorrecte');total+=b.length;
 const hash=Array.from(new Uint8Array(await digest(b)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==a.sha256)throw Error('SHA-256 incorrect');
 const info=inspectImportedBytes(filename,b.buffer);if(ext==='wav'&&(b.length<12||String.fromCharCode(...b.subarray(0,4))!=='RIFF'||String.fromCharCode(...b.subarray(8,12))!=='WAVE'))throw Error('WAV invalide');if(ext==='ogg'&&String.fromCharCode(...b.subarray(0,4))!=='OggS')throw Error('OGG invalide');if(ext==='flac'&&String.fromCharCode(...b.subarray(0,4))!=='fLaC')throw Error('FLAC invalide');if(ext==='mp3'&&!(String.fromCharCode(...b.subarray(0,3))==='ID3'||b.length>1&&b[0]===255&&(b[1]&224)===224))throw Error('MP3 invalide');
 records.push({id:'local-'+hash,name:filename.replace(/\.[^.]+$/,''),filename,kind:info.kind,collection:label(a.collection),tags:['MCP Local'],author:label(a.author),license:label(a.license),relativePath:relative,sourceUrl:null,blob:new Blob([b],{type:mime[ext]}),size:b.length,sha256:hash,addedAt:now(),...info});
 }
 return records;
}
export function planLocalImport(records,existing){const seen=new Set(existing.map(a=>a.sha256).filter(Boolean)),ids=new Set(existing.map(a=>a.id)),added=[],skipped=[];for(const r of records){if(seen.has(r.sha256)||ids.has(r.id)){skipped.push(r);continue}seen.add(r.sha256);ids.add(r.id);added.push(r);}return {added,skipped};}
