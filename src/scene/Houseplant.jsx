import React from 'react';
import * as THREE from 'three';

const pot=new THREE.LatheGeometry([[0,0],[.13,0],[.16,.035],[.195,.39],[.19,.415],[.176,.415],[.174,.39],[.148,.055],[0,.055]].map(p=>new THREE.Vector2(...p)),40);
const soil=new THREE.CircleGeometry(.17,32),stem=new THREE.CylinderGeometry(.004,.008,1,8);
function leafGeometry(){
 const vertices=[],uv=[],indices=[],segments=14;
 for(let row=0;row<=segments;row++){
  const t=row/segments,width=Math.sin(Math.PI*t)**.8*.13;
  for(let side=-1;side<=1;side++){
   vertices.push(side*width,.06*Math.sin(t*Math.PI)-Math.abs(side)*.025*Math.sin(t*Math.PI),t*.38);
   uv.push((side+1)/2,t);
  }
  if(row<segments)for(let side=0;side<2;side++){const a=row*3+side;indices.push(a,a+3,a+1,a+1,a+3,a+4);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const leaf=leafGeometry();
export default function Houseplant({item,m}){
 const h=item.size[1],width=Math.min(item.size[0],item.size[2]),spread=Math.min(1,width/.65);
 return <group name="sculpted-houseplant">
  <mesh geometry={pot} material={m.terracotta} castShadow receiveShadow/>
  <mesh geometry={soil} material={m.soil} rotation={[-Math.PI/2,0,0]} position={[0,.392,0]}/>
  <mesh geometry={stem} material={m.walnut} scale={[1,h-.45,1]} position={[0,(h+.35)/2,0]} castShadow/>
  {Array.from({length:13},(_,i)=>{
   const fraction=i/13,angle=i*2.399,y=.5+fraction*(h-.6),length=(1-fraction*.38)*spread;
   return <group key={i} position={[0,y,0]} rotation={[-.4+Math.sin(i*1.7)*.3,angle,Math.sin(i)*.18]} scale={[length,length,length]}>
    <mesh geometry={leaf} material={i%3===0?m.leafLight:m.leaf} castShadow receiveShadow/>
    <mesh geometry={stem} material={m.leafVein} position={[0,.009,.16]} rotation={[Math.PI/2,0,0]} scale={[.4,.32,.4]}/>
   </group>;
  })}
 </group>;
}
