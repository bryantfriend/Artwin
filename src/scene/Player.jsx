import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, useRapier, useBeforePhysicsStep } from '@react-three/rapier';
import { APARTMENT } from '../apartmentConfig.js';
import { normalizedMovement, roomAt } from '../geometry.js';
import { clearInput } from '../input.js';
import { createCharacterController, computeCharacterMovement } from '../physicsController.js';

export default function Player({mode,paused,input,player,travel,onTravel,onRoom,onPause}) {
  const body=useRef(), capsule=useRef(), controller=useRef(), handled=useRef(-1), elapsed=useRef(0);
  const {world,rapier}=useRapier();
  const {camera,gl}=useThree();
  const walking=mode==='walkthrough';
  useEffect(()=> {
    const cc=createCharacterController(world);
    controller.current=cc;
    return ()=>{controller.current=null;world.removeCharacterController(cc);};
  },[world]);
  useEffect(()=> {
    input.paused=paused;clearInput(input);
  },[paused,mode,input]);
  useEffect(()=> {
    if(!walking) return;
    const canvas=gl.domElement;
    function keydown(e) {
      if(e.target instanceof HTMLElement && e.target.matches('input,select,textarea'))return;
      if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {e.preventDefault();input.keys.add(e.code);}
      if(e.code==='Escape') {clearInput(input);onPause(true);}
    }
    function keyup(e){input.keys.delete(e.code);}
    function reset(){clearInput(input);onPause(true);}
    function visibility(){if(document.hidden)reset();}
    function lockChange(){clearInput(input);onPause(document.pointerLockElement!==canvas);}
    function look(dx,dy){if(input.paused)return;input.yaw-=dx*.003;input.pitch=Math.max(-1.3,Math.min(1.3,input.pitch-dy*.003));}
    function mousemove(e){if(document.pointerLockElement===canvas)look(e.movementX,e.movementY);}
    function down(e){
      if(document.pointerLockElement===canvas||input.paused||e.button!==0)return;
      canvas.focus();input.drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
    }
    function move(e){
      const d=input.drag;if(!d||d.id!==e.pointerId)return;
      look(e.clientX-d.x,e.clientY-d.y);d.x=e.clientX;d.y=e.clientY;
    }
    function up(e){if(input.drag?.id===e.pointerId)input.drag=null;}
    window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
    window.addEventListener('blur',reset);document.addEventListener('visibilitychange',visibility);
    document.addEventListener('pointerlockchange',lockChange);document.addEventListener('mousemove',mousemove);
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
    canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('lostpointercapture',up);
    return ()=>{
      clearInput(input);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);
      window.removeEventListener('blur',reset);document.removeEventListener('visibilitychange',visibility);
      document.removeEventListener('pointerlockchange',lockChange);document.removeEventListener('mousemove',mousemove);
      canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('lostpointercapture',up);
      if(document.pointerLockElement===canvas)document.exitPointerLock();
    };
  },[walking,input,gl,onPause]);

  useBeforePhysicsStep(()=> {
    if(!body.current||!capsule.current||!controller.current||!walking)return;
    if(travel&&handled.current!==travel.sequence) {
      handled.current=travel.sequence;
      const [x,y,z]=travel.position;
      let blocked=false;
      world.intersectionsWithShape({x,y,z},{x:0,y:0,z:0,w:1},new rapier.Capsule(APARTMENT.playerHalfHeight,APARTMENT.playerRadius),()=>{blocked=true;return false;},undefined,undefined,capsule.current,body.current);
      clearInput(input);
      if(!blocked) {
        body.current.setTranslation({x,y,z},true);body.current.setNextKinematicTranslation({x,y,z});
        input.yaw=travel.yaw;input.pitch=0;player.current={x,y,z,yaw:input.yaw};
      }
      onTravel(!blocked);
      return;
    }
    const p=body.current.translation();
    const keys=input.keys;
    let x=input.move.x+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
    let z=input.move.z+Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
    if(paused||input.paused){x=0;z=0;}
    const move=normalizedMovement(x,z,input.yaw);
    const corrected=computeCharacterMovement(controller.current,capsule.current,move.x/60,move.z/60);
    body.current.setNextKinematicTranslation({x:p.x+corrected.x,y:p.y+corrected.y,z:p.z+corrected.z});
    player.current={x:p.x,y:p.y,z:p.z,yaw:input.yaw};
  });
  useFrame((_,dt)=>{
    if(!walking||!body.current)return;
    const p=body.current.translation();
    camera.position.set(p.x,p.y+APARTMENT.eyeHeight-APARTMENT.playerCenterHeight,p.z);
    camera.rotation.set(input.pitch,input.yaw,0,'YXZ');
    elapsed.current+=dt;
    if(elapsed.current>.15){elapsed.current=0;onRoom(roomAt(p.x,p.z),{x:p.x,z:p.z,yaw:input.yaw});}
  });
  return <RigidBody ref={body} type="kinematicPosition" colliders={false} position={APARTMENT.entrance.position} enabledRotations={[false,false,false]}>
    <CapsuleCollider ref={capsule} args={[APARTMENT.playerHalfHeight,APARTMENT.playerRadius]}/>
  </RigidBody>;
}
