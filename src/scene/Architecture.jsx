import React, { useMemo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RigidBody, CuboidCollider, useBeforePhysicsStep } from '@react-three/rapier';
import { APARTMENT } from '../apartmentConfig.js';
import { wallSegments, doorPose, doorSweepBlocked, wallPoint, wallYaw } from '../geometry.js';
import Decor from './Decor.jsx';
import LayoutDecor from './LayoutDecor.jsx';
import DiningChandeliers from './DiningChandeliers.jsx';
import Furniture, { Box } from './Furniture.jsx';

function Floor({room,m,mode}) {
  const resources=useMemo(()=>{
    const shape=new THREE.Shape(room.polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
    const geo=new THREE.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);
    // World-space UVs preserve material scale between differently sized rooms.
    const uv=geo.attributes.uv, pos=geo.attributes.position;
    for(let i=0;i<uv.count;i++) uv.setXY(i,pos.getX(i)/4,pos.getZ(i)/4);
    const slab=new THREE.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false});slab.rotateX(-Math.PI/2);
    const xs=room.polygon.map(p=>p[0]),zs=room.polygon.map(p=>p[1]);
    return {geo,slab,x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,w:Math.max(...xs)-Math.min(...xs),d:Math.max(...zs)-Math.min(...zs)};
  },[room]);
  useEffect(()=>()=>{resources.geo.dispose();resources.slab.dispose();},[resources]);
  return <>
    <mesh geometry={resources.geo} material={m[room.material|| (room.id==='kitchen'?'kitchenMarble':room.id==='hall'?'hallOak':room.type)]} receiveShadow/>
    <mesh geometry={resources.slab} material={m.wall} position={[0,-.19,0]} receiveShadow/>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[resources.w/2,.1,resources.d/2]} position={[resources.x,-.1,resources.z]}/></RigidBody>
    {mode==='walkthrough'&&!room.outdoor&&<mesh geometry={resources.geo} position={[0,APARTMENT.ceiling,0]} rotation={[0,0,0]} castShadow receiveShadow><meshStandardMaterial color="#f4f1ea" side={THREE.DoubleSide}/></mesh>}
  </>;
}
function Wall({wall,m,mode}) {
  const segments=useMemo(()=>wallSegments(wall),[wall]);
  const cut=mode==='dollhouse'&&!wall.tall;
  const cap=cut?(wall.id.startsWith('baths')||wall.id==='ensuite-north'?1.65:.86):APARTMENT.ceiling;
  if(wall.railing){const p=wallPoint(wall,wall.length/2),count=Math.ceil(wall.length/.14);return <RigidBody type="fixed" colliders={false} position={[p[0],0,p[1]]} rotation={[0,wallYaw(wall),0]}>
    <CuboidCollider args={[wall.length/2,.525,.08]} position={[0,.525,0]}/>
    {[.12,1.025].map(y=><Box key={y} position={[0,y,0]} size={[wall.length,.05,.06]} material={m.dark}/>)}
    {Array.from({length:count+1},(_,i)=><Box key={i} position={[-wall.length/2+i*wall.length/count,.56,0]} size={[.025,.94,.025]} material={m.dark}/>)}
  </RigidBody>;}
  return <RigidBody type="fixed" colliders={false}>
    {segments.map((s,i)=> {
      const bottom=s.position[1]-s.size[1]/2, height=Math.max(0,Math.min(bottom+s.size[1],cap)-bottom);
      return <React.Fragment key={i}>
        <CuboidCollider args={s.size.map(v=>v/2)} position={s.position} rotation={[0,s.yaw,0]}/>
        {height>0&&<>
          <Box rotation={[0,s.yaw,0]} position={[s.position[0],bottom+height/2,s.position[2]]} size={[s.size[0],height,s.size[2]]} material={m.wall}/>
          <Box rotation={[0,s.yaw,0]} position={[s.position[0],bottom+height+.006,s.position[2]]} size={[s.size[0]+.01,.014,s.size[2]+.01]} material={m.dark}/>
          {bottom===0&&<Box rotation={[0,s.yaw,0]} position={[s.position[0],.055,s.position[2]]} size={[s.size[0]+.024,.11,s.size[2]+.024]} material={m.trim}/>}
        </>}
      </React.Fragment>;
    })}
    {(wall.openings||[]).map((o,i)=> {
      const p=wallPoint(wall,o.at+o.width/2),pos=[p[0],0,p[1]];
      const yaw=wallYaw(wall);
      return <group key={i} position={pos} rotation={[0,yaw,0]}>
        {o.kind==='window'?<>
          <CuboidCollider args={[o.width/2,.75,.045]} position={[0,1.6,0]}/>
          {!cut&&<>
            <Box position={[0,(Math.min(cap,2.35)+.85)/2,0]} size={[o.width,Math.min(cap,2.35)-.85,.025]} material={m.glass}/>
            {[-1,0,1].map(a=><Box key={a} position={[a*o.width/2,1.6,0]} size={[.045,1.5,.09]} material={m.dark}/>)}
            {[.86,2.35].map(y=><Box key={y} position={[0,y,0]} size={[o.width,.055,.1]} material={m.dark}/>)}
          </>}
        </>:<>
          {o.kind==='entrance'&&<><CuboidCollider args={[o.width/2,1.1,.06]} position={[0,1.1,0]}/><Box position={[0,Math.min(2.2,cap)/2,0]} size={[o.width,Math.min(2.2,cap),.08]} material={m.walnut}/></>}
          {[-1,1].map(a=><Box key={a} position={[a*(o.width/2+.015),Math.min(2.2,cap)/2,0]} size={[.05,Math.min(2.2,cap),.2]} material={m.trim}/>)}
          {!cut&&<Box position={[0,2.2,0]} size={[o.width+.1,.07,.2]} material={m.trim}/>}
        </>}
      </group>;
    })}
  </RigidBody>;
}
function Door({door,m,open,mode,player,reducedMotion}) {
  const body=useRef(), angle=useRef(0), pose=doorPose(door,0);
  useBeforePhysicsStep(()=>{
    if(!body.current)return;
    const target=open?door.swing*Math.PI/2:0;
    const step=reducedMotion?.2:.045;
    const next=angle.current+Math.max(-step,Math.min(step,target-angle.current));
    if(mode==='walkthrough' && doorSweepBlocked(door,angle.current,next,player.current)) return;
    angle.current=next;
    const p=doorPose(door,next);
    body.current.setNextKinematicTranslation({x:p.x,y:1.08,z:p.z});
    body.current.setNextKinematicRotation({x:0,y:Math.sin(p.yaw/2),z:0,w:Math.cos(p.yaw/2)});
  });
  const height=mode==='walkthrough'?2.16:.84;
  return <RigidBody ref={body} type="kinematicPosition" colliders={false} position={[pose.x,1.08,pose.z]} rotation={[0,pose.yaw,0]}>
    <CuboidCollider args={[door.width/2,1.08,.035]}/>
    <group userData={{interaction:door.id}}>
      <Box position={[0,-1.08+height/2,0]} size={[door.width-.035,height,.065]} material={door.id.startsWith('loggia')?m.glass:m.linen}/>
      <Box position={[door.width/2-.14,mode==='walkthrough'?-.02:-.4,.075]} size={[.15,.035,.04]} material={m.brass}/>
      {mode==='walkthrough'&&<Box position={[0,0,.034]} size={[door.width-.2,1.6,.008]} material={m.wall}/>}
    </group>
  </RigidBody>;
}
export default function Architecture({layout,m,mode,state,player,reducedMotion,quality,activeRoom,furnished=true,evening=false}) {
  const {rooms,walls,doors,furniture,switches}=layout;
  return <>
    {rooms.map(room=><Floor key={room.id} room={room} m={m} mode={mode}/>)}
    {walls.map(wall=><Wall key={wall.id} wall={wall} m={m} mode={mode}/>)}
    {doors.map(door=><Door key={door.id} door={door} m={m} mode={mode} open={!!state.doors[door.id]} player={player} reducedMotion={reducedMotion}/>)}
    {layout.id==='four-room-134'?(furnished&&<Decor m={m} mode={mode}/>):<LayoutDecor furnished={furnished} layout={layout} m={m} mode={mode}/>}
    {furniture.filter(item=>furnished||['kitchen','vanity','shower','bath','toilet','wardrobe','hallStorage'].includes(item.kind)).map(item=><Furniture activeRoom={activeRoom} quality={quality} key={item.id} item={item} m={m} state={state} player={player} mode={mode} reducedMotion={reducedMotion}/>)}
    {furnished&&<DiningChandeliers layout={layout} m={m} mode={mode} state={state}/>}
    {switches.map(s=><group key={s.id} position={s.position} rotation={[0,s.rotation,0]} userData={{interaction:s.id}}>
      <Box size={[.13,.2,.045]} material={m.white}/>
      <Box position={[0,0,.027]} size={[.065,.12,.018]} material={state.lights[s.room]!==false?m.bulb:m.dark}/>
    </group>)}
    {rooms.filter(r=>!r.id.startsWith('loggia')&&!r.outdoor).map(r=><group key={r.id}>
      <pointLight castShadow={quality==='high'&&mode==='walkthrough'&&activeRoom===r.id} shadow-mapSize={[512,512]} shadow-bias={-.0002} shadow-normalBias={.018} shadow-radius={3} position={[r.label[0],2.45,r.label[1]]} color={evening?'#ffd7a1':'#fff4e6'} intensity={state.lights[r.id]===false?0:mode==='walkthrough'?(activeRoom===r.id?11:0):3} distance={7} decay={2}/>
      {mode==='walkthrough'&&<Box position={[r.label[0],2.65,r.label[1]]} size={[.5,.04,.5]} material={state.lights[r.id]===false?m.linen:m.bulb}/>}
    </group>)}
  </>;
}
