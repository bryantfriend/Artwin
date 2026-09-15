import {useEffect,useMemo,useRef,useState} from 'react';
import {canOfferMotion,createOrientationSession} from '../deviceOrientation.js';

export default function useMotionControl(walking,onNotice,onEnable) {
  const [status,setStatus]=useState('off');
  const callbacks=useRef();callbacks.current={onNotice,onEnable};
  const available=useMemo(()=>canOfferMotion(window),[]);
  const session=useMemo(()=>createOrientationSession(window,next=>{
    setStatus(next);
    if(next==='active'){
      callbacks.current.onEnable();
      callbacks.current.onNotice('Move your phone to look around. You can still swipe.');
    }
    if(next==='denied')callbacks.current.onNotice('Motion permission was not granted. You can still swipe to look around.');
    if(next==='unavailable')callbacks.current.onNotice('Motion sensors are unavailable in this browser. Swipe to look around.');
  }),[]);
  useEffect(()=>{if(!walking)session.stop();},[walking,session]);
  useEffect(()=>()=>session.stop(),[session]);
  function toggle() {
    if(status==='active'||status==='requesting'){
      session.stop();onNotice('Motion off. Swipe to look around.');
    }else session.start();
  }
  function recenter(){session.recenter();onNotice('Motion centered. Hold your phone comfortably and keep exploring.');}
  return {available,status,session,toggle,recenter};
}
