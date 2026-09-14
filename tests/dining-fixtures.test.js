import test from 'node:test';
import assert from 'node:assert/strict';
import {layouts,getLayout} from '../src/layouts/index.js';
import {diningFixtures} from '../src/diningFixtures.js';
import {pointInPolygon,circleIntersectsBox,wallSegments} from '../src/geometry.js';

test('all six kitchen tables meet a wall at their short end and their seating clears other furniture',()=>{
  let count=0;
  const bounds=f=>{const c=Math.abs(Math.cos(f.rotation||0)),s=Math.abs(Math.sin(f.rotation||0));return {x:f.position[0],z:f.position[2],w:f.size[0]*c+f.size[2]*s,d:f.size[0]*s+f.size[2]*c};};
  for(const layout of layouts)for(const table of layout.furniture.filter(f=>['breakfast','diningCompact'].includes(f.kind))){
    count++;
    const yaw=table.rotation||0,[x,,z]=table.position,context=`${layout.id}/${table.id}`;
    const walls=layout.walls.flatMap(w=>wallSegments(w)).filter(s=>s.position[1]-s.size[1]/2<.78).map(s=>({x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2]}));
    // Sample across the short tabletop edge, including under kitchen windows.
    for(const side of [-.25,0,.25]){
      const edge=[x+side*Math.cos(yaw)-table.size[2]/2*Math.sin(yaw),z-side*Math.sin(yaw)-table.size[2]/2*Math.cos(yaw)];
      assert(!walls.some(w=>circleIntersectsBox(...edge,.005,w)),`${context}: tabletop penetrates wall`);
      assert([.02,.04,.06,.08].some(gap=>walls.some(w=>circleIntersectsBox(edge[0]-gap*Math.sin(yaw),edge[1]-gap*Math.cos(yaw),.005,w))),`${context}: short end is not against wall`);
    }
    const a=bounds(table);
    for(const item of layout.furniture.filter(f=>f!==table)){
      const b=bounds(item);
      assert(Math.abs(a.x-b.x)>=(a.w+b.w)/2-.001||Math.abs(a.z-b.z)>=(a.d+b.d)/2-.001,`${context}: seating overlaps ${item.id}`);
    }
  }
  assert.equal(count,6);
});

test('every dining table has a chandelier centered inside its room and table surface',()=>{
  let count=0;
  for(const layout of layouts){
    const fixtures=diningFixtures(layout);
    const tables=layout.furniture.filter(f=>['dining','diningCompact','breakfast','diningRound'].includes(f.kind));
    assert.deepEqual(fixtures.map(f=>f.id),tables.map(t=>t.id));
    for(const fixture of fixtures){
      const table=tables.find(t=>t.id===fixture.id),room=layout.rooms.find(r=>r.id===fixture.room);
      assert(room,`Missing switch room for ${layout.id}/${table.id}`);
      const dx=fixture.position[0]-table.position[0],dz=fixture.position[2]-table.position[2],yaw=table.rotation||0;
      const local=[dx*Math.cos(yaw)-dz*Math.sin(yaw),dx*Math.sin(yaw)+dz*Math.cos(yaw)];
      // Measured tabletop centers/extents exclude the seating footprint.
      const surface=table.kind==='diningRound'?[0,0,.62*table.size[0]/2.35,.62*table.size[2]/2.35]:['breakfast','diningCompact'].includes(table.kind)?[0,0,.35*table.size[0]/1.78,.6*table.size[2]/1.2]:[0,0,.57*table.size[0]/2.2,1.15*table.size[2]/3];
      assert(Math.abs(local[0]-surface[0])<1e-8&&Math.abs(local[1]-surface[1])<1e-8,`${layout.id}/${table.id} is off center`);
      assert(fixture.radii[0]<surface[2]&&fixture.radii[1]<surface[3],'Chandelier extends past tabletop');
      for(let a=0;a<Math.PI*2;a+=Math.PI/8){
        const x=Math.cos(a)*fixture.radii[0],z=Math.sin(a)*fixture.radii[1];
        assert(pointInPolygon(fixture.position[0]+x*Math.cos(yaw)+z*Math.sin(yaw),fixture.position[2]-x*Math.sin(yaw)+z*Math.cos(yaw),room.polygon),'Chandelier intersects room boundary');
      }
    }
    count+=fixtures.length;
  }
  assert.equal(count,15);
});

test('52.10 seating faces the TV across the coffee table and keeps the old TV corner empty',()=>{
  const layout=getLayout('two-room-euro-52'),items=layout.furniture.filter(f=>f.room==='living');
  const sofa=items.find(f=>f.kind==='sofa'),tv=items.find(f=>f.kind==='tv'),coffee=items.find(f=>f.kind==='coffeeOval'),dining=items.find(f=>f.kind==='diningCompact');
  assert.equal(sofa.color,'gray');
  assert(Math.abs(sofa.position[0]-tv.position[0])<.1&&Math.abs(coffee.position[0]-tv.position[0])<.1);
  assert(sofa.position[2]<coffee.position[2]&&coffee.position[2]<tv.position[2]);
  assert(Math.cos(sofa.rotation-tv.rotation)<-.99,'Sofa and TV should face one another');
  assert(dining.position[0]>sofa.position[0]&&Math.abs(dining.position[2]-sofa.position[2])<.6,'Dining should sit beside sofa');
  for(const item of items){
    assert(!circleIntersectsBox(5.35,5.5,.25,{x:item.position[0],z:item.position[2],width:item.size[0],depth:item.size[2],yaw:item.rotation}),'The old TV corner should be clear');
  }
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
    const a=items[i],b=items[j];
    // All living furniture is axis aligned; preserve gaps between actual footprints.
    assert(Math.abs(a.position[0]-b.position[0])>=(a.size[0]+b.size[0])/2||Math.abs(a.position[2]-b.position[2])>=(a.size[2]+b.size[2])/2,`${a.id} overlaps ${b.id}`);
  }
});
