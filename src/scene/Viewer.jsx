import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { APARTMENT, rooms } from '../apartmentConfig.js';
import { createMaterials } from './materials.js';
import Architecture from './Architecture.jsx';
import Player from './Player.jsx';
const MemoArchitecture=React.memo(Architecture);

function CameraRig({mode,selected,reset}) {
  const controls=useRef(); const {camera,size}=useThree();
  useEffect(()=> {
    camera.fov=mode==='walkthrough'?65:43;camera.updateProjectionMatrix();
    if(mode!=='dollhouse')return;
    const room=rooms.find(r=>r.id===selected);
    const target=selected&&room?[room.label[0],0,room.label[1]]:APARTMENT.overview.target;
    const position=selected&&room?[target[0]+9,11,target[2]-5]:APARTMENT.overview.position;
    camera.position.set(...position);camera.lookAt(...target);
    if(!selected) {
      const center=new THREE.Vector3(...target),direction=camera.position.clone().sub(center).normalize();
      if(size.width<600)direction.set(.24,.95,1).normalize();
      let distance=28;
      // Fit actual apartment bounds rather than assuming a landscape viewport.
      for(let i=0;i<4;i++) {
        camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateMatrixWorld();
        let ratio=0;
        for(const x of [0,9.8])for(const y of [0,2.7])for(const z of [-1.2,16.1]) {
          const p=new THREE.Vector3(x,y,z).project(camera);
          ratio=Math.max(ratio,Math.abs(p.x)/.88,Math.abs(p.y)/.65);
        }
        distance*=ratio;
      }
      camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);
    }
    if(controls.current){controls.current.target.set(...target);controls.current.update();}
  },[mode,selected,reset,camera,size.width,size.height]);
  if(mode!=='dollhouse')return null;
  return <>
    <OrbitControls ref={controls} makeDefault minDistance={5} maxDistance={65} maxPolarAngle={Math.PI*.46} minPolarAngle={.12} enablePan={false} target={APARTMENT.overview.target}/>

  </>;
}
function Targeting({mode,paused,onTarget}) {
  const {camera,scene}=useThree();
  const ray=useMemo(()=>new THREE.Raycaster(),[]);const tick=useRef(0), previous=useRef(null);
  useFrame((_,dt)=> {
    tick.current+=dt;if(tick.current<.1)return;tick.current=0;
    let target=null;
    if(mode==='walkthrough'&&!paused) {
      ray.setFromCamera({x:0,y:0},camera);ray.far=APARTMENT.interactionDistance;
      const hits=ray.intersectObjects(scene.children,true);
      for(const hit of hits) {
        // Only rendered meshes may block a targeting ray.
        let visible=true;for(let p=hit.object;p;p=p.parent)if(!p.visible)visible=false;
        if(!visible)continue;
        for(let obj=hit.object;obj;obj=obj.parent) if(obj.userData.interaction){target=obj.userData.interaction;break;}
        break;
      }
    }
    if(previous.current!==target){previous.current=target;onTarget(target);}
  });
  return null;
}
function SceneReady({onReady}) {useEffect(()=>{onReady();},[onReady]);return null;}
function ContextEvents({onContextLost}) {
  const {gl}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    const lost=e=>{e.preventDefault();onContextLost();};
    canvas.addEventListener('webglcontextlost',lost);
    return ()=>canvas.removeEventListener('webglcontextlost',lost);
  },[gl,onContextLost]);
  return null;
}
function NoGraphics({onFailure}) {
  useEffect(()=>{onFailure();},[onFailure]);
  return null;
}
function Scene(props) {
  const resources=useMemo(createMaterials,[]);
  useEffect(()=>()=>resources.dispose(),[resources]);
  return <>
    <ContextEvents onContextLost={props.onContextLost}/>
    <color attach="background" args={['#e7e7e7']}/>
    <ambientLight intensity={props.mode==='walkthrough'?.7:.7}/>
    <hemisphereLight color="#ffffff" groundColor="#a6a5a2" intensity={.85}/>
    <directionalLight position={[3,15,6]} intensity={1.8} castShadow={props.quality==='high'} shadow-mapSize={[2048,2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-normalBias={.04} shadow-bias={-.0001}/>
    {props.mode==='dollhouse'&&<mesh position={[4.5,-.27,7]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#e7e7e7" roughness={1}/></mesh>}
    <Suspense fallback={null}>
      <Physics gravity={[0,-9.81,0]} timeStep={1/60} interpolate paused={props.suspended}>
        <MemoArchitecture m={resources.materials} mode={props.mode} state={props.state} player={props.player} reducedMotion={props.reducedMotion}/>
        <Player {...props}/>
        <SceneReady onReady={props.onReady}/>
      </Physics>
    </Suspense>
    <CameraRig {...props}/>
    <Targeting {...props}/>
  </>;
}
export class ViewerBoundary extends React.Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  componentDidCatch(error){console.error('Viewer failed:',error);this.props.onFailure?.();}
  render(){return this.state.error?<div className="viewer-error"><span className="eyebrow">VIEWER UNAVAILABLE</span><h2>Let’s try that again.</h2><p>Enable hardware acceleration or use a WebGL 2 browser. If loading failed, check your connection and reload.</p><button className="primary-button" onClick={()=>window.location.reload()}>Reload viewer</button></div>:this.props.children;}
}
export default function Viewer(props) {
  const [suspended,setSuspended]=useState(false);
  const supported=useMemo(()=>{
    try {
      const probe=document.createElement('canvas').getContext('webgl2');
      if(!probe)return false;
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
    }catch{return false;}
  },[]);
  useEffect(()=>{
    const fn=()=>setSuspended(document.hidden);
    document.addEventListener('visibilitychange',fn);
    return ()=>document.removeEventListener('visibilitychange',fn);
  },[]);
  if(!supported)return <NoGraphics onFailure={props.onContextLost}/>;
  return <ViewerBoundary onFailure={props.onContextLost}><Canvas
    shadows={props.quality==='high'?{type:THREE.PCFShadowMap}:false} dpr={props.quality==='high'?[1,1.6]:1}
    camera={{position:APARTMENT.overview.position,fov:43,near:.08,far:150}}
    gl={{antialias:true,powerPreference:'high-performance'}}
    onCreated={({gl})=>{gl.domElement.tabIndex=0;gl.domElement.setAttribute('aria-label','Apartment 3D canvas; drag to look or orbit');}}
    fallback={<p>A browser with WebGL 2 is required to view this apartment.</p>}
  ><Scene {...props} suspended={suspended}/></Canvas></ViewerBoundary>;
}
