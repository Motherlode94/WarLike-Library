import {openStore,readAll,writeMany} from './js/storage.js';
import {inspectImportedBytes} from './js/import-validation.js';
import {MAX_FILE} from './js/core.js';
const ASSETS=[{"id":"ID-INF-01","name":"Fusilier","usage":"Personnages"},{"id":"ID-INF-02","name":"Médecin","usage":"Personnages"},{"id":"ID-INF-03","name":"Ingénieur","usage":"Personnages"},{"id":"ID-ARM-01","name":"Transport blindé 6×6","usage":"Véhicules"},{"id":"ID-ARM-02","name":"Char lourd","usage":"Véhicules"},{"id":"ID-ARM-03","name":"Reconnaissance","usage":"Véhicules"},{"id":"ID-LOG-01","name":"Camion de ravitaillement","usage":"Véhicules"},{"id":"ID-LOG-02","name":"Ambulance","usage":"Véhicules"},{"id":"ID-DRN-01","name":"Drone terrestre","usage":"Personnages"},{"id":"ID-DRN-02","name":"Drone aérien","usage":"Véhicules"},{"id":"ID-ENV-01","name":"Barricade en béton","usage":"Environnements"},{"id":"ID-ENV-02","name":"Tour de guet","usage":"Bâtiments"}];
const $=id=>document.getElementById(id);
let dbReady=false,records=[];
const say=text=>{$('status').textContent=text};
function render(){
 const map=new Map(records.map(x=>[x.id,x]));
 $('models').replaceChildren(...ASSETS.map(a=>{
  const r=map.get('meshy-'+a.id),card=document.createElement('article');card.className='card';
  const name=document.createElement('strong');name.textContent=a.id+' · '+a.name;
  const status=document.createElement('span');status.className='status '+(r?'ready':'missing');status.textContent=r?'GLB installé dans la bibliothèque':'GLB à importer';
  const details=document.createElement('small');details.textContent=r?(Math.round(r.size/1024)+' Ko · SHA-256 '+r.sha256.slice(0,14)+'…'):'Modèle Meshy généré · octets GLB non encore présents ici';
  const btn=document.createElement('button');btn.textContent=r?'Exporter ce GLB':'Importer ce GLB';
  btn.onclick=()=>{if(r){const url=URL.createObjectURL(r.blob),link=document.createElement('a');link.href=url;link.download=a.id+'.glb';link.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}else{$('assetId').value=a.id;$('files').click()}};
  card.append(name,status,details,btn);return card;
 }));
 $('count').textContent=ASSETS.filter(a=>map.has('meshy-'+a.id)).length+' / '+ASSETS.length+' GLB installés';
}
async function importFiles(files){
 if(!dbReady)throw Error('Stockage IndexedDB indisponible.');
 const results=[],toSave=[];
 for(const file of files){
  const id=file.name.match(/ID-(?:INF|ARM|LOG|DRN|ENV)-\d\d/i)?.[0]?.toUpperCase()||(files.length===1?$('assetId').value:null);
  const info=ASSETS.find(a=>a.id===id);
  if(!info){results.push(file.name+' : identifiant absent. Renomme en ID-INF-01.glb, par exemple.');continue}
  if(!file.name.toLowerCase().endsWith('.glb')||!file.size||file.size>MAX_FILE){results.push(file.name+' : GLB requis, maximum 32 Mo.');continue}
  try{
   const buffer=await file.arrayBuffer();const meta=inspectImportedBytes(file.name,buffer);
   if(meta.kind!=='model')throw Error('Fichier non reconnu comme modèle 3D.');
   const digest=await crypto.subtle.digest('SHA-256',buffer);
   const sha=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
   toSave.push({id:'meshy-'+info.id,name:info.name,filename:info.id+'.glb',kind:'model',
    collection:'Iron Defiance',tags:['Meshy','Iron Defiance','military',info.usage],description:'Modèle 3D original Iron Defiance généré via Meshy',author:'WarLike',
    license:'Selon les conditions Meshy applicables',addedAt:new Date().toISOString(),size:file.size,sha256:sha,
    blob:new Blob([buffer],{type:'model/gltf-binary'}),favorite:false,deleted:false});
   results.push(info.id+' : import validé.');
  }catch(error){results.push(info.id+' : '+error.message)}
 }
 if(toSave.length){await writeMany(toSave);records=await readAll()}
 render();say(results.join('\n')||'Aucun fichier importé.');
}
$('files').onchange=e=>{importFiles([...e.target.files]).catch(err=>say(err.message)).finally(()=>e.target.value='')};
try{await openStore();dbReady=true;records=await readAll();render();say('Bibliothèque locale prête : sélectionne les GLB Meshy.')}catch(err){say('Stockage local impossible : '+err.message);render()}
