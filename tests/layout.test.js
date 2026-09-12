import test from 'node:test';
import assert from 'node:assert/strict';
import { APARTMENT, rooms, walls, doors, furniture } from '../src/apartmentConfig.js';
import { pointInPolygon, normalizedMovement, wallSegments, doorPose, circleIntersectsBox, doorSweepBlocked } from '../src/geometry.js';

test('reference is a three-bedroom, four-room apartment with an independent advertised area',()=> {
  assert.equal(APARTMENT.advertisedArea,'134.68');
  assert.equal(furniture.filter(f=>f.kind==='bed').length,3);
  assert.equal(rooms.filter(r=>r.id.startsWith('loggia')).length,2);
  const ids=[...rooms,...doors,...furniture].map(v=>v.id);
  assert.equal(new Set(ids).size,ids.length);
});
test('all room destinations lie inside the intended floor polygon, clear of furniture',()=> {
  for(const r of rooms) {
    const [x,,z]=r.destination;
    assert(pointInPolygon(x,z,r.polygon),r.id);
    for(const f of furniture)assert(!circleIntersectsBox(x,z,APARTMENT.playerRadius+.025,{x:f.position[0],z:f.position[2],yaw:f.rotation||0,width:f.size[0],depth:f.size[2]}),`${r.id} overlaps ${f.id}`);
  }
});
test('door openings contain no wall segments at player height',()=> {
  for(const wall of walls)for(const o of wall.openings||[]) {
    if(o.kind!=='door'&&o.kind!=='passage')continue;
    const x=wall.start[0]+(wall.axis==='x'?o.at+o.width/2:0),z=wall.start[1]+(wall.axis==='z'?o.at+o.width/2:0);
    for(const s of wallSegments(wall))if(s.position[1]-s.size[1]/2<1.8)assert(!circleIntersectsBox(x,z,.25,{x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2]}),`${wall.id}: blocked doorway`);
    assert(o.width>APARTMENT.playerRadius*2+.2);
  }
});
test('diagonal movement has the same maximum speed as straight movement, regardless of yaw',()=> {
  for(const yaw of [0,.7,Math.PI,6.1]) {
    const move=normalizedMovement(1,-1,yaw);
    assert(Math.abs(Math.hypot(move.x,move.z)-APARTMENT.speed)<1e-9);
  }
  assert.deepEqual(normalizedMovement(0,0,1),{x:0,z:0});
});
test('door pivot stays on its hinge and rejects occupied swing space',()=> {
  const door=doors[0],pose=doorPose(door,.7);
  assert(Math.abs(Math.hypot(pose.x-door.hinge[0],pose.z-door.hinge[1])-door.width/2)<1e-9);
  assert(doorSweepBlocked(door,.65,.75,{x:pose.x,z:pose.z}));
  assert(!doorSweepBlocked(door,.65,.75,{x:99,z:99}));
});
