import React,{useMemo,useEffect,useLayoutEffect,useRef} from 'react';
import * as THREE from 'three';
import { Box } from './Furniture.jsx';
import { furniture } from '../apartmentConfig.js';
import { boxGeometry,cylinderGeometry,sphereGeometry,ringGeometry,roundedGeometry } from './materials.js';
const Cylinder=({position,size,material,...props})=><mesh geometry={cylinderGeometry} position={position} scale={size} material={material} castShadow receiveShadow {...props}/>;
const Soft=({position,size,material,...props})=><mesh geometry={roundedGeometry} position={position} scale={size} material={material} castShadow receiveShadow {...props}/>;
function FabricPanel({width,sheer=false,m,position}){
  const geometry=useMemo(()=>{
    const g=new THREE.PlaneGeometry(width,2.48,Math.ceil(width*70),22),p=g.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),drop=(1.24-y)/2.48;
      p.setXYZ(i,x*(1-.10*Math.sin(drop*Math.PI)),y+.009*Math.cos(x*18)*drop,Math.sin(x*(sheer?65:40))*(sheer?.018:.065)+.02*Math.sin(y*2+x*6)*drop);
    }g.computeVertexNormals();return g;
  },[width,sheer]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} position={position} material={sheer?m.sheer:m.curtain} castShadow={!sheer} receiveShadow/>;
}
function Curtain({position,width,rotation=0,m}) {
  return <group position={position} rotation={[0,rotation,0]}>
    <Cylinder position={[0,2.61,.035]} size={[.018,width+.16,.018]} rotation={[0,0,Math.PI/2]} material={m.brass}/>
    {[-1,1].map(side=><group key={side} position={[side*width*.41,0,.045]}>
      <FabricPanel width={width*.2} sheer m={m} position={[-side*width*.06,1.32,-.09]}/>
      <FabricPanel width={width*.2} m={m} position={[0,1.32,0]}/>
      {Array.from({length:7},(_,i)=><mesh key={i} geometry={ringGeometry} position={[-width*.09+i*width*.03,2.58,0]} scale={[.024,.03,.024]} material={m.brass}/>)}
      <Box position={[0,.055,.01]} size={[width*.2,.025,.055]} material={m.curtain}/>
    </group>)}
  </group>;
}
function Art({position,width=.75,height=1,rotation=0,index=0,m}){
  return <group position={position} rotation={[0,rotation,0]}>
    <Box size={[width+.065,height+.065,.045]} material={index%2?m.walnut:m.brass}/>
    <Box position={[0,0,.028]} size={[width,height,.016]} material={m.white}/>
    <mesh position={[0,0,.038]} material={m['art'+index]}><planeGeometry args={[width*.85,height*.88]}/></mesh>
  </group>;
}
function Fringe({width,depth,m}){
  const ref=useRef(),count=Math.ceil(width/.045);
  useLayoutEffect(()=>{const o=new THREE.Object3D();let i=0;for(const side of [-1,1])for(let j=0;j<count;j++){o.position.set(-width/2+.02+j*.045,-.004,side*(depth/2+.025));o.scale.set(.015,.006,.065);o.updateMatrix();ref.current.setMatrixAt(i++,o.matrix);}ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();},[width,depth,count]);
  return <instancedMesh ref={ref} args={[boxGeometry,m.linen,count*2]} receiveShadow/>;
}
function Rug({position,width,depth,index=0,m}){
  return <group position={position}>
    <mesh rotation={[-Math.PI/2,0,0]} material={m['carpet'+index]} receiveShadow><planeGeometry args={[width,depth]}/></mesh>
    <Fringe width={width} depth={depth} m={m}/>
  </group>;
}
function Books({m,small=false}){
  return <group scale={small?.62:1}>{[0,1,2].map(i=><group key={i} position={[0,.018+i*.04,0]} rotation={[0,i*.16,0]}>
    <Box size={[.28,.033,.2]} material={m.linen}/><Box position={[0,.019,0]} size={[.29,.006,.21]} material={[m.terracotta,m.sage,m.walnut][i]}/>
  </group>)}</group>;
}
function Vase({m,flowers=false}){
  return <><Cylinder position={[0,.09,0]} size={[.065,.18,.065]} material={m.terracotta}/><Cylinder position={[0,.195,0]} size={[.035,.05,.035]} material={m.terracotta}/>
    {Array.from({length:5},(_,i)=><group key={i} rotation={[0,i*2.4,.15]}><Box position={[.025,.32,0]} size={[.009,.25,.008]} material={m.leaf}/><mesh geometry={sphereGeometry} position={[.055,.37,0]} scale={flowers?[.045,.04,.04]:[.07,.015,.03]} material={flowers?m.pink:m.leaf}/></group>)}
  </>;
}
function Mug({m}) {return <><Cylinder position={[0,.055,0]} size={[.04,.1,.04]} material={m.ceramic}/><Cylinder position={[0,.107,0]} size={[.032,.004,.032]} material={m.walnut}/><mesh geometry={ringGeometry} position={[.044,.062,0]} scale={[.025,.029,.025]} material={m.ceramic}/></>;}
function SmallDetails({item,m}){
  const [w,h,d]=item.size;
  return <group position={item.position} rotation={[0,item.rotation||0,0]}>
    {item.kind==='nightstand'&&<group position={[.12,h+.03,.12]}><Books m={m} small/></group>}
    {item.kind==='kitchen'&&<>
      <Soft position={[1.55,1.18,-.21]} size={[.3,.43,.025]} rotation={[-.12,0,0]} material={m.oak}/>
      <group position={[.02,.97,.06]}><Mug m={m}/></group><group position={[.24,.97,.06]}><Mug m={m}/></group>
      <group position={[-1.6,.97,.03]}><Vase m={m}/></group>
      <Cylinder position={[1.3,1.08,.12]} size={[.045,.22,.045]} material={m.ceramic}/>
    </>}
    {item.kind==='breakfast'&&<group position={[-.3,.835,.45]}><Cylinder position={[0,.02,0]} size={[.15,.035,.15]} material={m.oak}/>{[-.06,.02,.08].map((x,i)=><mesh key={x} geometry={sphereGeometry} position={[x,.075,i*.03-.035]} scale={[.055,.055,.055]} material={i%2?m.terracotta:m.sage}/>)}</group>}
    {item.kind==='vanity'&&<>
      <Soft position={[-w*.39,.91,.04]} size={[w*.18,.07,.19]} material={m.linen}/>
      <Cylinder position={[w*.4,.955,.02]} size={[.025,.15,.025]} material={m.terracotta}/><Box position={[w*.4,1.035,.025]} size={[.045,.012,.016]} material={m.brass}/>
    </>}
    {item.kind==='cabinet'&&<><group position={[.15,h+.06,0]}><Books m={m}/></group><group position={[.78,h+.06,0]}><Vase m={m} flowers/></group></>}
  </group>;
}
export default function Decor({m,mode}) {
  return <>
    <Box position={[.095,1.35,1.9]} size={[.025,2.65,3.65]} material={m.darkMarble}/>
    <Box position={[.095,1.35,12.6]} size={[.025,2.65,4.55]} material={m.padded}/>
    {Array.from({length:7},(_,z)=>Array.from({length:5},(_,y)=><Box key={`${z}-${y}`} position={[.12,.3+y*.52,10.65+z*.65]} size={[.06,.49,.62]} material={m.padded}/>))}
    {[4.65,6.5,8.45].map(z=><Box key={z} position={[.095,1.35,z]} size={[.025,2.65,1.65]} material={m.stone}/>)}
    <Curtain position={[1.7,0,14.84]} width={3.05} m={m}/>
    <Curtain position={[3.85,0,14.88]} width={.65} m={m}/><Curtain position={[5.85,0,14.88]} width={.75} m={m}/>
    <Curtain position={[8.1,0,15.64]} width={3.05} m={m}/>
    <Curtain position={[1.7,0,.15]} width={3.05} m={m}/>
    <Curtain position={[6.23,0,2.1]} width={2.4} rotation={-Math.PI/2} m={m}/>
    <Rug position={[8.05,.025,11.7]} width={2.75} depth={3.5} m={m}/>
    <Rug position={[1.5,.025,12.8]} width={2.85} depth={3.1} index={1} m={m}/>
    <Rug position={[4.85,.025,12.7]} width={2.7} depth={2.9} index={2} m={m}/>
    <Rug position={[1.5,.025,1.65]} width={2.8} depth={2.95} index={1} m={m}/>
    <Rug position={[4.9,.026,7.85]} width={1.05} depth={3.05} index={2} m={m}/>
    <Rug position={[4.6,.025,2.55]} width={.7} depth={2.65} index={1} m={m}/>
    <Rug position={[1.2,.025,6.65]} width={.65} depth={.8} index={0} m={m}/>
    <Rug position={[1.15,.025,8.45]} width={.65} depth={.6} index={0} m={m}/>
    {mode==='walkthrough'&&<Art position={[9.69,1.8,13.4]} width={.7} height={1} rotation={-Math.PI/2} index={0} m={m}/>}
    {mode==='walkthrough'&&<Art position={[9.69,1.8,14.4]} width={.7} height={1} rotation={-Math.PI/2} index={2} m={m}/>}
    {mode==='walkthrough'&&<Art position={[8.2,1.95,8.21]} width={1.25} height={.8} index={1} m={m}/>}
    <Art position={[.205,2.04,12.65]} width={1.5} height={.72} rotation={Math.PI/2} index={3} m={m}/>
    {mode==='walkthrough'&&<Art position={[3.51,1.95,12.05]} width={.7} height={.9} rotation={Math.PI/2} index={0} m={m}/>}
    {mode==='walkthrough'&&<Art position={[3.51,1.95,13.15]} width={.7} height={.9} rotation={Math.PI/2} index={4} m={m}/>}
    <Art position={[.145,2.06,1.55]} width={1.3} height={.68} rotation={Math.PI/2} index={5} m={m}/>
    {mode==='walkthrough'&&<Art position={[5.8,1.8,.11]} width={.65} height={.85} index={2} m={m}/>}
    {mode==='walkthrough'&&<Art position={[6.29,1.8,7.7]} width={.65} height={.85} rotation={-Math.PI/2} index={1} m={m}/>}
    {mode==='walkthrough'&&<Art position={[1.2,1.85,7.39]} width={.48} height={.65} rotation={Math.PI} index={4} m={m}/>}
    {mode==='walkthrough'&&<Art position={[.5,1.85,9.29]} width={.48} height={.65} rotation={Math.PI} index={2} m={m}/>}
    {furniture.filter(f=>['nightstand','kitchen','breakfast','vanity','cabinet'].includes(f.kind)).map(item=><SmallDetails key={item.id} item={item} m={m}/>)}
    <group position={[.65,.64,4.75]}><Soft position={[0,0,0]} size={[.18,.08,.4]} material={m.linen}/></group>
    {mode==='walkthrough'&&<group position={[6.29,1.2,7.7]} rotation={[0,-Math.PI/2,0]}><Box size={[.75,.045,.17]} material={m.oak}/><group position={[-.18,.04,0]}><Books m={m} small/></group><group position={[.22,.025,0]}><Vase m={m}/></group></group>}
  </>;
}
