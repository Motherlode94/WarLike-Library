import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname} from 'node:path';
const queue=JSON.parse(await readFile('assets/import-queue.json','utf8'));
if(queue.schema!=='warlike.library.import-queue.v1')throw Error('Import manifest unsupported');
const data=JSON.parse(await readFile('assets/catalog.json','utf8'));
const current=new Set(data.map(a=>a.id));const entries=queue.entries,failures=[],results=[];
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const hash=b=>createHash('sha256').update(b).digest('hex');
const remote=e=>`https://raw.githubusercontent.com/${e.sourceRepo}/${e.ref}/${e.path.split('/').map(encodeURIComponent).join('/')}`;
const metadata=buffer=>{
 if(buffer.length<20||buffer.toString('ascii',0,4)!=='glTF')throw Error('Not a GLB');
 const d=new DataView(buffer.buffer,buffer.byteOffset,buffer.byteLength),len=d.getUint32(12,true);
 if(d.getUint32(4,true)!==2||d.getUint32(8,true)!==buffer.length||d.getUint32(16,true)!==0x4e4f534a||len>buffer.length-20)throw Error('GLB header invalid');
 const json=JSON.parse(buffer.subarray(20,20+len).toString('utf8').replace(/\u0000+$/g,'').trim());
 if(json.asset?.version!=='2.0'||!json.meshes?.length)throw Error('GLB mesh missing');
 const triangles=(json.meshes||[]).flatMap(x=>x.primitives||[]).reduce((sum,p)=>{const count=json.accessors?.[p.indices??p.attributes?.POSITION]?.count||0;return sum+((p.mode??4)===4?Math.floor(count/3):0)},0);
 return {meshes:json.meshes.length,animations:(json.animations||[]).map((a,i)=>a.name||'Clip '+(i+1)),triangles};
};
const download=async(url)=>{
 let err;for(let retry=0;retry<4;retry++){try{const response=await fetch(url,{headers:{'User-Agent':'WarLike-Library-CC0-Asset-Importer'}});if(!response.ok)throw Error('HTTP '+response.status);return Buffer.from(await response.arrayBuffer())}catch(e){err=e;await new Promise(r=>setTimeout(r,400*(retry+1)**2))}}throw err;
};
const limited=async(list,task,workers=8)=>{let cursor=0;await Promise.all(Array.from({length:workers},async()=>{while(cursor<list.length){const idx=cursor++;try{await task(list[idx])}catch(e){failures.push(list[idx].path+': '+e.message)}}}))};
await limited(entries,async e=>{
 if(!['model','image'].includes(e.kind)||!/^(?:assets\/kenney-expanded\/)(?:2d|3d)\//.test(e.dest)||e.dest.includes('..')||e.path.includes('..')||!/^[a-f0-9]{40}$/.test(e.ref)||e.size<50)throw Error('Unsafe import metadata');
 let bytes;try{if((await stat(e.dest)).size===e.size)bytes=await readFile(e.dest)}catch{}
 if(!bytes)bytes=await download(remote(e));
 if(bytes.length!==e.size)throw Error('Source byte size mismatch: expected '+e.size+', got '+bytes.length);
 let details={};if(e.kind==='model')details=metadata(bytes);
 else if(bytes.length<24||bytes.toString('hex',0,8)!=='89504e470d0a1a0a'||bytes.toString('ascii',12,16)!=='IHDR')throw Error('Invalid PNG signature');
 await mkdir(dirname(e.dest),{recursive:true});await writeFile(e.dest,bytes);
 const name=e.path.split('/').at(-1).replace(/\.(png|glb)$/i,'').replace(/[-_]+/g,' ');
 const assetId='builtin-kenney-expanded-'+e.kind+'-'+slug(e.pack)+'-'+hash(Buffer.from(e.path)).slice(0,12);
 const collection=e.collection;
 const item={id:assetId,name:name.charAt(0).toUpperCase()+name.slice(1),filename:e.dest.split('/').at(-1),kind:e.kind,collection,tags:[e.pack,'Kenney',e.kind==='model'?'3D GLB':'2D PNG'],size:bytes.length,url:'./'+e.dest,author:'Kenney',license:'CC0-1.0',sourceUrl:'https://kenney.nl/assets/'+slug(e.pack),sourceRepository:'https://github.com/'+e.sourceRepo,sourceRevision:e.ref,sourceFile:e.path,addedAt:'2026-11-07T00:00:00Z',sha256:hash(bytes),description:e.pack+' · Original Kenney CC0 · '+(e.kind==='model'?'vrai modèle 3D GLB':'vrai sprite PNG'),...(e.kind==='model'?details:{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)})};
 if(e.kind==='model'&&e.thumb){const thumbnailDest=e.dest.replace('/3d/','/thumbs/').replace(/\.glb$/i,'.webp');try{let thumb;try{thumb=await readFile(thumbnailDest)}catch{thumb=await download(remote({...e,path:e.thumb}))}
 if(thumb.toString('ascii',0,4)==='RIFF'&&thumb.toString('ascii',8,12)==='WEBP'){await mkdir(dirname(thumbnailDest),{recursive:true});await writeFile(thumbnailDest,thumb);item.thumbnail='./'+thumbnailDest;}}
 catch(error){console.warn('Optional thumbnail missing:',e.path,error.message)}}
 results.push(item);
});
if(failures.length){console.error(failures.join('\n'));throw Error(failures.length+' asset imports failed; catalog will not be updated');}
const existingIds=new Set(data.map(a=>a.id));
const added=results.filter(a=>!existingIds.has(a.id)).sort((a,b)=>a.id.localeCompare(b.id));
data.push(...added);await writeFile('assets/catalog.json',JSON.stringify(data,null,2)+'\n');
const packManifest=JSON.parse(await readFile('assets/packs.json','utf8'));
for(const type of ['model','image'])for(const pack of [...new Set(results.filter(a=>a.kind===type).map(a=>a.tags[0]))]){
 const items=results.filter(a=>a.kind===type&&a.tags[0]===pack);
 const id='kenney-'+(type==='model'?'3d':'2d')+'-'+slug(pack);
 const record={id,name:'Kenney '+pack+' · '+(type==='model'?'3D GLB':'2D PNG'),category:items[0].collection,format:type==='model'?'glb':'png',status:type==='model'?'art-assets':'sprite-assets',assetIds:items.map(a=>a.id).sort(),notes:'Fichiers Kenney CC0 réels inclus dans le dépôt ; comportements de jeu, physique et animations non garantis.'};
 const idx=packManifest.packs.findIndex(x=>x.id===id);if(idx<0)packManifest.packs.push(record);else packManifest.packs[idx]=record;
}
await writeFile('assets/packs.json',JSON.stringify(packManifest,null,2)+'\n');
console.log(JSON.stringify({downloaded:results.length,added:added.length,total:data.length,models:results.filter(a=>a.kind==='model').length,sprites:results.filter(a=>a.kind==='image').length,thumbnails:results.filter(a=>a.thumbnail).length,packs:packManifest.packs.length},null,2));
