import {translate as t,useI18n} from '../i18n.js';
import React, { useEffect, useRef, useState } from 'react';
export default function Joystick({input,disabled}) {
  useI18n();
  const pointer=useRef(null),[knob,setKnob]=useState({x:0,y:0});
  useEffect(()=>{
    const reset=()=>{pointer.current=null;input.move.x=0;input.move.z=0;setKnob({x:0,y:0});};
    if(disabled)reset();
    window.addEventListener('blur',reset);
    return ()=>window.removeEventListener('blur',reset);
  },[disabled,input]);
  function update(e) {
    if(pointer.current!==e.pointerId||disabled)return;
    const box=e.currentTarget.getBoundingClientRect();
    let x=e.clientX-box.left-box.width/2, y=e.clientY-box.top-box.height/2;
    const length=Math.hypot(x,y),scale=length>32?32/length:1;x*=scale;y*=scale;
    input.move.x=x/32;input.move.z=y/32;setKnob({x,y});
  }
  function release(e) {if(pointer.current!==e.pointerId)return;pointer.current=null;input.move.x=0;input.move.z=0;setKnob({x:0,y:0});}
  return <div className="joystick" role="group" aria-label={t("Touch movement joystick")} onPointerDown={e=>{if(disabled)return;pointer.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);update(e);}} onPointerMove={update} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
    <span style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/><small>{t("MOVE")}</small>
  </div>;
}
