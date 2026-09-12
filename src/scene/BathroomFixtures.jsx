import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {boxGeometry,cylinderGeometry,roundedGeometry} from './materials.js';
const Box=({position=[0,0,0],size,material,...props})=><mesh geometry={boxGeometry} position={position} scale={size} material={material} castShadow receiveShadow {...props}/>;
const Soft=({position,size,material,...props})=><mesh geometry={roundedGeometry} position={position} scale={size} material={material} castShadow receiveShadow {...props}/>;
const Cylinder=({position,size,material,...props})=><mesh geometry={cylinderGeometry} position={position} scale={size} material={material} castShadow receiveShadow {...props}/>;
// Closed ceramic cross section: rounded outer shell, lip and a recessed interior.
const bowlGeometry=new THREE.LatheGeometry([[0,0],[.45,0],[.72,.018],[.94,.07],[1,.12],[.99,.135],[.94,.143],[.88,.132],[.83,.083],[.61,.044],[.18,.032],[0,.032]].map(([x,y])=>new THREE.Vector2(x,y)),64);
const frameGeometry=new THREE.TorusGeometry(1,.018,12,80);
const haloGeometry=new THREE.TorusGeometry(1,.024,10,80);
const faucetGeometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(0,.21,0),new THREE.Vector3(0,.255,.04),new THREE.Vector3(0,.25,.115),new THREE.Vector3(0,.21,.14)]),32,.012,10,false);
function LiveMirror({radius,quality}){
  const resources=useMemo(()=>{
    const geometry=new THREE.CircleGeometry(radius,80),size=quality==='high'?512:256;
    const mirror=new Reflector(geometry,{textureWidth:size,textureHeight:size,color:0xffffff,clipBias:.003,multisample:0});
    return {geometry,mirror};
  },[radius,quality]);
  useEffect(()=>()=>{resources.mirror.dispose();resources.geometry.dispose();},[resources]);
  return <primitive object={resources.mirror} dispose={null}/>;
}
export function Vanity({item,m,active,quality}){
  const w=item.size[0],d=item.size[2],radius=Math.min(w*.44,.44),back=-d/2+.025;
  return <>
    <Soft position={[0,.57,0]} size={[w,.48,d]} material={m.walnut}/>
    {[-1,1].map(a=><Soft key={a} position={[a*w*.25,.57,d/2+.009]} size={[w*.5-.02,.44,.025]} material={m.oak}/>)}
    {Array.from({length:Math.ceil(w/.035)},(_,i)=><Box key={i} position={[-w/2+.02+i*.035,.57,d/2+.027]} size={[.008,.43,.008]} material={m.walnut}/>)}
    <Box position={[0,.79,d/2+.028]} size={[w-.08,.012,.014]} material={m.brass}/>
    <Soft position={[0,.845,0]} size={[w+.035,.065,d+.025]} material={m.stone}/>
    <mesh geometry={bowlGeometry} position={[0,.878,.025]} scale={[w*.29,1,Math.min(d*.34,.145)]} material={m.porcelain} castShadow receiveShadow/>
    <Cylinder position={[0,.913,.025]} size={[.023,.004,.023]} material={m.metal}/>
    <Cylinder position={[0,.916,.025]} size={[.017,.003,.017]} material={m.brass}/>
    <Cylinder position={[0,.883,back+.012]} size={[.025,.013,.025]} material={m.brass}/>
    <mesh geometry={faucetGeometry} position={[0,.882,back+.012]} material={m.brass} castShadow/>
    <Box position={[.038,.973,back+.012]} size={[.065,.012,.022]} material={m.brass}/>
    <group position={[0,1.7,back]}>
      <Cylinder position={[0,0,-.008]} rotation={[Math.PI/2,0,0]} size={[radius+.012,.035,radius+.012]} material={m.dark}/>
      <mesh geometry={haloGeometry} scale={radius+.015} position={[0,0,-.02]} material={m.bulb}/>
      <mesh geometry={frameGeometry} scale={radius+.004} position={[0,0,.022]} material={m.brass}/>
      <group position={[0,0,.025]}>{active?<LiveMirror radius={radius-.004} quality={quality}/>:<mesh material={m.mirror}><circleGeometry args={[radius-.004,64]}/></mesh>}</group>
    </group>
  </>;
}
export function Shower({item,m}){
  const [w,,d]=item.size;
  return <>
    <Soft position={[0,.055,0]} size={[w,.09,d]} material={m.porcelain}/>
    <Box position={[0,.105,d*.28]} size={[w*.6,.008,.055]} material={m.metal}/>
    {Array.from({length:11},(_,i)=><Box key={i} position={[-w*.27+i*w*.054,.11,d*.28]} size={[.012,.006,.035]} material={m.dark}/>)}
    <Box position={[0,1.1,-d/2+.018]} size={[w,2.1,.025]} material={m.stone}/>
    <Box position={[w/2-.025,1.1,0]} size={[.014,2,d-.04]} material={m.showerGlass}/>
    <Box position={[w/2-.025,1.1,d/2-.025]} size={[.022,2,.018]} material={m.brass}/>
    <Box position={[w/2-.025,.11,0]} size={[.025,.023,d]} material={m.brass}/>
    <Box position={[w/2-.025,2.1,0]} size={[.025,.022,d]} material={m.brass}/>
    {[.35,1.7].map(y=><Box key={y} position={[w/2-.035,y,-d/2+.06]} size={[.04,.065,.065]} material={m.brass}/>)}
    <Cylinder position={[w/2-.07,1.15,d*.22]} size={[.012,.23,.012]} material={m.brass}/>
    <Cylinder position={[-.14,1.48,-d/2+.075]} size={[.012,1.12,.012]} material={m.brass}/>
    <Cylinder position={[-.14,2.04,-.02]} size={[.012,d*.65,.012]} rotation={[Math.PI/2,0,0]} material={m.brass}/>
    <Cylinder position={[-.14,2.01,.04]} size={[.12,.026,.12]} material={m.brass}/>
    <Cylinder position={[-.14,1.993,.04]} size={[.108,.008,.108]} material={m.dark}/>
    {[-.06,0,.06].flatMap(x=>[-.06,0,.06].map(z=><Cylinder key={`${x}:${z}`} position={[-.14+x,1.986,.04+z]} size={[.004,.003,.004]} material={m.ceramic}/>))}
    <Soft position={[-.14,1.03,-d/2+.065]} size={[.19,.08,.035]} material={m.brass}/>
    {[-.2,-.08].map(x=><Cylinder key={x} position={[x,1.03,-d/2+.093]} size={[.026,.022,.026]} rotation={[Math.PI/2,0,0]} material={m.brass}/>)}
    <Box position={[w*.26,1.35,-d/2+.10]} size={[.2,.025,.16]} material={m.brass}/>
    {[w*.2,w*.32].map((x,i)=><Cylinder key={x} position={[x,1.45,-d/2+.1]} size={[.025,.18,.025]} material={i?m.terracotta:m.ceramic}/>)}
  </>;
}
