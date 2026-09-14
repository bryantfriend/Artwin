import test from 'node:test';
import assert from 'node:assert/strict';
import {wiltonLayouts} from '../src/layouts/wiltonLayouts.js';
import {projects,apartmentHref,resolveRoute} from '../src/projects.js';
import {pointInPolygon,circleIntersectsBox,doorPose,wallPoint,wallSegments} from '../src/geometry.js';
import {connectedRooms} from '../scripts/audit-layouts.mjs';
import {destinationClear} from '../src/layouts/buildLayout.js';

test('Wilton tour viewpoints have room to stand with doors open or closed',()=>{
 for(const layout of wiltonLayouts)for(const stop of layout.tourStops)for(const open of [false,true])assert(destinationClear(layout,stop.position[0],stop.position[2],stop.room,.28,open),`${layout.id}/${stop.title}`);
});

test('the balcony has open railings, an exterior view and its own tour stop',()=>{
 const layout=wiltonLayouts.find(l=>l.id==='wilton-three-room-92'),balcony=layout.rooms.find(r=>r.id==='balcony');
 assert(balcony.outdoor);
 const perimeter=layout.walls.filter(w=>w.exterior&&w.roomIds.includes(balcony.id));
 // The west and north edges are exposed; the south end meets the living room.
 assert.equal(perimeter.length,2);
 for(const wall of perimeter){assert(wall.railing);for(const segment of wallSegments(wall))assert.equal(segment.position[1]+segment.size[1]/2,1.05);}
 assert(layout.walls.some(w=>w.roomIds.includes('primary')&&w.roomIds.includes('balcony')&&w.openings.some(o=>o.kind==='window')));
 assert(layout.tourStops.some(stop=>stop.room==='balcony'));
});

test('Wilton Park has three distinct supplied plans with matching routes and furniture counts',()=>{
 const project=projects.find(p=>p.id==='wilton-park');
 assert.deepEqual(project.plans.map(p=>p.area),[82.60,92.70,122.10]);
 assert.equal(new Set(wiltonLayouts.map(l=>JSON.stringify(l.rooms.map(r=>r.polygon)))).size,3);
 for(const plan of project.plans){const layout=wiltonLayouts.find(l=>l.id===plan.id);assert(layout);assert.equal(Number(layout.APARTMENT.advertisedArea),plan.area);assert.equal(layout.furniture.filter(f=>f.kind==='bed').length,plan.bedrooms);assert.equal(layout.rooms.filter(r=>r.id.startsWith('bath')).length,plan.bathrooms);assert.equal(resolveRoute(apartmentHref(project,plan)).plan,plan);assert(layout.rooms.every(r=>r.area===null),'Do not publish guessed room areas');}
});
for(const l of wiltonLayouts){
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
