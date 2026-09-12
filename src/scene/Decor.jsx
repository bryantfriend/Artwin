import React, {useMemo,useEffect} from 'react';
import * as THREE from 'three';
import { Box } from './Furniture.jsx';
function Curtain({position,width,rotation=0,m}) {
  const geometry=useMemo(()=>{
    const g=new THREE.PlaneGeometry(width,2.5,Math.ceil(width*80),12),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.sin(x*42)*.045+Math.sin(x*84)*.012+(1.25-y)*.006);}
    g.computeVertexNormals();return g;
  },[width]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <group position={position} rotation={[0,rotation,0]}>
    <Box position={[0,2.6,0]} size={[width,.055,.08]} material={m.dark}/>
    <mesh geometry={geometry} position={[0,1.3,0]} material={m.curtain} castShadow receiveShadow/>
  </group>;
}

export default function Decor({m}) {
  return <>
    <Box position={[.095,1.35,1.9]} size={[.025,2.65,3.65]} material={m.darkMarble}/>
    <Box position={[.095,1.35,12.6]} size={[.025,2.65,4.55]} material={m.padded}/>
    {Array.from({length:7},(_,z)=>Array.from({length:5},(_,y)=><Box key={`${z}-${y}`} position={[.12,.3+y*.52,10.65+z*.65]} size={[.06,.49,.62]} material={m.padded}/>))}
    {[4.65,6.5,8.45].map((z)=><Box key={z} position={[.095,1.35,z]} size={[.025,2.65,1.65]} material={m.stone}/>)}
    <Curtain position={[1.7,0,14.84]} width={3.05} m={m}/>
    <Curtain position={[3.85,0,14.88]} width={.65} m={m}/><Curtain position={[5.85,0,14.88]} width={.75} m={m}/>
    <Curtain position={[8.1,0,15.64]} width={3.05} m={m}/>
    <Curtain position={[1.7,0,.15]} width={3.05} m={m}/>
    <Box position={[4.85,.014,12.7]} size={[2.7,.025,2.6]} material={m.rug}/>
    <Box position={[1.4,.014,1.65]} size={[2.65,.025,3.2]} material={m.stone}/>
  </>;
}
