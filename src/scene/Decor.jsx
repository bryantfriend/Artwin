import React from 'react';
import { Box } from './Furniture.jsx';
function Curtain({position,width,rotation=0,m}) {
  return <group position={position} rotation={[0,rotation,0]}>
    <Box position={[0,2.6,0]} size={[width,.055,.08]} material={m.dark}/>
    {Array.from({length:Math.ceil(width/.075)},(_,i)=><Box key={i} position={[-width/2+i*.075,1.3,Math.sin(i*Math.PI/2)*.04]} size={[.075,2.5,.045]} material={i%2?m.curtain:m.linen}/>)}
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
