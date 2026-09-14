import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import DiningChair from './DiningChair.jsx';
import TVScreen from './TVScreen.jsx';
import {Vanity,Shower} from './BathroomFixtures.jsx';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { boxGeometry, pillowGeometry, roundedGeometry, ringGeometry, sphereGeometry, cylinderGeometry } from './materials.js';

export function Box({ position=[0,0,0], size=[1,1,1], material, ...props }) {
  return <mesh geometry={boxGeometry} material={material} position={position} scale={size} castShadow receiveShadow {...props} />;
}
function Soft({position,size,material,...props}) {return <mesh geometry={roundedGeometry} position={position} scale={size} material={material} castShadow receiveShadow {...props}/>;}
function Ball({position,size,material,...props}) { return <mesh geometry={sphereGeometry} position={position} scale={size} material={material} castShadow {...props}/>; }
function Cylinder({position,size,material,...props}) { return <mesh geometry={cylinderGeometry} position={position} scale={size} material={material} castShadow {...props}/>; }
function Legs({width,depth,height,mat}) { return [-1,1].flatMap(x=>[-1,1].map(z=><Box key={`${x}${z}`} position={[x*(width/2-.09),height/2,z*(depth/2-.09)]} size={[.045,height,.045]} material={mat}/>)); }
function Pillow({position,size,material,...props}) {return <mesh geometry={pillowGeometry} position={position} scale={size.map(v=>v/2)} material={material} castShadow receiveShadow {...props}/>;}
function Duvet({width,depth,material}){
  const geometry=useMemo(()=>{
    const g=new THREE.PlaneGeometry(width+.36,depth*.7,64,40);g.rotateX(-Math.PI/2);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i);
      // Keep the top above the mattress; only drape after clearing its edge.
      const edge=Math.max(0,(Math.abs(x)-width/2)/.18);
      const fold=.004*Math.sin(x*12+z*7)+.003*Math.sin(x*8-z*17);
      if(edge>0)p.setX(i,Math.sign(x)*(width/2+.09*Math.sin(edge*Math.PI/2)));
      p.setY(i,fold-.25*edge*edge);
    }
    g.computeVertexNormals();return g;
  },[width,depth]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} position={[0,.67,depth*.18]} material={material} castShadow receiveShadow/>;
}
function Bed({item,m}) {
  const [w,,d]=item.size,white=item.color==='white';
  return <>
    <Soft size={[w+.06,.25,d+.07]} position={[0,.22,0]} material={m.taupe}/>
    <Soft size={[w,.3,d]} position={[0,.46,0]} material={m.upholstery}/>
    <Soft size={[w+.18,1.25,.18]} position={[0,.75,-d/2]} material={white?m.white:m.padded}/>
    {[-1,1].map((a)=><group key={a}>
      <Soft position={[a*w*.25,1.02,-d/2+.13]} size={[w*.46,.42,.17]} material={white?m.white:m.taupe}/>
      <Pillow position={[a*w*.25,.75,-d*.32]} size={[w*.43,.19,.43]} rotation={[-.2,0,a*.04]} material={m.white}/>
      <Pillow position={[a*w*.25,.86,-d*.2]} size={[w*.32,.38,.15]} rotation={[-.25,0,0]} material={white?m.upholstery:m.taupe}/>
    </group>)}
    <Duvet width={w} depth={d} material={m[item.color+'Bedding']||(white?m.whiteBedding:m.brownBedding)}/>
    <Soft size={[w-.02,.055,.25]} position={[0,.7,-d*.12]} material={m.linen}/>
  </>;
}
function Sofa({item,m}) {
  m={...m,sofaBrown:item.color==='gray'?m.sofaGray:item.color==='light'?m.upholstery:item.color==='charcoal'?m.dark:m.sofaBrown,sofaAccent:item.color==='gray'?m.sofaGrayAccent:m.sofaAccent};
  const w=item.size[0];
  return <>
    <Legs width={w} depth={.8} height={.15} mat={m.walnut}/>
    <Soft position={[0,.27,0]} size={[w,.28,.88]} material={m.sofaBrown}/>
    <Soft position={[0,.65,-.37]} size={[w,.6,.18]} material={m.sofaBrown}/>
    {[-1,1].map(s=><Soft key={s} position={[s*(w/2-.08),.52,0]} size={[.18,.45,.9]} material={m.sofaBrown}/>)}
    {[-1,0,1].map((s)=><group key={s} position={[s*(w-.36)/3,0,0]}>
      <Soft position={[0,.47,.05]} size={[(w-.42)/3,.17,.67]} material={m.sofaBrown}/>
      <Pillow position={[0,.72,-.18]} size={[(w-.45)/3,.46,.18]} material={s===0?m.sofaAccent:m.sofaBrown}/>
    </group>)}
    {[-1,1].map(a=><Pillow key={a} position={[a*(w/2-.4),.73,.05]} size={[.35,.35,.13]} rotation={[.1,0,a*.22]} material={a===1?m.sofaAccent:m.sofaBrown}/>)}
  </>;
}
function HallStorage({item,m}){
  const [w,h,d]=item.size;
  return <>
    <Box position={[0,h/2,0]} size={[w-.1,h-.08,d-.025]} material={m.dark}/>
    {/* White end panels and header frame the gray fitted cabinet. */}
    {[-1,1].map(side=><Box key={side} position={[side*(w/2-.025),h/2,0]} size={[.05,h,d]} material={m.white}/>)}
    <Box position={[0,h-.035,0]} size={[w,.07,d]} material={m.white}/>
    <Box position={[0,.055,.005]} size={[w-.1,.11,d-.05]} material={m.dark}/>
    {[-1,0,1].map(column=><group key={column} position={[column*(w-.12)/3,0,0]}>
      <Box position={[0,.45,d/2-.025]} size={[(w-.15)/3,.66,.04]} material={m.hallJoinery}/>
      <Box position={[0,1.435,d/2-.025]} size={[(w-.15)/3,1.28,.04]} material={m.hallJoinery}/>
      {[.66,.94].map(y=><group key={y} position={[.13,y,d/2-.004]}>
        <Cylinder position={[0,0,.006]} rotation={[Math.PI/2,0,0]} size={[.01,.018,.01]} material={m.brass}/>
        <Ball position={[0,0,.017]} size={[.015,.015,.01]} material={m.brass}/>
      </group>)}
    </group>)}
  </>;
}
function Wardrobe({item,m}){
  const [w,h,d]=item.size,dark=item.color==='dark';
  const frame=dark?m.cabinetBlack:item.color==='oak'?m.oak:m.padded,front=dark?m.cabinetDoor:frame;
  const bottom=.12,top=h-.055,doorHeight=top-bottom;
  return <group name={`storage-${item.id}`}>
    <Box position={[0,(h+.045)/2,-.02]} size={[w,h-.045,d-.04]} material={frame}/>
    <Box position={[0,.085,d/2-.032]} size={[w,.08,.06]} material={frame}/>
    {[-1,1].map(s=><group key={s}>
      <Box position={[s*(w/4-.007),(top+bottom)/2,d/2-.032]} size={[w/2-.04,doorHeight,.035]} material={front}/>
      <Box position={[s*.043,h*.53,d/2-.008]} size={[.016,h*.78,.016]} material={m.brushedNickel}/>
      {[.19,.87].map(y=><Box key={y} position={[s*.043,h*y,d/2-.023]} size={[.018,.02,.026]} material={m.brushedNickel}/>)}
      {[-1,1].map(z=><Cylinder key={z} position={[s*(w/2-.075),.025,z*(d/2-.07)]} size={[.027,.05,.027]} material={m.black}/>)}
    </group>)}
  </group>;
}
function OvalCoffee({item,m}){
  const [w,h,d]=item.size;
  return <group name="oval-coffee-table">
    <Cylinder position={[0,.13,0]} size={[w*.32,.26,d*.32]} material={m.walnut}/>
    <Cylinder position={[0,h-.07,0]} size={[w/2,.075,d/2]} material={m.porcelain}/>
    <Cylinder position={[0,h-.029,0]} size={[w/2-.09,.008,d/2-.055]} material={m.padded}/>
    {[-.12,.1].map((x,i)=><group key={x} position={[x,h-.022,0]}><Cylinder position={[0,.09+i*.025,0]} size={[.025,.18+i*.05,.025]} material={m.glass}/><Cylinder position={[0,.005,0]} size={[.032,.01,.032]} material={m.glass}/></group>)}
    <Soft position={[w*.27,h+.025,-.015]} size={[.14,.1,.14]} material={m.black}/>
  </group>;
}
function Chair({m}) {
  return <><Legs width={.58} depth={.6} height={.42} mat={m.dark}/>
    <Soft position={[0,.46,0]} size={[.6,.14,.58]} material={m.caramel}/>
    <Soft position={[0,.73,-.25]} size={[.62,.48,.15]} rotation={[-.12,0,0]} material={m.caramel}/>
    {[-1,1].map(a=><Soft key={a} position={[a*.275,.62,-.02]} size={[.07,.22,.48]} material={m.caramel}/>)}
  </>;
}
function Place({position,rotation=0,m}) {return <group position={position} rotation={[0,rotation,0]}>
  <Cylinder position={[0,0,0]} size={[.18,.012,.18]} material={m.brass}/>
  <Cylinder position={[0,.012,0]} size={[.15,.018,.15]} material={m.black}/>
  <Cylinder position={[0,.025,0]} size={[.09,.012,.09]} material={m.ceramic}/>
  <Box position={[.22,.01,0]} size={[.015,.012,.24]} material={m.brass}/>
  <Cylinder position={[-.2,.075,-.14]} size={[.035,.14,.035]} material={m.glass}/>
</group>;}
const servingBowlGeometry=new THREE.LatheGeometry([[0,0],[.07,0],[.115,.025],[.145,.068],[.146,.078],[.136,.083],[.128,.064],[.105,.035],[.06,.016],[0,.016]].map(([x,y])=>new THREE.Vector2(x,y)),48);
function BorsokBowl({m}){
  return <>
    <mesh geometry={servingBowlGeometry} material={m.porcelain} castShadow receiveShadow/>
    {Array.from({length:19},(_,i)=>{
      const layer=i<10?0:i<16?1:2,n=layer===0?10:layer===1?6:3,j=i-(layer===0?0:layer===1?10:16),a=j/n*Math.PI*2+layer*.6,r=layer===0?.086:layer===1?.057:.025;
      return <Pillow key={i} position={[Math.cos(a)*r,.047+layer*.032,Math.sin(a)*r]} size={[.044+(i%3)*.006,.036,.048+(i%2)*.009]} rotation={[Math.sin(i)*.28,a,Math.cos(i)*.2]} material={i%3===0?m.borsokGolden:m.borsok}/>;
    })}
  </>;
}
function Dining({m}) {
  return <>
    {[-.65,.65].map(z=><Cylinder key={z} position={[0,.38,z]} size={[.2,.74,.22]} material={m.brass}/>)}
    <Cylinder position={[0,.78,0]} size={[.57,.07,1.15]} material={m.stone}/>
    {[-1,1].flatMap(x=>[-.65,0,.65].map(z=><group key={x+':'+z} position={[x*.8,0,z]} rotation={[0,-x*Math.PI/2,0]}><DiningChair m={m}/></group>))}
    {[-1,1].map(z=><group key={z} position={[0,0,z*1.24]} rotation={[0,z===1?Math.PI:0,0]}><DiningChair m={m}/></group>)}
    {/* Each setting faces its chair; inset the end settings from the oval edge. */}
    {[-1,1].flatMap(side=>[-.6,0,.6].map(z=><Place key={side+':'+z} position={[side*.25,.825,z]} rotation={side*Math.PI/2} m={m}/>))}
    {[-.3,.3].map(z=><group key={z} position={[0,.816,z]}><BorsokBowl m={m}/></group>)}
  </>;
}
// The short -Z end meets the wall; both diners face across the long sides.
function KitchenTable({item,m}) {return <group scale={[item.size[0]/1.78,1,item.size[2]/1.2]} name="kitchen-table-two-seats">
  <Legs width={.65} depth={1.1} height={.77} mat={item.kind==='breakfast'?m.brass:m.walnut}/>
  <Soft position={[0,.78,0]} size={[.7,.07,1.2]} material={m.stone}/>
  {[-1,1].map(s=><group key={s}>
    <group position={[s*.55,0,.12]} rotation={[0,-s*Math.PI/2,0]}><DiningChair m={m}/></group>
    <group position={[s*.155,.825,.17]} scale={[.82,1,.82]}><Place rotation={s*Math.PI/2} m={m}/></group>
  </group>)}
  <group position={[0,.818,-.35]}><BorsokBowl m={m}/></group>
</group>;}

function Kitchen({item,m,mode}) {
  const w=item.size[0];
  return <>
    <Box position={[0,.46,0]} size={[w,.88,.6]} material={m.dark}/>
    <Box position={[0,.92,.025]} size={[w+.04,.06,.65]} material={m.stone}/>
    <Box position={[0,1.23,-.29]} size={[w,.56,.03]} material={m.stone}/>
    {(!item.room||mode==='walkthrough')&&<Box position={[0,1.94,-.06]} size={[w,.88,.47]} material={m.white}/>}
    {[-1.45,-.72,0,.72,1.45].map(x=><group key={x}><Box position={[x,.47,.31]} size={[.008,.8,.01]} material={m.oak}/>{(!item.room||mode==='walkthrough')&&<Box position={[x,1.94,.18]} size={[.008,.86,.012]} material={m.oak}/>}<Box position={[x+.15,.78,.325]} size={[.22,.018,.03]} material={m.brass}/></group>)}
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
    <Box position={[0,h/2,-d/2+.025]} size={[w,h,.05]} material={m.walnut}/>
    {[-1,1].map(a=><Box key={a} position={[a*(w/2-.025),h/2,0]} size={[.05,h,d]} material={m.walnut}/>)}
    {[.035,h*.48,h-.035].map(y=><Box key={y} position={[0,y,0]} size={[w,.07,d]} material={m.walnut}/>)}
    {[.2,.35,.5].map(x=><Box key={x} position={[-w/2+x,h*.65,0]} size={[.09,h*.28,d*.6]} material={m.linen}/>)}
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
function TV({m,state,reducedMotion}) {
  return <>
    <Box position={[0,1.05,-.1]} size={[3.1,2.1,.18]} material={m.black}/>
    <Box position={[0,.2,.06]} size={[3.1,.22,.36]} material={m.dark}/>
    <Box position={[0,.325,.06]} size={[3.1,.014,.36]} material={m.brass}/>
    <group userData={{interaction:'tv'}}>
      <Box position={[.15,1.3,.005]} size={[2.05,1.2,.08]} material={m.white}/>
      <Box position={[.15,1.3,.055]} size={[1.78,.99,.025]} material={m.black}/>
      {state.tv&&<TVScreen reducedMotion={reducedMotion}/>}
    </group>
    {[.6,1.15,1.7].map((y,i)=><group key={y}><Box position={[-1.24,y,.055]} size={[.48,.035,.3]} material={m.brass}/><Box position={[-1.22,y+.14,.08]} size={[.12,.24,.15]} rotation={[0,0,.14]} material={[m.oak,m.white,m.taupe][i]}/><Cylinder position={[-1.4,y+.12,.08]} size={[.045,.2,.045]} material={m.ceramic}/></group>)}
  </>;
}
function Bath({item,m,activeRoom,quality,mode}) {
  if(item.kind==='tub') return <>
    <Box position={[0,.3,0]} size={[1.48,.58,.68]} material={m.ceramic}/>
    <Box position={[0,.6,0]} size={[1.28,.015,.5]} material={m.mirror}/>
    <Box position={[-.58,.75,-.24]} size={[.03,.3,.03]} material={m.brass}/>
    <Box position={[-.5,.89,-.24]} size={[.18,.025,.025]} material={m.brass}/>
  </>;
  if(item.kind==='shower')return <Shower item={item} m={m}/>;
  if(item.kind==='toilet') return <group scale={[item.size[0]/.48,item.size[1]/.8,item.size[2]/.7]}><group position={[0,0,-.01]}>
    <Box position={[0,.43,-.24]} size={[.43,.74,.2]} material={m.ceramic}/>
    <Ball position={[0,.38,.04]} size={[.24,.18,.32]} material={m.ceramic}/>
    <Cylinder position={[0,.46,.06]} size={[.17,.03,.23]} material={m.linen}/>
    <Box position={[0,.19,0]} size={[.28,.35,.35]} material={m.ceramic}/>
  </group></group>;
  return <Vanity item={item} m={m} quality={quality} active={mode==='walkthrough'&&activeRoom===(item.room||{vanity1:'bath1',vanity2:'bath2',vanity3:'bath3'}[item.id])}/>;
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
export default function Furniture({item,m,state,player,mode,activeRoom,quality,reducedMotion}) {
  const [w,h,d]=item.size;
  const content = {
    bed:()=> <Bed item={item} m={m}/>, sofa:()=> <Sofa item={item} m={m}/>, hallStorage:()=> <HallStorage item={item} m={m}/>,
    dining:()=> <group scale={[w/2.2,1,d/3]}><Dining m={m}/></group>, diningCompact:()=> <KitchenTable item={item} m={m}/>, breakfast:()=> <KitchenTable item={item} m={m}/>, kitchen:()=> <group scale={[w/3.7,1,1]}><Kitchen item={{...item,size:[3.7,h,d]}} m={m} mode={mode}/></group>,
    chair:()=> <Chair m={m}/>, plant:()=> <Plant item={item} m={m}/>,
    cabinet:()=> <Cabinet item={item} m={m} state={state} player={player} mode={mode}/>,
    tv:()=> <group scale={[w/3.1,w/3.1,1]}><TV m={m} state={state} reducedMotion={reducedMotion}/></group>,
    wardrobe:()=> <Wardrobe item={item} m={m}/>,
    coffeeOval:()=> <OvalCoffee item={item} m={m}/>,
    nightstand:()=> <><Soft position={[0,h/2,0]} size={item.size} material={m.padded}/><Box position={[0,h+.014,0]} size={[w+.025,.025,d+.025]} material={m.stone}/>{[.2,.4].map(y=><group key={y}><Box position={[0,y,d/2+.005]} size={[w-.04,.012,.012]} material={m.taupe}/><Box position={[0,y+.08,d/2+.015]} size={[.12,.018,.025]} material={m.brass}/></group>)}<Cylinder position={[0,h+.19,0]} size={[.025,.35,.025]} material={m.brass}/><Cylinder position={[0,h+.37,0]} size={[.16,.16,.16]} material={m.linen}/></>,
    console:()=> <><Box position={[0,h/2,0]} size={item.size} material={m.walnut}/><Box position={[0,h+.03,0]} size={[w+.04,.06,d+.04]} material={m.stone}/><Box position={[0,1.7,-.12]} size={[1.15,1.05,.055]} material={m.mirror}/></>,
    coffee:()=> <>{Array.from({length:7},(_,i)=><Ball key={i} position={[Math.sin(i*2.4)*.1,.5+(i%2)*.035,Math.cos(i*2.4)*.1-.15]} size={[.045,.035,.045]} material={i%2?m.pink:m.white}/>)}<Cylinder position={[.1,.28,.35]} size={[.25,.055,.25]} material={m.white}/><Cylinder position={[.1,.14,.35]} size={[.13,.28,.13]} material={m.brass}/><Cylinder position={[0,.38,-.15]} size={[.36,.065,.36]} material={m.stone}/><Cylinder position={[0,.18,0]} size={[.21,.36,.28]} material={m.walnut}/><Box position={[.02,.427,.05]} size={[.23,.045,.3]} rotation={[0,.2,0]} material={m.taupe}/><Cylinder position={[.02,.47,-.24]} size={[.06,.12,.06]} material={m.ceramic}/></>,
  }[item.kind];
  return <RigidBody type="fixed" colliders={false} position={item.position} rotation={[0,item.rotation||0,0]}>
    <CuboidCollider args={[w/2,h/2,d/2]} position={[0,h/2,0]}/>
    {content ? content() : <Bath item={item} m={m} activeRoom={activeRoom} quality={quality} mode={mode}/>}
  </RigidBody>;
}
