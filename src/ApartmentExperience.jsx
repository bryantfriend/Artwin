import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APARTMENT, rooms, doors, switches } from './apartmentConfig.js';
import { createInput, clearInput } from './input.js';
import Icon from './ui/Icon.jsx';
import FloorPlan from './ui/FloorPlan.jsx';
import Joystick from './ui/Joystick.jsx';
import ErrorBoundary from './ui/ErrorBoundary.jsx';
import TourControls from './ui/TourControls.jsx';
import { tourStops } from './tourConfig.js';
import {projectHref} from './projects.js';
const Viewer=lazy(()=>import('./scene/Viewer.jsx'));

export default function ApartmentExperience({project,plan}) {
  const [tourIndex,setTourIndex]=useState(0),[tourPlaying,setTourPlaying]=useState(false),[tourComplete,setTourComplete]=useState(false);
  const [visible,setVisible]=useState(()=>!document.hidden);
  const [mode,setMode]=useState('dollhouse'),[selected,setSelected]=useState(null),[currentRoom,setCurrentRoom]=useState('hall');
  const [state,setState]=useState({doors:{},lights:{},tv:false,cabinet:false});
  const [ready,setReady]=useState(false),[paused,setPaused]=useState(false),[planOpen,setPlanOpen]=useState(()=>window.innerWidth>=760),[help,setHelp]=useState(false);
  const [quality,setQuality]=useState(()=>window.matchMedia('(max-width: 760px)').matches?'low':'high');
  const [target,setTarget]=useState(null),[reset,setReset]=useState(0),[position,setPosition]=useState(null),[travel,setTravel]=useState(null);
  const [fade,setFade]=useState(false),[notice,setNotice]=useState(''),[contextLost,setContextLost]=useState(false);
  const viewerRef=useRef(),player=useRef(),sequence=useRef(0),travelTimer=useRef(),noticeTimer=useRef();
  const input=useMemo(createInput,[]);
  useEffect(()=>()=>{clearInput(input);if(document.pointerLockElement)document.exitPointerLock();},[input]);
  const reducedMotion=useMemo(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches,[]);
  const room=rooms.find(r=>r.id===(mode==='walkthrough'?currentRoom:selected));
  const toast=useCallback(text=>{setNotice(text);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4200);},[]);
  useEffect(()=>()=>{clearTimeout(travelTimer.current);clearTimeout(noticeTimer.current);},[]);
  useEffect(()=>{
    if(!help)return;
    const previous=document.activeElement;
    function trap(e) {
      if(e.key==='Escape'){setHelp(false);return;}
      if(e.key!=='Tab')return;
      const items=[...document.querySelectorAll('.help-dialog button')];
      const first=items[0],last=items.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
    document.addEventListener('keydown',trap);
    return ()=>{document.removeEventListener('keydown',trap);if(previous instanceof HTMLElement)previous.focus();};
  },[help]);
  const onReady=useCallback(()=>setReady(true),[]);
  const onPause=useCallback(value=>setPaused(value),[]);
  const onRoom=useCallback((id,pos)=>{setCurrentRoom(id);setPosition(pos);},[]);
  const onTravel=useCallback(success=>{setFade(false);if(!success)toast('That spot is obstructed. Try another room or return to the entrance.');},[toast]);
  function requestTravel(destination,yaw) {
    clearInput(input);clearTimeout(travelTimer.current);setFade(true);
    travelTimer.current=setTimeout(()=>setTravel({position:destination,yaw,sequence:++sequence.current}),reducedMotion?0:180);
  }
  function changeMode(next) {
    setTourPlaying(false);setTourComplete(false);
    if(next===mode)return;
    clearTimeout(travelTimer.current);setFade(false);clearInput(input);setTarget(null);setHelp(false);setPaused(false);setMode(next);
    if(next==='walkthrough'){setSelected(null);requestTravel(APARTMENT.entrance.position,APARTMENT.entrance.yaw);}
    else {setSelected(null);setReset(v=>v+1);if(document.pointerLockElement)document.exitPointerLock();}
  }
  function selectRoom(id) {
    if(mode==='tour'){setTourPlaying(false);setMode('dollhouse');}
    const r=rooms.find(r=>r.id===id);if(!r)return;
    setSelected(id);
    if(mode==='walkthrough') {setPaused(false);requestTravel(r.destination,r.yaw);}
    if(window.innerWidth<760)setPlanOpen(false);
  }
  function recover() {
    if(mode==='tour'){setTourIndex(0);setTourComplete(false);return;}
    if(mode==='walkthrough'){setPaused(false);requestTravel(APARTMENT.entrance.position,APARTMENT.entrance.yaw);}
    else {setSelected(null);setReset(v=>v+1);}
  }
  function startTour() {
    clearInput(input);setPaused(false);setHelp(false);setTarget(null);setSelected(null);setTourIndex(0);setTourComplete(false);setTourPlaying(!reducedMotion);setMode('tour');
    if(document.pointerLockElement)document.exitPointerLock();
    if(window.innerWidth<760)setPlanOpen(false);
  }
  function stepTour(index){setTourIndex(index);setTourComplete(false);}
  function toggleTour(){if(tourComplete){setTourIndex(0);setTourComplete(false);setTourPlaying(true);}else setTourPlaying(v=>!v);}
  function exploreTourRoom(){const r=rooms.find(r=>r.id===tourStops[tourIndex].room);setTourPlaying(false);setMode('walkthrough');setSelected(r.id);setPaused(false);requestTravel(r.destination,r.yaw);}
  useEffect(()=>{const fn=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',fn);return()=>document.removeEventListener('visibilitychange',fn);},[]);
  useEffect(()=>{
    if(mode!=='tour'||!tourPlaying||!ready||help||!visible||contextLost)return;
    const timer=setTimeout(()=>{if(tourIndex===tourStops.length-1){setTourPlaying(false);setTourComplete(true);}else setTourIndex(i=>i+1);},8500);
    return()=>clearTimeout(timer);
  },[mode,tourIndex,tourPlaying,ready,help,visible,contextLost]);
  useEffect(()=>{if(mode!=='tour')return;const escape=e=>{if(e.key==='Escape')setTourPlaying(false);};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[mode]);
  const activate=useCallback(()=>{
    if(!target||paused||help||mode!=='walkthrough')return;
    setState(previous=>{
      if(doors.some(d=>d.id===target))return {...previous,doors:{...previous.doors,[target]:!previous.doors[target]}};
      const s=switches.find(s=>s.id===target);
      if(s)return {...previous,lights:{...previous.lights,[s.room]:previous.lights[s.room]===false}};
      if(target==='tv'||target==='cabinet')return {...previous,[target]:!previous[target]};
      return previous;
    });
  },[target,paused,help,mode]);
  useEffect(()=>{
    const handler=e=>{if(e.code==='KeyE'&&!e.repeat&&!e.target.matches('input,select,textarea'))activate();};
    window.addEventListener('keydown',handler);return ()=>window.removeEventListener('keydown',handler);
  },[activate]);
  async function lockMouse() {
    const canvas=viewerRef.current?.querySelector('canvas');
    setPaused(false);
    try{if(!canvas?.requestPointerLock)throw Error('Unsupported');await canvas.requestPointerLock();}
    catch{toast('Mouse capture is unavailable. Drag the scene to look around.');}
  }
  async function fullscreen() {
    try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}
    catch{toast('Fullscreen is unavailable in this browser.');}
  }
  const targetDoor=doors.find(d=>d.id===target),targetSwitch=switches.find(s=>s.id===target);
  const prompt=targetDoor?`${state.doors[target]?'Close':'Open'} ${targetDoor.name}`
    :targetSwitch?`Turn ${rooms.find(r=>r.id===targetSwitch.room).name} light ${state.lights[targetSwitch.room]===false?'on':'off'}`
    :target==='tv'?`Turn television ${state.tv?'off':'on'}`
    :`${state.cabinet?'Close':'Open'} cabinet`;
  return <div className={`app mode-${mode}`}>
    <header className="topbar">
      <a className="wordmark" href="#/projects" aria-label="Artwin home"><img src={`${import.meta.env.BASE_URL}artwin-logo.png`} alt="ARTWIN" width="287" height="88"/></a>
      <div className="header-divider"/><span className="header-caption">SPACES FOR LIVING</span>
      <div className="header-end"><a className="apartment-project-back" href={projectHref(project)} aria-label={`Back to ${project.name} floor plans`}><Icon name="arrow" size={16}/>{project.name}<span>{plan.area} M² · FLOOR PLANS</span></a><button className="icon-button help-button" onClick={()=>{setHelp(true);clearInput(input);}} aria-label="Open controls and help"><Icon name="help"/></button></div>
    </header>
    <main>
      <aside className="sidebar">
        <div className="intro"><div className="eyebrow"><span className="red-line"/> THE FOUR-ROOM RESIDENCE</div>
          <h1>A little more<br/> room to <em>live.</em></h1>
          <p className="intro-copy">Explore the spaces.<br/>Imagine the everyday.</p>
          <div className="stats"><div><strong>{APARTMENT.advertisedArea}<span> m²</span></strong><small>ADVERTISED AREA</small></div><div className="stat-divider"/><div><strong>3</strong><small>BEDROOMS</small></div></div>
        </div>
        <div className={`plan-panel ${planOpen?'open':''}`}>
          <button className="plan-heading" onClick={()=>setPlanOpen(!planOpen)} aria-expanded={planOpen}><span><Icon name="plan" size={17}/> YOUR FLOOR PLAN</span><span>{planOpen?'−':'+'}</span></button>
          {planOpen&&<><FloorPlan selected={mode==='tour'?tourStops[tourIndex].room:mode==='walkthrough'?currentRoom:selected} onSelect={selectRoom} position={position} mode={mode}/><div className="plan-caption"><span className="plan-dot"/> Select a room to explore</div></>}
        </div>
        <p className="reference-note">Approximate visualization based on the supplied reference.</p>
      </aside>
      <section className="experience" aria-label="Interactive 3D apartment viewer">
        <div className="viewer" ref={viewerRef}>
          <ErrorBoundary><Suspense fallback={null}><Viewer currentRoom={currentRoom} tourIndex={tourIndex} mode={mode} selected={selected} reset={reset} onSelect={selectRoom} state={state} player={player} input={input} travel={travel} onTravel={onTravel} paused={paused||help||fade} onPause={onPause} onRoom={onRoom} onTarget={setTarget} quality={quality} reducedMotion={reducedMotion} onReady={onReady} onContextLost={()=>setContextLost(true)}/></Suspense></ErrorBoundary>
        </div>
        <nav className="mode-switch" aria-label="Viewing mode"><button onClick={()=>changeMode('dollhouse')} aria-pressed={mode==='dollhouse'}><Icon name="cube" size={17}/> Dollhouse</button><button disabled={!ready} onClick={()=>changeMode('walkthrough')} aria-pressed={mode==='walkthrough'}><Icon name="walk" size={17}/> Walkthrough</button></nav>
        <div className="scene-label"><span className="live-dot"/>{mode==='dollhouse'?'INTERACTIVE 3D VIEW':'INSIDE THE RESIDENCE'}</div>
        <div className="viewer-tools"><button className="icon-button" onClick={recover} aria-label={mode==='dollhouse'?'Reset view':'Return to entrance'} title={mode==='dollhouse'?'Reset view':'Return to entrance'}><Icon name="reset"/></button><button className="icon-button" onClick={fullscreen} aria-label="Toggle fullscreen" title="Fullscreen"><Icon name="expand"/></button></div>
        {mode==='dollhouse'&&<div className="compass"><span>N</span><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 5 27 30 20 25 13 30Z"/></svg></div>}
        {(!ready||contextLost)&&<div className="loading-overlay"><div className="loading-symbol"><img src={`${import.meta.env.BASE_URL}artwin-logo.png`} alt="ARTWIN" width="287" height="88"/></div><h2>{contextLost?'The graphics connection was lost.':'Making room for you.'}</h2><p>{contextLost?'Reload to restore the apartment.':'Preparing the apartment and physics…'}</p>{contextLost&&<button className="primary-button" onClick={()=>location.reload()}>Reload viewer</button>}</div>}
        {mode==='walkthrough'&&ready&&!help&&<>
          {!paused&&<div className={`reticle ${target?'targeted':''}`}/>}
          {target&&!paused&&<button className="interaction-prompt" onClick={activate}><kbd>E</kbd> {prompt}</button>}
          {paused&&<div className="pause-card"><Icon name="eye" size={28}/><h2>Take your time.</h2><p>Your walkthrough is paused.</p><button className="primary-button" onClick={()=>setPaused(false)}>Continue exploring <Icon name="arrow"/></button></div>}
          {!paused&&<><Joystick input={input} disabled={help||fade}/><div className="touch-look-hint">DRAG TO LOOK</div><button className="touch-interact" onClick={activate} disabled={!target}>Interact</button></>}
        </>}
        {mode==='tour'&&<><div key={tourIndex} className="tour-scene-fade" aria-hidden="true"/><TourControls index={tourIndex} playing={tourPlaying&&!help&&visible} complete={tourComplete} onToggle={toggleTour} onStep={stepTour} onStop={()=>changeMode('dollhouse')} onExplore={exploreTourRoom}/></>}
        <div className={`transition-fade ${fade?'active':''}`} aria-hidden="true"/>
        <div className="scene-bottom" hidden={mode==='tour'}>
          <div className="scene-title"><span className="eyebrow">{mode==='dollhouse'?(room?'A CLOSER LOOK':'A NEW PERSPECTIVE'):'YOU ARE HERE'}</span><h2>{room?.name||'The whole picture.'}</h2><p>{room?.subtitle||'Thoughtful spaces. Effortlessly connected.'}</p></div>
          {mode==='dollhouse'?<div className="entry-actions"><button className="secondary-button tour-start" disabled={!ready} onClick={startTour}>Take a guided tour</button><button className="primary-button enter-button" disabled={!ready} onClick={()=>changeMode('walkthrough')}>Step inside <Icon name="arrow"/></button></div>:<button className="secondary-button mouse-button" onClick={lockMouse}><Icon name="eye" size={17}/> Capture mouse</button>}
        </div>
      </section>
    </main>
    <footer className="bottom-bar"><div className="navigation-hint"><Icon name={mode==='dollhouse'?'cube':'walk'} size={17}/>{mode==='tour'?'A guided look inside · Pause at any time':mode==='dollhouse'?'Drag to orbit · Scroll to zoom':'WASD to move · Drag to look · E to interact · Esc to pause'}</div><div className="footer-actions"><label className="quality-picker">DETAIL <select aria-label="Graphics quality" value={quality} onChange={e=>setQuality(e.target.value)}><option value="high">High</option><option value="low">Light</option></select></label><label className="room-picker"><select aria-label="Select a room" value={selected||''} onChange={e=>selectRoom(e.target.value)}><option value="" disabled>Explore a room</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label></div></footer>
    {notice&&<div className="toast" role="status">{notice}</div>}
    {help&&<div className="modal-backdrop" onClick={()=>setHelp(false)}><section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==='Escape')setHelp(false);}}><button autoFocus className="icon-button modal-close" onClick={()=>setHelp(false)} aria-label="Close help"><Icon name="close"/></button><span className="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="help-title">A few ways to explore.</h2><div className="help-row"><Icon name="cube"/><div><h3>See the whole apartment</h3><p>Drag to orbit. Scroll or pinch to zoom. Select a room on the plan for a closer look.</p></div></div><div className="help-row"><Icon name="walk"/><div><h3>Step inside</h3><p>Move with WASD or arrow keys. Drag to look, or choose Capture mouse. Press Escape to pause. On touchscreens, use the left joystick and drag the scene with your other finger.</p></div></div><div className="help-row"><Icon name="light"/><div><h3>Make the space your own</h3><p>Look at a nearby door, wall switch, television, or living-room cabinet. Press E or tap the prompt to interact. If a door pauses, step out of its swing.</p></div></div><div className="help-row"><Icon name="plan"/><div><h3>Go straight to a room</h3><p>The floor plan moves you to a checked destination with a brief fade. The reset button returns you to the entrance.</p></div></div><p className="help-note">134.68 m² is the advertised area. Geometry, dimensions, finishes, and furnishings are approximate. This is a visual study, not a construction drawing.</p><button className="primary-button" onClick={()=>setHelp(false)}>Got it <Icon name="arrow"/></button></section></div>}
  </div>;
}
