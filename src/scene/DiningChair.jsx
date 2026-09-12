import React from 'react';
import * as THREE from 'three';
import { pillowGeometry } from './materials.js';

// Front is +Z. A padded, continuous shell sweeps around the seat.
const extent=1.88, segments=64, section=32;
function shellPoint(theta,v){
  const top=.98-.27*Math.pow(Math.abs(theta)/extent,1.65);
  const bottom=.43, y=(top+bottom)/2+(top-bottom)/2*Math.sin(v);
  const radius=.265+.035*(y-bottom)/(top-bottom)+.027*Math.cos(v);
  return new THREE.Vector3(radius*Math.sin(theta),y,-radius*Math.cos(theta)-.005);
}
function makeShell(){
  const positions=[],uvs=[],indices=[];
  for(let i=0;i<=segments;i++)for(let j=0;j<=section;j++){
    positions.push(...shellPoint(-extent+2*extent*i/segments,j/section*Math.PI*2));
    uvs.push(i/segments,j/section);
    if(i<segments&&j<section){const a=i*(section+1)+j,b=a+section+1;indices.push(a,a+1,b,b,a+1,b+1);}
  }
  for(const i of [0,segments]){
    const center=positions.length/3,theta=-extent+2*extent*i/segments;
    const p=shellPoint(theta,0),q=shellPoint(theta,Math.PI);
    positions.push(...p.add(q).multiplyScalar(.5));uvs.push(i/segments,.5);
    for(let j=0;j<section;j++){const a=i*(section+1)+j;indices.push(...(i===0?[center,a+1,a]:[center,a,a+1]));}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const shell=makeShell();
function tube(points,closed=false){return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,closed),96,.0018,5,closed);}
const rim=tube(Array.from({length:65},(_,i)=>shellPoint(-extent+2*extent*i/64,Math.PI/2)));
const seams=[-.98,.98].map(theta=>tube(Array.from({length:25},(_,i)=>shellPoint(theta,Math.PI*.51+i/24*Math.PI*.97))));
const seatSeam=tube(Array.from({length:64},(_,i)=>{
  const a=i/64*Math.PI*2,p=n=>Math.sign(n)*Math.pow(Math.abs(n),.45);
  return new THREE.Vector3(.276*p(Math.cos(a)),.482,.262*p(Math.sin(a))+.02);
}),true);
const legGeometry=new THREE.CylinderGeometry(.025,.014,1,14);
const legs=[-1,1].flatMap(x=>[-1,1].map(z=>{
  const top=new THREE.Vector3(x*.205,.445,z*.185),bottom=new THREE.Vector3(x*.265,.025,z*.255);
  const delta=top.clone().sub(bottom);
  return {position:top.clone().add(bottom).multiplyScalar(.5),quaternion:new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()),scale:[1,delta.length(),1]};
}));
export default function DiningChair({m}){
  return <group>
    {legs.map((props,i)=><mesh key={i} geometry={legGeometry} material={m.walnut} {...props} castShadow receiveShadow/>)}
    <mesh geometry={pillowGeometry} position={[0,.465,.02]} scale={[.28,.065,.267]} material={m.chairFabric} castShadow receiveShadow/>
    <mesh geometry={shell} material={m.chairFabric} castShadow receiveShadow/>
    {[rim,seatSeam,...seams].map((geometry,i)=><mesh key={i} geometry={geometry} material={m.chairStitch}/>)}
  </group>;
}
