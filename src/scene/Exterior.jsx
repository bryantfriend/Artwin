import React,{useMemo,useEffect} from 'react';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';

export default function Exterior({visible}){
  const source=useLoader(THREE.TextureLoader,`${import.meta.env.BASE_URL}textures/kyrgyz-city-panorama.jpg`);
  const texture=useMemo(()=>{
    const t=source.clone();t.colorSpace=THREE.SRGBColorSpace;
    // Mirrored halves close the panorama without a hard seam at either join.
    t.wrapS=THREE.MirroredRepeatWrapping;t.repeat.set(2,1);t.anisotropy=4;t.needsUpdate=true;return t;
  },[source]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  return <group visible={visible}>
    {/* Distant, world-fixed scenery keeps the view steady as the visitor moves. */}
    <mesh position={[4.9,-2,7.5]} raycast={()=>null}>
      <cylinderGeometry args={[45,45,32,128,1,true]}/>
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false}/>
    </mesh>
    <mesh position={[4.9,-18,7.5]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}>
      <circleGeometry args={[45,64]}/><meshBasicMaterial color="#718568" toneMapped={false}/>
    </mesh>
  </group>;
}
