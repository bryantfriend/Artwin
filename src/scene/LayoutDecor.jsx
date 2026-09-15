import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {Curtain,Art,Rug,SmallDetails} from './Decor.jsx';
import {wallPoint,wallYaw} from '../geometry.js';
import {Box} from './Furniture.jsx';

function FloorFinish({zone,m}){
  const geometry=useMemo(()=>{
    const shape=new THREE.Shape(zone.polygon.map(([x,z])=>new THREE.Vector2(x,-z)));
    const g=new THREE.ShapeGeometry(shape);g.rotateX(-Math.PI/2);
    const p=g.attributes.position,uv=g.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)/4,p.getZ(i)/4);
    return g;
  },[zone]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} position={[0,.003,0]} material={m[zone.material]} receiveShadow/>;
}
export default function LayoutDecor({layout,m,mode,furnished=true}){
  return <>
    {layout.zones.map((zone,i)=><FloorFinish key={i} zone={zone} m={m}/>)}
    {furnished&&layout.walls.filter(w=>w.exterior&&(mode==='walkthrough'||w.tall)&&!w.roomIds[0].startsWith('loggia')).flatMap(w=>w.openings.filter(o=>o.kind==='window').map((o,i)=>{
      let x=w.start[0]+(w.axis==='x'?o.at+o.width/2:w.normal*.17),z=w.start[1]+(w.axis==='z'?o.at+o.width/2:w.normal*.17);
      let rotation=w.axis==='x'?(w.normal===1?0:Math.PI):w.normal*Math.PI/2;
      if(w.axis==='diagonal'){rotation=wallYaw(w)+(w.normal===1?0:Math.PI);const p=wallPoint(w,o.at+o.width/2);x=p[0]+Math.sin(rotation)*.17;z=p[1]+Math.cos(rotation)*.17;}
      return <Curtain key={w.id+i} position={[x,0,z]} rotation={rotation} width={o.width} m={m}/>;
    }))}
    {furnished&&layout.furniture.filter(f=>f.kind==='bed').map((f,i)=>{
      const back=[f.position[0]-Math.sin(f.rotation)*(f.size[2]/2+.1),f.position[2]-Math.cos(f.rotation)*(f.size[2]/2+.1)];
      const cut=!!layout.theme&&mode==='dollhouse'&&layout.walls.some(w=>!w.tall&&w.exterior&&w.roomIds.includes(f.room)&&Math.abs((back[0]-w.start[0])*Math.sin(wallYaw(w))+(back[1]-w.start[1])*Math.cos(wallYaw(w)))<.25);
      return <group key={f.id} position={f.position} rotation={[0,f.rotation,0]}>
      <Box position={[0,cut?.7:1.35,-f.size[2]/2-.1]} size={[f.size[0]+.7,cut?1.3:2.55,.025]} material={m[f.feature]||m.padded}/>
      {!cut&&<Art position={[0,2.04,-f.size[2]/2-.075]} width={f.size[0]*.75} height={.65} index={i===0?3:5} m={m}/>}
      <Rug position={[0,.025,.23]} width={f.size[0]+.65} depth={f.size[2]+.15} index={i%2+1} m={m}/>
    </group>;})}
    {layout.furniture.filter(f=>f.kind==='vanity').map(f=><group key={f.id} position={f.position} rotation={[0,f.rotation,0]}>
      <Box position={[0,1.35,-f.size[2]/2+.005]} size={[f.size[0]+.1,2.55,.018]} material={m.stone}/>
    </group>)}
    {furnished&&layout.decor.filter(d=>d.kind==='rug').map((d,i)=><Rug key={i} {...d} m={m}/>)}
    {furnished&&mode==='walkthrough'&&layout.decor.filter(d=>d.kind==='art').map((d,i)=><Art key={i} {...d} m={m}/>)}
    {furnished&&layout.furniture.filter(f=>['nightstand','kitchen','vanity','cabinet'].includes(f.kind)).map(f=>f.kind==='kitchen'?<group key={f.id} position={f.position} rotation={[0,f.rotation,0]} scale={[f.size[0]/3.7,1,1]}><SmallDetails item={{...f,position:[0,0,0],rotation:0}} m={m}/></group>:<SmallDetails key={f.id} item={f} m={m}/>)}
  </>;
}
