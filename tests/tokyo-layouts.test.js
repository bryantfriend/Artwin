import test from 'node:test';
import assert from 'node:assert/strict';
import {layouts,getLayout} from '../src/layouts/index.js';
import {additionalLayouts} from '../src/layouts/tokyoLayouts.js';
import {projects,resolveRoute,apartmentHref} from '../src/projects.js';
import {pointInPolygon,doorPose,circleIntersectsBox} from '../src/geometry.js';
import {connectedRooms} from '../scripts/audit-layouts.mjs';

test('Tokyo City exposes six distinct furnished plans, without duplicating the 82.30 reference',()=>{
 const project=projects.find(p=>p.id==='tokyo-city');
 assert.deepEqual(project.plans.map(p=>p.area),[52.10,70.33,78.83,82.30,106.01,134.68]);
 assert.equal(new Set(layouts.map(l=>JSON.stringify(l.rooms.map(r=>r.polygon)))).size,6);
 for(const plan of project.plans){
  const l=getLayout(plan.id);assert(l);assert.equal(Number(l.APARTMENT.advertisedArea),plan.area);
  assert.equal(l.furniture.filter(f=>f.kind==='bed').length,plan.bedrooms);
  assert.equal(l.rooms.filter(r=>r.id.startsWith('bath')).length,plan.bathrooms);
  assert.equal(resolveRoute(apartmentHref(project,plan)).plan,plan);
  assert.equal(resolveRoute(apartmentHref({id:'tokyo'},plan)).kind,'missing');
 }
});
for(const l of additionalLayouts){
 test(`${l.APARTMENT.advertisedArea} m² has walkable connections from the hall to every room`,()=>{
  assert.deepEqual(connectedRooms(l),[],'A room is isolated by an open door or furniture');
  for(const f of l.furniture){
   const r=l.rooms.find(r=>r.id===f.room);assert(r);
   for(const dx of [-f.size[0]/2+.01,f.size[0]/2-.01])for(const dz of [-f.size[2]/2+.01,f.size[2]/2-.01]){
    const x=f.position[0]+dx*Math.cos(f.rotation)+dz*Math.sin(f.rotation),z=f.position[2]-dx*Math.sin(f.rotation)+dz*Math.cos(f.rotation);
    assert(pointInPolygon(x,z,r.polygon),`${f.id} extends outside ${r.id}`);
   }
  }
 });
 test(`${l.APARTMENT.advertisedArea} m² open door leaves clear the furniture`,()=>{
  for(const d of l.doors){const p=doorPose(d,d.swing*Math.PI/2);
   for(let t=.15;t<d.width;t+=.05){const x=d.hinge[0]+Math.cos(p.yaw)*t,z=d.hinge[1]-Math.sin(p.yaw)*t;
    for(const f of l.furniture)assert(!circleIntersectsBox(x,z,.035,{x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation}),`${d.id} intersects ${f.id}`);
   }
  }
 });
}
