import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { boxGeometry, sphereGeometry, cylinderGeometry } from './materials.js';

export function Box({ position=[0,0,0], size=[1,1,1], material, ...props }) {
  return <mesh geometry={boxGeometry} material={material} position={position} scale={size} castShadow receiveShadow {...props} />;
}
function Ball({position,size,material,...props}) { return <mesh geometry={sphereGeometry} position={position} scale={size} material={material} castShadow {...props}/>; }
function Cylinder({position,size,material,...props}) { return <mesh geometry={cylinderGeometry} position={position} scale={size} material={material} castShadow {...props}/>; }
function Legs({width,depth,height,mat}) { return [-1,1].flatMap(x=>[-1,1].map(z=><Box key={`${x}${z}`} position={[x*(width/2-.09),height/2,z*(depth/2-.09)]} size={[.045,height,.045]} material={mat}/>)); }
function Bed({item,m}) {
  const [w,,d]=item.size;
  return <>
    <Box size={[w+.06,.2,d+.07]} position={[0,.22,0]} material={m.walnut}/>
    <Box size={[w,.3,d]} position={[0,.46,0]} material={m.white}/>
    <Box size={[w+.15,1.4,.12]} position={[0,.72,-d/2]} material={m[item.color]}/>
    {[-.32,.32].map(x=><Ball key={x} position={[x*w,.72,-d*.3]} size={[w*.22,.12,.3]} material={m.linen}/>)}
    <Box size={[w+.035,.095,d*.62]} position={[0,.64,d*.18]} material={m[item.color]}/>
    <Box size={[w+.06,.035,.3]} position={[0,.704,d*.05]} material={m.linen}/>
    {Array.from({length:5},(_,i)=><Box key={i} position={[-w/2+.15+i*(w-.3)/4,.69,d*.36]} size={[.012,.012,d*.36]} material={m.taupe}/>)}
  </>;
}
function Sofa({item,m}) {
  const w=item.size[0];
  return <>
    <Legs width={w} depth={.8} height={.15} mat={m.walnut}/>
    <Box position={[0,.27,0]} size={[w,.28,.88]} material={m.linen}/>
    <Box position={[0,.65,-.37]} size={[w,.6,.18]} material={m.linen}/>
    {[-1,1].map(s=><Box key={s} position={[s*(w/2-.08),.52,0]} size={[.18,.45,.9]} material={m.linen}/>)}
    {[-1,0,1].map((s)=><group key={s} position={[s*(w-.36)/3,0,0]}>
      <Box position={[0,.47,.05]} size={[(w-.42)/3,.17,.67]} material={m.white}/>
      <Ball position={[0,.72,-.18]} size={[(w-.45)/6,.26,.115]} material={s===0?m.taupe:m.linen}/>
    </group>)}
  </>;
}
function Chair({m}) {
  return <><Legs width={.64} depth={.66} height={.4} mat={m.walnut}/>
    <Box position={[0,.44,0]} size={[.65,.16,.65]} material={m.linen}/>
    <Box position={[0,.71,-.28]} size={[.66,.49,.12]} material={m.taupe}/></>;
}
function Dining({m}) {
  return <>
    <Legs width={.85} depth={1.4} height={.74} mat={m.walnut}/>
    <Box position={[0,.77,0]} size={[.82,.07,1.45]} material={m.stone}/>
    {[-1,1].map(z=><group key={z} position={[0,0,z*.99]} rotation={[0,z===1?Math.PI:0,0]}><Chair m={m}/></group>)}
    {[-.4,.4].map(z=><Cylinder key={z} position={[0,.815,z]} size={[.15,.015,.15]} material={m.ceramic}/>)}
    <Cylinder position={[0,.89,0]} size={[.065,.18,.065]} material={m.brass}/>
    <Ball position={[0,1.04,0]} size={[.15,.14,.13]} material={m.leaf}/>
  </>;
}
function Kitchen({item,m}) {
  const w=item.size[0];
  return <>
    <Box position={[0,.46,0]} size={[w,.88,.6]} material={m.dark}/>
    <Box position={[0,.92,.025]} size={[w+.04,.06,.65]} material={m.stone}/>
    <Box position={[0,1.23,-.29]} size={[w,.56,.03]} material={m.stone}/>
    <Box position={[0,1.94,-.06]} size={[w,.88,.47]} material={m.walnut}/>
    {[-1.45,-.72,0,.72,1.45].map(x=><group key={x}><Box position={[x,.47,.31]} size={[.008,.8,.01]} material={m.oak}/><Box position={[x,1.94,.18]} size={[.008,.86,.012]} material={m.oak}/><Box position={[x+.15,.78,.325]} size={[.22,.018,.03]} material={m.brass}/></group>)}
    <Box position={[-.9,.957,.02]} size={[.66,.018,.45]} material={m.black}/>
    {[-1.05,-.76].flatMap(x=>[-.1,.14].map(z=><Cylinder key={`${x}${z}`} position={[x,.97,z]} size={[.09,.006,.09]} material={m.metal}/>))}
    <Box position={[.86,.96,.03]} size={[.55,.02,.4]} material={m.metal}/>
    <Box position={[.86,.97,.03]} size={[.46,.025,.31]} material={m.mirror}/>
    <Box position={[.86,1.1,-.18]} size={[.025,.29,.025]} material={m.brass}/>
    <Box position={[.86,1.235,-.1]} size={[.025,.025,.19]} material={m.brass}/>
  </>;
}
function Cabinet({item,m,state,player,mode}) {
  const ref=useRef();
  const [w,h,d]=item.size;
  useFrame((_,dt)=>{
    if (!ref.current) return;
    // Defer cabinet motion while the player is directly in its swing area.
    const p=player.current;
    const near=mode==='walkthrough' && p && Math.hypot(p.x-item.position[0],p.z-item.position[2]-.4)<1.3;
    if (!near) ref.current.rotation.y+=(state.cabinet?-1.4-ref.current.rotation.y:-ref.current.rotation.y)*Math.min(dt*7,1);
  });
  return <>
    <Box position={[0,h/2,0]} size={[w,h,d]} material={m.walnut}/>
    <Box position={[0,h+.025,0]} size={[w+.03,.05,d+.04]} material={m.stone}/>
    <group ref={ref} position={[-w/2,0,d/2+.025]} userData={{interaction:'cabinet'}}>
      <Box position={[w/4,h/2,0]} size={[w/2-.02,h-.04,.05]} material={m.dark}/>
      <Box position={[w/2-.12,h*.6,.04]} size={[.025,.15,.035]} material={m.brass}/>
    </group>
    <Box position={[w/4,h/2,d/2+.025]} size={[w/2-.02,h-.04,.05]} material={m.dark}/>
    <Cylinder position={[-.6,h+.14,0]} size={[.075,.22,.075]} material={m.ceramic}/>
    <Ball position={[.45,h+.17,0]} size={[.19,.14,.14]} material={m.taupe}/>
  </>;
}
function TV({m,state}) {
  const ref=useRef();
  useFrame(({clock})=> { if(ref.current) ref.current.position.x=Math.sin(clock.elapsedTime*.6)*.35; });
  return <>
    <Box position={[0,.25,0]} size={[2.05,.45,.38]} material={m.walnut}/>
    <group userData={{interaction:'tv'}}>
      <Box position={[0,1.25,-.12]} size={[1.85,1.03,.065]} material={m.black}/>
      <Box position={[0,1.25,-.078]} size={[1.76,.93,.012]} material={state.tv?m.screen:m.black}/>
      {state.tv&&<group><Ball ref={undefined} position={[.38,1.42,-.058]} size={[.22,.22,.015]} material={m.linen}/><mesh ref={ref} position={[0,1.04,-.04]} geometry={boxGeometry} scale={[.65,.03,.01]} material={m.bulb}/></group>}
    </group>
  </>;
}
function Bath({item,m}) {
  if(item.kind==='tub') return <>
    <Box position={[0,.3,0]} size={[1.48,.58,.68]} material={m.ceramic}/>
    <Box position={[0,.6,0]} size={[1.28,.015,.5]} material={m.mirror}/>
    <Box position={[-.58,.75,-.24]} size={[.03,.3,.03]} material={m.brass}/>
    <Box position={[-.5,.89,-.24]} size={[.18,.025,.025]} material={m.brass}/>
  </>;
  if(item.kind==='shower') return <>
    <Box position={[0,.05,0]} size={[.8,.1,.8]} material={m.ceramic}/>
    <Box position={[.38,1.03,0]} size={[.025,2,.8]} material={m.glass}/>
    <Box position={[-.3,1.1,-.35]} size={[.025,1.8,.025]} material={m.brass}/>
    <Cylinder position={[-.17,2.02,-.2]} size={[.13,.018,.13]} material={m.brass}/>
  </>;
  if(item.kind==='toilet') return <>
    <Box position={[0,.43,-.24]} size={[.43,.74,.2]} material={m.ceramic}/>
    <Ball position={[0,.38,.04]} size={[.24,.18,.32]} material={m.ceramic}/>
    <Cylinder position={[0,.46,.06]} size={[.17,.03,.23]} material={m.linen}/>
    <Box position={[0,.19,0]} size={[.28,.35,.35]} material={m.ceramic}/>
  </>;
  const w=item.size[0];
  return <>
    <Box position={[0,.56,0]} size={[w,.49,.35]} material={m.walnut}/>
    <Box position={[0,.84,0]} size={[w+.04,.07,.39]} material={m.ceramic}/>
    <Ball position={[0,.879,.015]} size={[w*.3,.035,.13]} material={m.mirror}/>
    <Box position={[.15,.97,-.13]} size={[.025,.2,.025]} material={m.brass}/>
    <Box position={[0,1.48,-.17]} size={[w,.85,.035]} material={m.brass}/>
    <Box position={[0,1.48,-.147]} size={[w-.045,.8,.012]} material={m.mirror}/>
  </>;
}
function Plant({item,m}) {
  const h=item.size[1];
  return <>
    <Cylinder position={[0,.22,0]} size={[.2,.44,.2]} material={m.linen}/>
    <Cylinder position={[0,.44,0]} size={[.18,.01,.18]} material={m.soil}/>
    <Box position={[0,h/2,0]} size={[.025,h-.2,.025]} material={m.walnut}/>
    {Array.from({length:7},(_,i)=> <Ball key={i} position={[Math.sin(i*2.4)*.17,.55+i*(h-.65)/7,Math.cos(i*2.4)*.17]} size={[.2,.12,.1]} rotation={[0,i*2.4,.5]} material={m.leaf}/>)}
  </>;
}
export default function Furniture({item,m,state,player,mode}) {
  const [w,h,d]=item.size;
  const content = {
    bed:()=> <Bed item={item} m={m}/>, sofa:()=> <Sofa item={item} m={m}/>,
    dining:()=> <Dining m={m}/>, kitchen:()=> <Kitchen item={item} m={m}/>,
    chair:()=> <Chair m={m}/>, plant:()=> <Plant item={item} m={m}/>,
    cabinet:()=> <Cabinet item={item} m={m} state={state} player={player} mode={mode}/>,
    tv:()=> <TV m={m} state={state}/>,
    wardrobe:()=> <><Box position={[0,h/2,0]} size={item.size} material={m.dark}/>{[-1,0,1].map(x=><Box key={x} position={[x*w/3,h/2,d/2+.01]} size={[.012,h-.1,.02]} material={m.brass}/>)}</>,
    nightstand:()=> <><Box position={[0,h/2,0]} size={item.size} material={m.walnut}/><Cylinder position={[0,h+.19,0]} size={[.025,.35,.025]} material={m.brass}/><Cylinder position={[0,h+.37,0]} size={[.16,.16,.16]} material={m.linen}/></>,
    console:()=> <><Box position={[0,h/2,0]} size={item.size} material={m.walnut}/><Box position={[0,h+.03,0]} size={[w+.04,.06,d+.04]} material={m.stone}/><Box position={[0,1.7,-.12]} size={[1.15,1.05,.055]} material={m.mirror}/></>,
    coffee:()=> <><Cylinder position={[0,.38,0]} size={[.38,.065,.54]} material={m.stone}/><Cylinder position={[0,.18,0]} size={[.21,.36,.28]} material={m.walnut}/><Box position={[.02,.427,.05]} size={[.23,.045,.3]} rotation={[0,.2,0]} material={m.taupe}/><Cylinder position={[.02,.47,-.24]} size={[.06,.12,.06]} material={m.ceramic}/></>,
  }[item.kind];
  return <RigidBody type="fixed" colliders={false} position={item.position} rotation={[0,item.rotation||0,0]}>
    <CuboidCollider args={[w/2,h/2,d/2]} position={[0,h/2,0]}/>
    {content ? content() : <Bath item={item} m={m}/>}
  </RigidBody>;
}
