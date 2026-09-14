import test from 'node:test';
import assert from 'node:assert/strict';
import {layouts} from '../src/layouts/index.js';
import {pointInPolygon,circleIntersectsBox,wallSegments} from '../src/geometry.js';

test('all furnished toilets have their cistern toward a wall and clear space in front of the bowl',()=>{
 let count=0;
 for(const layout of layouts){
  const walls=layout.walls.flatMap(w=>wallSegments(w)).filter(s=>s.position[1]-s.size[1]/2<.75).map(s=>({x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2],yaw:s.yaw}));
  for(const toilet of layout.furniture.filter(f=>f.kind==='toilet')){
   count++;
   const [x,,z]=toilet.position,[w,,d]=toilet.size,yaw=toilet.rotation||0;
   const room=layout.rooms.find(r=>pointInPolygon(x,z,r.polygon));
   const at=(side,forward)=>[x+side*Math.cos(yaw)+forward*Math.sin(yaw),z-side*Math.sin(yaw)+forward*Math.cos(yaw)];
   const blocked=(p,boxes)=>boxes.some(b=>circleIntersectsBox(...p,.005,b));
   const context=`${layout.id}/${toilet.id}`;
   assert([.025,.05,.1,.15,.2].some(gap=>blocked(at(0,-d/2-gap),walls)),`${context}: cistern does not face a nearby wall`);
   const otherFixtures=layout.furniture.filter(f=>f!==toilet).map(f=>({x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation||0}));
   for(const side of [-w/2+.015,0,w/2-.015]){
    for(const forward of [-d/2+.015,d/2-.015])assert(!blocked(at(side,forward),[...walls,...otherFixtures]),`${context}: fixture intersects wall or furniture`);
    // A half-metre approach zone is a scene-layout check, not a building-code claim.
    for(let space=.025;space<=.501;space+=.025){
     const p=at(side,d/2+space);
     assert(pointInPolygon(...p,room.polygon)&&!blocked(p,[...walls,...otherFixtures]),`${context}: bowl faces an obstruction`);
    }
   }
  }
 }
 assert.equal(count,95);
});
