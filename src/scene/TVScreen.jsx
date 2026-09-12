import React,{useMemo,useEffect,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import source from '../assets/tv-scene.svg?raw';

export default function TVScreen({reducedMotion}){
  const elapsed=useRef(0);
  const artwork=useMemo(()=>{
    const root=new THREE.Group(),moving={};
    const parsed=new SVGLoader().parse(source);
    parsed.paths.forEach((path,index)=>{
      const node=path.userData.node,parent=node.parentElement;
      const id=parent?.id;
      let group=root;
      if(['clouds','water','boat'].includes(id)){
        if(!moving[id]){moving[id]=new THREE.Group();root.add(moving[id]);}
        group=moving[id];
      }
      const material=new THREE.MeshBasicMaterial({color:path.color,side:THREE.DoubleSide,toneMapped:false});
      const geometry=new THREE.ShapeGeometry(SVGLoader.createShapes(path));
      const mesh=new THREE.Mesh(geometry,material);
      // Small depth offsets retain SVG paint order while respecting room occlusion.
      mesh.position.z=index*.0005;group.add(mesh);
    });
    return {root,moving};
  },[]);
  useEffect(()=>()=>artwork.root.traverse(obj=>{obj.geometry?.dispose();obj.material?.dispose();}),[artwork]);
  useFrame((_,dt)=>{
    if(document.hidden||reducedMotion)return;
    elapsed.current+=Math.min(dt,.1);const t=elapsed.current;
    // Mirror the SVG's three looping animateTransform tracks in the 3D scene.
    artwork.moving.clouds.position.x=22*Math.sin(t*Math.PI/12);
    artwork.moving.water.position.x=14*Math.sin(t*Math.PI/6);
    artwork.moving.boat.position.set(28*Math.sin(t*Math.PI/9),-2*Math.sin(t*Math.PI/9),0);
  });
  return <group position={[-.74,1.795,.070]} scale={[1.78/640,-.99/360,1]}>
    <primitive object={artwork.root}/>
  </group>;
}
