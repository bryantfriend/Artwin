import React from 'react';
import * as THREE from 'three';
import {cylinderGeometry} from './materials.js';

function basinGeometry(){
 const positions=[],indices=[],rings=[ [.284,.204,.168],[.264,.184,.178],[.244,.164,.168],[.223,.143,.028],[.204,.124,.018] ];
 const count=32;
 for(const [w,d,y] of rings)for(let i=0;i<count;i++){
  const corner=Math.floor(i/8),angle=corner*Math.PI/2+i%8/7*Math.PI/2,r=.045;
  const sx=corner===0||corner===3?1:-1,sz=corner<2?1:-1;
  positions.push(sx*(w-r)+Math.cos(angle)*r,y,sz*(d-r)+Math.sin(angle)*r);
 }
 for(let ring=0;ring<rings.length-1;ring++)for(let i=0;i<count;i++){
  const a=ring*count+i,b=ring*count+(i+1)%count,c=a+count,d=b+count;indices.push(a,c,b,b,c,d);
 }
 const center=positions.length/3;positions.push(0,.018,0);
 for(let i=0;i<count;i++)indices.push(center,(rings.length-1)*count+(i+1)%count,(rings.length-1)*count+i);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
const basin=basinGeometry();
const tap=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0,0,0],[0,.22,0],[0,.30,.045],[0,.32,.13],[0,.28,.19],[0,.24,.19]].map(p=>new THREE.Vector3(...p))),40,.011,10,false);
export default function KitchenSink({m}){
 return <group position={[.86,0,.03]} name="recessed-kitchen-sink">
  <mesh geometry={basin} position={[0,.785,0]} material={m.brushedNickel} castShadow receiveShadow/>
  <mesh geometry={cylinderGeometry} position={[0,.806,0]} scale={[.027,.004,.027]} material={m.dark}/>
  <mesh geometry={cylinderGeometry} position={[0,.809,0]} scale={[.019,.003,.019]} material={m.brushedNickel}/>
  <mesh geometry={tap} position={[0,.95,-.263]} material={m.brass} castShadow/>
  <mesh geometry={cylinderGeometry} position={[0,.954,-.263]} scale={[.026,.014,.026]} material={m.brass}/>
  <mesh position={[.05,1.02,-.263]} material={m.brass} castShadow><boxGeometry args={[.07,.014,.018]}/></mesh>
 </group>;
}
