import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Generated on-device: polished surfaces work without a remote HDR download.
export default function StudioLighting() {
  const {gl,scene}=useThree();
  useEffect(()=>{
    const room=new RoomEnvironment(),generator=new THREE.PMREMGenerator(gl);
    const map=generator.fromScene(room,.04);
    const previous=scene.environment,previousIntensity=scene.environmentIntensity;
    scene.environment=map.texture;scene.environmentIntensity=.38;
    room.dispose();generator.dispose();
    return ()=>{scene.environment=previous;scene.environmentIntensity=previousIntensity;map.dispose();};
  },[gl,scene]);
  return null;
}
