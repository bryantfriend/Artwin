import React,{useMemo} from 'react';
import {boxGeometry,cylinderGeometry,ringGeometry} from './materials.js';
import {diningFixtures} from '../diningFixtures.js';

function Chandelier({fixture,m,ceiling,visible,on}){
  const [rx,rz]=fixture.radii,y=ceiling-.52,drop=.15;
  return <group name={`chandelier-${fixture.id}`} position={fixture.position} rotation={[0,fixture.rotation,0]}>
    <group visible={visible} name="chandelier-mesh">
      <mesh geometry={cylinderGeometry} material={m.chandelierGold} position={[0,ceiling-.025,0]} scale={[.1,.045,.1]}/>
      {[0,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>{
        const x=Math.cos(a)*rx*.8,z=Math.sin(a)*rz*.8;
        return <group key={a}>
          <mesh geometry={cylinderGeometry} material={m.chandelierGold} position={[x,ceiling-.018,z]} scale={[.024,.028,.024]}/>
          <mesh geometry={cylinderGeometry} material={m.metal} position={[x,(ceiling+y)/2,z]} scale={[.003,(ceiling-y)-.04,.003]}/>
        </group>;
      })}
      <mesh geometry={ringGeometry} material={m.chandelierGold} position={[0,y,0]} rotation={[-Math.PI/2,0,0]} scale={[rx,rz,.7]}/>
      <mesh geometry={ringGeometry} material={on?m.chandelierLED:m.porcelain} position={[0,y-.028,0]} rotation={[-Math.PI/2,0,0]} scale={[rx*.97,rz*.97,.5]}/>
      {Array.from({length:24},(_,i)=>{
        const a=i*Math.PI/12,h=drop+(i%3)*.022;
        return <group key={i} position={[Math.cos(a)*rx,y-.035,Math.sin(a)*rz]} rotation={[0,-a,0]}>
          <mesh geometry={boxGeometry} material={m.chandelierGold} position={[0,-.014,0]} scale={[.018,.026,.018]}/>
          <mesh geometry={boxGeometry} material={m.showerGlass} position={[0,-h/2-.02,0]} scale={[.027,h,.04]}/>
          <mesh geometry={boxGeometry} material={on?m.chandelierLED:m.porcelain} position={[0,-h+.005,0]} scale={[.015,.012,.022]}/>
        </group>;
      })}
    </group>
    {/* Retain light nodes between viewing modes to avoid shader recompilation. */}
    <pointLight name="chandelier-light" position={[0,y-.22,0]} color="#ffdb95" intensity={visible&&on?1.8:0} distance={3.2} decay={2} castShadow={false}/>
  </group>;
}

export default function DiningChandeliers({layout,m,mode,state}){
  const fixtures=useMemo(()=>diningFixtures(layout),[layout]);
  return <>{fixtures.map(fixture=><Chandelier key={fixture.id} fixture={fixture} ceiling={layout.APARTMENT.ceiling} visible={mode==='walkthrough'} on={state.lights[fixture.room]!==false} m={m}/>)}</>;
}
