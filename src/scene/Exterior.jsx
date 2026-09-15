import React,{useMemo,useEffect,useRef,useCallback} from 'react';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';

// Blend the finite panorama into the sky and ground, including from balconies.
function softenPanoramaEdges(shader){
  shader.uniforms.skyTone={value:new THREE.Color('#acd0ed')};
  shader.uniforms.groundTone={value:new THREE.Color('#718568')};
  shader.fragmentShader='uniform vec3 skyTone;\nuniform vec3 groundTone;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    #ifdef USE_MAP
      diffuseColor.rgb=mix(diffuseColor.rgb,skyTone,smoothstep(.80,1.0,vMapUv.y));
      diffuseColor.rgb=mix(diffuseColor.rgb,groundTone,1.0-smoothstep(0.0,.16,vMapUv.y));
    #endif`);
}

export default function Exterior({visible,evening=false}){
  const compiled=useRef(null),currentEvening=useRef(evening);currentEvening.current=evening;
  const tint=shader=>{
    shader.uniforms.skyTone.value.set(currentEvening.current?'#7d8493':'#acd0ed');
    shader.uniforms.groundTone.value.set(currentEvening.current?'#384b43':'#718568');
  };
  const compile=useCallback(shader=>{softenPanoramaEdges(shader);compiled.current=shader;tint(shader);},[]);
  useEffect(()=>{if(compiled.current)tint(compiled.current);},[evening]);
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
      <meshBasicMaterial map={texture} color={evening?'#8797b0':'#ffffff'} side={THREE.BackSide} toneMapped={false} onBeforeCompile={compile}/>
    </mesh>
    <mesh position={[4.9,-18,7.5]} rotation={[-Math.PI/2,0,0]} raycast={()=>null}>
      <circleGeometry args={[45,64]}/><meshBasicMaterial color={evening?'#384b43':'#718568'} toneMapped={false}/>
    </mesh>
  </group>;
}
