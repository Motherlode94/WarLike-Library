// Read-only asset metadata for WarLike Library. No eval, no external glTF references.
const modelExtensions=new Set(['glb','gltf']);
const imageExtensions=new Set(['png','jpg','jpeg','webp','svg','gif']);
const kindOf=(name)=>String(name||'').split('.').pop().toLowerCase();
function inspectDocument(doc,byteLength,format){
 if(doc?.asset?.version!=='2.0'||!Array.isArray(doc.meshes)||!Array.isArray(doc.nodes))throw Error('Document glTF 2.0 invalide.');
 const primitives=doc.meshes.reduce((sum,m)=>sum+(m.primitives?.length||0),0);
 const vertices=doc.meshes.reduce((sum,m)=>sum+(m.primitives||[]).reduce((n,p)=>n+(doc.accessors?.[p.attributes?.POSITION]?.count||0),0),0);
 const triangles=doc.meshes.reduce((sum,m)=>sum+(m.primitives||[]).reduce((n,p)=>{
  const count=p.indices===undefined?(doc.accessors?.[p.attributes?.POSITION]?.count||0):(doc.accessors?.[p.indices]?.count||0);
  const mode=p.mode??4;
  return n+(mode===4?Math.floor(count/3):mode===5||mode===6?Math.max(0,count-2):0);
 },0),0);
 const skins=doc.skins?.length||0,animations=(doc.animations||[]).map((a,i)=>a.name||'Clip '+(i+1));
 return {format,bytes:byteLength,meshes:doc.meshes.length,primitives,vertices,triangles,materials:doc.materials?.length||0,textures:doc.textures?.length||0,skins,animations,rigged:skins>0,nodes:doc.nodes.length};
}
export function inspect3D(buffer,name){
 if(!(buffer instanceof ArrayBuffer))throw Error('Données 3D absentes.');
 if(buffer.byteLength>32*1024*1024)throw Error('Modèle trop volumineux pour l’inspection.');
 const format=kindOf(name);
 if(!modelExtensions.has(format))throw Error('Format de modèle non reconnu.');
 let doc;
 if(format==='glb'){
  if(buffer.byteLength<20)throw Error('GLB trop court.');
  const view=new DataView(buffer),length=view.getUint32(12,true);
  if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==buffer.byteLength||view.getUint32(16,true)!==0x4e4f534a||length>buffer.byteLength-20)throw Error('GLB 2.0 incorrect.');
  doc=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,20,length)).replace(/\\u0000+$/g,'').trim());
 }else doc=JSON.parse(new TextDecoder().decode(buffer));
 return inspectDocument(doc,buffer.byteLength,format.toUpperCase());
}
export function imageMode(name){const ext=kindOf(name);return imageExtensions.has(ext)?ext.toUpperCase():'IMAGE'}
export function formatAssetBytes(n){return n>=1024*1024?(n/1048576).toFixed(2)+' Mo':(n/1024).toFixed(1)+' Ko'}
