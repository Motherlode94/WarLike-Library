import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../prefab-studio.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../css/prefab-studio-workspace.css',import.meta.url),'utf8');
test('Prefab Studio has library, inspector and resolved preview visible in separate panels',()=>{
 for(const c of ['prefab-workspace','prefab-library','prefab-inspector','prefab-result','prefab-actionbar'])assert.ok(html.includes(c));
 assert.ok(html.includes('css/prefab-studio-workspace.css'));
 assert.match(css,/grid-template-columns:.*minmax/);
});
test('editing and export controls preserve unique IDs and existing functionality hooks',()=>{
 for(const id of ['source','existing','parent','name','components','preview','status','save','load','delete','reset','directInstall','download']){
  const matches=[...html.matchAll(new RegExp('id="'+id+'"','g'))];
  assert.equal(matches.length,1,id);
 }
 assert.ok(html.includes("$('directInstall').onclick"));
 assert.ok(html.includes("$('download').onclick"));
});
test('component tabs retain all supported prefab groups and do not remove fields',()=>{
 for(const cat of ['transform','renderer','physics','animator','vehicle','scripts'])assert.ok(html.includes("['"+cat+"'"));
 assert.ok(html.includes('organizePrefabFields(host)'));
 assert.ok(html.includes('groups.get(which(child)).append(child)'));
 assert.match(css,/prefab-component-group\[hidden\]\{display:none!important\}/);
 for(const id of ['overrideTransform','position','rotation','scale','castShadow','colliderShape','animatorClip','mass','vehicleSpeed','vehicleSteering','vehicleDrive','scriptEntries','vehicleNodes'])assert.ok(html.includes("'"+id+"'"),id);
});
