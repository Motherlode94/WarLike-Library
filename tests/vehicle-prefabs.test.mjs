import test from 'node:test';
import assert from 'node:assert/strict';
import {createPrefab,resolvePrefab,savePrefab,readPrefabs} from '../js/prefab-studio.js';
import {inspectVehicleNodes,checkVehicleBindings} from '../js/vehicle-rig.js';
const model={id:'model-car',name:'Car',kind:'model'};
function glb(json){
 const encoded=new TextEncoder().encode(JSON.stringify(json)),pad=(4-encoded.length%4)%4,len=encoded.length+pad;
 const bytes=new Uint8Array(20+len),view=new DataView(bytes.buffer);
 view.setUint32(0,0x46546c67,true);view.setUint32(4,2,true);view.setUint32(8,bytes.length,true);
 view.setUint32(12,len,true);view.setUint32(16,0x4e4f534a,true);bytes.set(encoded,20);
 for(let i=0;i<pad;i++)bytes[20+encoded.length+i]=32;
 return bytes;
}
test('GLB node inspector reads source nodes without inventing joints',()=>{
 const nodes=inspectVehicleNodes(glb({asset:{version:'2.0'},nodes:[{name:'Body',children:[1,2]},{name:'Wheel_FL',mesh:0},{name:'Turret',mesh:1}]}));
 assert.equal(nodes.length,3);assert.equal(nodes[1].name,'Wheel_FL');
 assert.deepEqual(checkVehicleBindings({wheelFL:'Wheel_FL',turret:'Turret'},nodes),{valid:true,missing:[],ambiguous:[],assigned:2});
 assert.equal(checkVehicleBindings({doorL:'Missing'},nodes).valid,false);
 assert.throws(()=>inspectVehicleNodes(new Uint8Array(30)),/GLB invalide/);
});
test('vehicle prefabs validate wheel names, physics and script references',()=>{
 const p=createPrefab(model,{id:'car-1',components:{
  collider:{enabled:true,shape:'box',isTrigger:false},
  rigidbody:{enabled:true,mass:1450,useGravity:true},
  vehicle:{enabled:true,drive:'wheels',maxSpeed:30,steeringAngle:35,parts:{wheelFL:'Wheel_FL',wheelFR:'Wheel_FR'}},
  scripts:{enabled:true,entries:['VehicleController.wls','BrakeLights.js']}
 }});
 assert.equal(p.components.vehicle.parts.wheelFL,'Wheel_FL');
 assert.equal(p.components.rigidbody.mass,1450);
 assert.equal(p.components.scripts.entries.length,2);
 assert.throws(()=>createPrefab(model,{components:{vehicle:{enabled:true,parts:{wheelFL:'same',wheelFR:'same'}}}}),/plusieurs articulations/);
 assert.throws(()=>createPrefab(model,{components:{scripts:{enabled:true,entries:['../hack.js']}}}),/invalides/);
 assert.throws(()=>createPrefab({...model,kind:'image'},{components:{vehicle:{enabled:true}}}),/véhicule 3D/);
 const mem=new Map(),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v)};
 savePrefab(p,storage);
 const variant=createPrefab(model,{id:'car-sport',parentId:p.id,components:{renderer:{visible:true,castShadow:true}}});
 savePrefab(variant,storage);
 assert.equal(resolvePrefab('car-sport',readPrefabs(storage)).components.vehicle.parts.wheelFL,'Wheel_FL');
});
test('Prefab Studio exposes real GLB inspection and vehicle controls',()=>{
 const {readFileSync}=await import('node:fs');
 const html=readFileSync(new URL('../prefab-studio.html',import.meta.url),'utf8');
 for(const phrase of ['inspectSelectedVehicle','vehiclePartNames','component-vehicle','checkVehicleBindings','vehicleSpeed'])assert.ok(html.includes(phrase));
});
