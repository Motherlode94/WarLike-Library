// Inspect actual GLB nodes before binding moving vehicle parts.
// Reading node names does not create joints, physics or an Engine controller.
export function inspectVehicleNodes(bytes){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(b.byteLength<20)throw Error('GLB trop court.');
 const view=new DataView(b.buffer,b.byteOffset,b.byteLength);
 if(view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==b.byteLength)throw Error('GLB invalide.');
 let p=12,json=null;
 while(p+8<=b.byteLength){
  const length=view.getUint32(p,true),type=view.getUint32(p+4,true);p+=8;
  if(length>b.byteLength-p)throw Error('Bloc GLB tronqué.');
  if(type===0x4e4f534a){
   if(json!==null)throw Error('Plusieurs blocs JSON.');
   json=JSON.parse(new TextDecoder().decode(b.subarray(p,p+length)).trim());
  }
  p+=length;
 }
 if(p!==b.byteLength||!json||json.asset?.version!=='2.0'||!Array.isArray(json.nodes))throw Error('Structure GLB sans nœuds valides.');
 const nodes=json.nodes.map((n,i)=>({index:i,name:typeof n.name==='string'?n.name:'',mesh:Number.isInteger(n.mesh)?n.mesh:null,children:Array.isArray(n.children)?n.children:[]}));
 if(nodes.some(n=>n.children.some(i=>!Number.isInteger(i)||i<0||i>=nodes.length)))throw Error('Hiérarchie de nœuds invalide.');
 return nodes;
}
export function checkVehicleBindings(parts,nodes){
 const names=new Map();for(const n of nodes)if(n.name)names.set(n.name,(names.get(n.name)||0)+1);
 const assigned=Object.entries(parts).filter(([,name])=>!!name);
 const missing=assigned.filter(([,name])=>!names.has(name)).map(([part,name])=>part+': '+name);
 const ambiguous=assigned.filter(([,name])=>names.get(name)>1).map(([part,name])=>part+': '+name);
 return {valid:missing.length===0&&ambiguous.length===0,missing,ambiguous,assigned:assigned.length};
}
