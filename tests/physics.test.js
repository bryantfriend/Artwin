import test from 'node:test';
import assert from 'node:assert/strict';
import RAPIER from '@dimforge/rapier3d-compat';
import { APARTMENT, rooms, walls, doors, furniture } from '../src/apartmentConfig.js';
import { wallSegments, doorPose } from '../src/geometry.js';
import { createCharacterController, computeCharacterMovement } from '../src/physicsController.js';
import {additionalLayouts} from '../src/layouts/tokyoLayouts.js';

await RAPIER.init();
function setup(open=false,layout={rooms,walls,doors,furniture}) {
  const {rooms,walls,doors,furniture}=layout;
  const world=new RAPIER.World({x:0,y:-9.81,z:0});world.timestep=1/60;
  for(const room of rooms){
    const xs=room.polygon.map(p=>p[0]),zs=room.polygon.map(p=>p[1]);
    const x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2,w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs);
    const floor=world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,.1,d/2).setTranslation(x,-.1,z),floor);
  }
  for(const wall of walls)for(const s of wallSegments(wall))world.createCollider(RAPIER.ColliderDesc.cuboid(...s.size.map(v=>v/2)).setTranslation(...s.position));
  for(const door of doors) {
    const p=doorPose(door,open?door.swing*Math.PI/2:0);
    world.createCollider(RAPIER.ColliderDesc.cuboid(door.width/2,1.08,.035).setTranslation(p.x,1.08,p.z).setRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)}));
  }
  for(const f of furniture)world.createCollider(RAPIER.ColliderDesc.cuboid(f.size[0]/2,f.size[1]/2,f.size[2]/2).setTranslation(f.position[0],f.size[1]/2,f.position[2]).setRotation({x:0,y:Math.sin((f.rotation||0)/2),z:0,w:Math.cos((f.rotation||0)/2)}));
  world.step();return world;
}
function movePlayer(world,position,delta,steps) {
  const body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(...position));
  const collider=world.createCollider(RAPIER.ColliderDesc.capsule(APARTMENT.playerHalfHeight,APARTMENT.playerRadius),body);
  const cc=createCharacterController(world);
  for(let i=0;i<steps;i++) {
    world.step();const m=computeCharacterMovement(cc,collider,delta.x,delta.z);
    const p=body.translation();body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});
  }
  world.step();const final={...body.translation()};world.removeCharacterController(cc);return final;
}
test('a character can back away from a closed door after making contact',()=>{
  const world=setup(false);
  const body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(2.65,.82,3.2));
  const collider=world.createCollider(RAPIER.ColliderDesc.capsule(.55,.25),body);
  const cc=createCharacterController(world);
  function steps(z,n){for(let i=0;i<n;i++){world.step();const m=computeCharacterMovement(cc,collider,-z*.00000354,z);const p=body.translation();body.setNextKinematicTranslation({x:p.x+m.x,y:p.y+m.y,z:p.z+m.z});}world.step();}
  try{
    steps(.025,110);const blocked=body.translation().z;
    steps(-.025,50);assert(body.translation().z<blocked-.6,`Could not retreat: ${blocked} -> ${body.translation().z}`);
  }finally{world.removeCharacterController(cc);world.free();}
});
test('real Rapier capsule is blocked by a closed bedroom door and passes the open door',()=>{
  const closed=setup(false),open=setup(true);
  try {
    const blocked=movePlayer(closed,[2.75,.82,6.2],{x:0,y:-.045,z:-.025},65);
    const passed=movePlayer(open,[2.75,.82,6.2],{x:0,y:-.045,z:-.025},65);
    assert(blocked.z>5.75,`closed door allowed passage: ${blocked.z}`);
    assert(passed.z<5.1,`open door blocked passage: ${passed.z}`);
    assert(blocked.y>.78&&passed.y>.78,'player fell below floor');
  }finally{closed.free();open.free();}
});
test('actual physics queries accept every configured destination with closed doors',()=>{
  const world=setup(false);
  try{for(const r of rooms){
    const [x,y,z]=r.destination;let hit=false;
    world.intersectionsWithShape({x,y,z},{x:0,y:0,z:0,w:1},new RAPIER.Capsule(APARTMENT.playerHalfHeight,APARTMENT.playerRadius),()=>{hit=true;return false;});
    assert(!hit,`unsafe destination: ${r.id}`);
  }}finally{world.free();}
});
test('capsule slides along a wall and stays above the floor',()=>{
  const world=setup(false);
  try{
    const p=movePlayer(world,[.55,.82,10.4],{x:-.018,y:-.045,z:.018},30);
    assert(p.x>.32&&p.x<.36,`did not stop at west wall: ${p.x}`);
    assert(p.z>10.8,`did not slide: ${p.z}`);
    assert(p.y>.78,`fell through floor: ${p.y}`);
  }finally{world.free();}
});

for(const layout of additionalLayouts)test(`${layout.APARTMENT.advertisedArea} m²: Rapier accepts every room destination with doors open and closed`,()=>{
  for(const open of [false,true]){
    const world=setup(open,layout);
    try{for(const r of layout.rooms){
      const [x,y,z]=r.destination;let hit=false;
      world.intersectionsWithShape({x,y,z},{x:0,y:0,z:0,w:1},new RAPIER.Capsule(APARTMENT.playerHalfHeight,APARTMENT.playerRadius),()=>{hit=true;return false;});
      assert(!hit,`${r.id}: capsule intersects an obstacle (${open?'open':'closed'} doors)`);
    }}finally{world.free();}
  }
});
