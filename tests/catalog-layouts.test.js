import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {catalogLayouts} from '../src/layouts/generated/catalog.js';
import {catalogPlans} from '../src/catalogPlans.js';
import {projects,apartmentHref,resolveRoute} from '../src/projects.js';
import {pointInPolygon,circleIntersectsBox,doorPose,wallSegments} from '../src/geometry.js';
import {connectedRooms} from '../scripts/audit-layouts.mjs';
import {destinationClear} from '../src/layouts/buildLayout.js';
import {projectDetails} from '../src/projectDetails.js';
import {messages} from '../src/i18n.js';
import {seoulFloors} from '../src/commercialPlans.js';

test('the five residential galleries preserve all 42 published choices and their source references',()=>{
 assert.equal(catalogLayouts.length,42);assert.equal(catalogPlans.length,42);
 assert.equal(new Set(catalogPlans.map(p=>p.id)).size,42);
 const expected={'urpaq-park':[54.21,54.21,78.88,78.88,84.84,114.73,122.62,152.64,154.73],hayat:[52.34,55.57,89.56,96.44,154.09],esentai:[36.71,37.02,40.70,41.33,44.67,45.74,51.41,56.04,65.66,66.01],tokyo:[47.08,52.24,75.49,89.38,100.59,110.12,158.06],'boston-tower':[41.34,41.59,44.58,46.91,53.95,66.78,67.81,71.93,73.46,100.70,106.56]};
 const references=JSON.parse(readFileSync(new URL('../src/referenceSources.json',import.meta.url)));
 for(const [id,areas] of Object.entries(expected)){const p=projects.find(p=>p.id===id);assert.deepEqual(p.plans.map(p=>p.area).sort((a,b)=>a-b),areas);}
 for(const p of catalogPlans){
  const l=catalogLayouts.find(l=>l.id===p.id),project=projects.find(project=>project.id===p.project);
  assert(l);assert.equal(resolveRoute(apartmentHref(project,p)).plan.id,p.id);
  assert.equal(l.furniture.filter(f=>f.kind==='bed').length,p.bedrooms);
  assert.equal(l.furniture.filter(f=>f.kind==='toilet').length,p.bathrooms);
  assert(l.furniture.some(f=>f.kind==='shower'),`${p.id}: no bathing fixture`);
  assert(l.furniture.some(f=>f.kind==='kitchen'));assert(l.furniture.some(f=>f.kind==='sofa'));
  assert(l.furniture.some(f=>f.kind.startsWith('dining')));
  assert(l.rooms.every(r=>r.area===null),'Room areas must not be guessed');
  assert.equal(p.evidence,p.project==='tokyo'?'render':'drawing');
  assert(references.some(r=>r.project===p.project&&r.file===p.reference));
  assert(existsSync(new URL('../public/references/'+p.reference.replace(/\.[^.]+$/,'.webp'),import.meta.url)));
  for(const r of l.rooms.filter(r=>r.id==='primary'||r.id.startsWith('bedroom')))assert(l.tourStops.some(s=>s.room===r.id));
 }
 for(const id of ['seoul','french-house'])assert.equal(projects.find(p=>p.id===id).plans.length,0,'Do not invent residential plans');
 assert.deepEqual(seoulFloors.map(f=>f.floor),Array.from({length:12},(_,i)=>i+1));
 assert.equal(seoulFloors[8].reference,'seoul-12.jpg');assert.equal(seoulFloors[9].reference,'seoul-11.jpg');assert.equal(seoulFloors[11].reference,'seoul-0.jpg');
 for(const info of Object.values(projectDetails))for(const feature of info.features)assert(feature in messages,feature);
});
for(const l of catalogLayouts)test(`${l.id}: walkthrough routes, room boundaries, furniture and doors remain clear`,()=>{
 assert.deepEqual(connectedRooms(l),[]);
 const boxes=l.furniture.map(f=>({x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation}));
 for(const stop of l.tourStops)for(const open of [false,true])assert(destinationClear(l,stop.position[0],stop.position[2],stop.room,.28,open));
 for(let i=0;i<l.furniture.length;i++){
  const f=l.furniture[i],r=l.rooms.find(r=>r.id===f.room);
  for(const dx of [-f.size[0]/2+.01,f.size[0]/2-.01])for(const dz of [-f.size[2]/2+.01,f.size[2]/2-.01]){
   const x=f.position[0]+dx*Math.cos(f.rotation)+dz*Math.sin(f.rotation),z=f.position[2]-dx*Math.sin(f.rotation)+dz*Math.cos(f.rotation);
   assert(pointInPolygon(x,z,r.polygon),`${f.id} outside ${r.id}`);
   for(let j=0;j<boxes.length;j++)if(i!==j)assert(!circleIntersectsBox(x,z,.005,boxes[j]),`${f.id} intersects ${l.furniture[j].id}`);
  }
 }
 for(const d of l.doors){const p=doorPose(d,d.swing*Math.PI/2);for(let at=.1;at<d.width;at+=.05)for(const box of boxes)assert(!circleIntersectsBox(d.hinge[0]+Math.cos(p.yaw)*at,d.hinge[1]-Math.sin(p.yaw)*at,.035,box),`${d.id} intersects furniture`);}
 const walls=l.walls.flatMap(w=>wallSegments(w)).filter(s=>s.position[1]-s.size[1]/2<1.6).map(s=>({x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2],yaw:s.yaw}));
 for(const d of l.doors){const p=doorPose(d,d.swing*Math.PI/2);for(let at=.15;at<d.width;at+=.1)assert(!walls.some(w=>circleIntersectsBox(d.hinge[0]+Math.cos(p.yaw)*at,d.hinge[1]-Math.sin(p.yaw)*at,.025,w)),`${d.id} intersects wall`);}
});
