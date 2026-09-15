import {translate as t,useI18n} from '../i18n.js';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { APARTMENT } from '../apartmentConfig.js';
import { createMaterials } from './materials.js';
import Architecture from './Architecture.jsx';
import Player from './Player.jsx';
import StudioLighting from './StudioLighting.jsx';
import Exterior from './Exterior.jsx';
import {interiorTextureUrls} from './interiorSurfaces.js';

const MemoArchitecture=React.memo(Architecture);

function CameraRig({layout,mode,selected,reset,tourIndex=0}) {
  const {APARTMENT,rooms,tourStops,bounds}=layout;
  const controls=useRef(); const {camera,size}=useThree();
  useEffect(()=> {
    if(mode==='tour') {
      const stop=tourStops[tourIndex];camera.fov=stop.fov+(size.width<600?8:0);camera.updateProjectionMatrix();
      camera.position.set(...stop.position);camera.lookAt(...stop.target);return;
    }
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
        for(const x of [bounds.minX,bounds.maxX])for(const y of [0,2.7])for(const z of [bounds.minZ,bounds.maxZ]) {
          const p=new THREE.Vector3(x,y,z).project(camera);
          ratio=Math.max(ratio,Math.abs(p.x)/.88,Math.abs(p.y)/.65);
        }
        distance*=ratio;
      }
      camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);
    }
    if(controls.current){controls.current.target.set(...target);controls.current.update();}
  },[mode,selected,reset,tourIndex,camera,size.width,size.height]);
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
  const {language}=useI18n();
  const {gl}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    canvas.setAttribute('aria-label',t('Apartment 3D canvas; drag to look or orbit'));
    const lost=e=>{e.preventDefault();onContextLost();};
    canvas.addEventListener('webglcontextlost',lost);
    return ()=>canvas.removeEventListener('webglcontextlost',lost);
  },[gl,onContextLost,language]);
  return null;
}
function NoGraphics({onFailure}) {
  useEffect(()=>{onFailure();},[onFailure]);
  return null;
}
function Scene(props) {
  const {tourStops}=props.layout;
  const textures=useLoader(THREE.TextureLoader,interiorTextureUrls);
  const resources=useMemo(()=>createMaterials(props.layout.theme,textures),[props.layout.theme,textures]);
  useEffect(()=>()=>resources.dispose(),[resources]);
  return <>
    <ContextEvents onContextLost={props.onContextLost}/>
    <StudioLighting evening={props.lighting==='evening'} interior={props.mode!=='dollhouse'}/>
    <color attach="background" args={[props.mode==='dollhouse'?'#e7e7e7':props.lighting==='evening'?'#7d8493':'#acd0ed']}/>
    <ambientLight intensity={props.mode==='dollhouse'?.14:.06}/>
    <hemisphereLight color="#e5eef9" groundColor="#b8a28b" intensity={props.mode==='dollhouse'?.3:props.lighting==='evening'?.10:.18}/>
    <directionalLight position={[7,12,16]} intensity={props.lighting==='evening'?.3:1.65} color={props.lighting==='evening'?'#ffd2a0':'#fff6e9'} castShadow={props.quality==='high'} shadow-radius={3} shadow-mapSize={[2048,2048]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-normalBias={.04} shadow-bias={-.0001}/>
    {props.mode==='dollhouse'&&<mesh position={[4.5,-.27,7]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#e7e7e7" roughness={1}/></mesh>}
    <Suspense fallback={null}>
      <Exterior visible={props.mode!=='dollhouse'} evening={props.lighting==='evening'}/>
      <Physics gravity={[0,-9.81,0]} timeStep={1/60} interpolate paused={props.suspended}>
        <MemoArchitecture furnished={props.furnished} evening={props.lighting==='evening'} layout={props.layout} quality={props.quality} activeRoom={props.mode==='tour'?tourStops[props.tourIndex].room:props.currentRoom} m={resources.materials} mode={props.mode==='tour'?'walkthrough':props.mode} state={props.state} player={props.player} reducedMotion={props.reducedMotion}/>
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
  render(){return this.state.error?<div className="viewer-error"><span className="eyebrow">{t("VIEWER UNAVAILABLE")}</span><h2>{t("Let’s try that again.")}</h2><p>{t("Enable hardware acceleration or use a WebGL 2 browser. If loading failed, check your connection and reload.")}</p><button className="primary-button" onClick={()=>window.location.reload()}>{t("Reload viewer")}</button></div>:this.props.children;}
}
export default function Viewer(props) {
  useI18n();
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
    camera={{position:props.layout.APARTMENT.overview.position,fov:43,near:.08,far:150}}
    gl={{antialias:true,powerPreference:'high-performance'}}
    onCreated={({gl})=>{gl.toneMapping=THREE.AgXToneMapping;gl.toneMappingExposure=1.05;gl.domElement.tabIndex=0;gl.domElement.setAttribute('aria-label',t('Apartment 3D canvas; drag to look or orbit'));}}
    fallback={<p>{t("A browser with WebGL 2 is required to view this apartment.")}</p>}
  ><Scene {...props} suspended={suspended}/></Canvas></ViewerBoundary>;
}
