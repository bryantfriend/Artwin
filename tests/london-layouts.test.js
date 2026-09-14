import test from 'node:test';
import assert from 'node:assert/strict';
import {londonLayouts} from '../src/layouts/londonLayouts.js';
import {projects,apartmentHref,resolveRoute} from '../src/projects.js';
import {pointInPolygon,circleIntersectsBox,doorPose,wallPoint,wallSegments} from '../src/geometry.js';
import {connectedRooms} from '../scripts/audit-layouts.mjs';

test('London Square has four distinct supplied plans with matching routes and furniture counts',()=>{
 const project=projects.find(p=>p.id==='london-square');
 assert.deepEqual(project.plans.map(p=>p.area),[71.95,100.72,110.13,131.20]);
 assert.equal(new Set(londonLayouts.map(l=>JSON.stringify(l.rooms.map(r=>r.polygon)))).size,4);
 for(const plan of project.plans){const layout=londonLayouts.find(l=>l.id===plan.id);assert(layout);assert.equal(Number(layout.APARTMENT.advertisedArea),plan.area);assert.equal(layout.furniture.filter(f=>f.kind==='bed').length,plan.bedrooms);assert.equal(layout.rooms.filter(r=>r.id.startsWith('bath')).length,plan.bathrooms);assert.equal(resolveRoute(apartmentHref(project,plan)).plan,plan);assert(layout.rooms.every(r=>r.area===null),'Do not publish guessed room areas');}
});
for(const l of londonLayouts){
 test(`${l.id}: furniture footprints do not overlap`,()=>{
  const corners=f=>[-1,1].flatMap(s=>[-1,1].map(t=>{const x=s*(f.size[0]/2-.01),z=t*(f.size[2]/2-.01),c=Math.cos(f.rotation),n=Math.sin(f.rotation);return [f.position[0]+x*c+z*n,f.position[2]-x*n+z*c];}));
  for(let i=0;i<l.furniture.length;i++)for(let j=i+1;j<l.furniture.length;j++){
   const a=l.furniture[i],b=l.furniture[j],ac=corners(a),bc=corners(b);
   const separated=[a.rotation,a.rotation+Math.PI/2,b.rotation,b.rotation+Math.PI/2].some(yaw=>{
    const axis=[Math.cos(yaw),-Math.sin(yaw)],ap=ac.map(p=>p[0]*axis[0]+p[1]*axis[1]),bp=bc.map(p=>p[0]*axis[0]+p[1]*axis[1]);return Math.min(...ap)>=Math.max(...bp)||Math.min(...bp)>=Math.max(...ap);
   });assert(separated,`${a.id} overlaps ${b.id}`);
  }
 });
 test(`${l.id}: every room is reachable and furniture stays within its room`,()=>{
  assert.deepEqual(connectedRooms(l),[]);
  for(const f of l.furniture){const r=l.rooms.find(r=>r.id===f.room);
   for(const dx of [-f.size[0]/2+.01,f.size[0]/2-.01])for(const dz of [-f.size[2]/2+.01,f.size[2]/2-.01])assert(pointInPolygon(f.position[0]+dx*Math.cos(f.rotation)+dz*Math.sin(f.rotation),f.position[2]-dx*Math.sin(f.rotation)+dz*Math.cos(f.rotation),r.polygon),`${f.id} outside ${r.id}`);
  }
 });
 test(`${l.id}: open doors do not intersect furniture`,()=>{
  for(const d of l.doors){const p=doorPose(d,d.swing*Math.PI/2);for(let t=.1;t<d.width;t+=.05)for(const f of l.furniture)assert(!circleIntersectsBox(d.hinge[0]+Math.cos(p.yaw)*t,d.hinge[1]-Math.sin(p.yaw)*t,.035,{x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation}),`${d.id} intersects ${f.id}`);}
 });
}
test('bay walls retain their traced angle and window openings in collision geometry',()=>{
 const l=londonLayouts.at(-1),bay=l.walls.filter(w=>w.axis==='diagonal');assert(bay.length>=4);
 for(const w of bay){const end=wallPoint(w,w.length);assert(l.rooms[0].polygon.some(p=>Math.hypot(p[0]-end[0],p[1]-end[1])<.001));for(const s of wallSegments(w))assert.equal(s.yaw,w.yaw);}
 assert(bay.filter(w=>w.openings.length).length>=3);
});
