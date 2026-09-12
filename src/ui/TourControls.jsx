import React from 'react';
import { tourStops } from '../tourConfig.js';
export default function TourControls({index,playing,complete,onToggle,onStep,onStop,onExplore}) {
  const stop=tourStops[index];
  return <section className="tour-card" aria-label="Guided apartment tour">
    <div className="tour-copy" aria-live="polite"><span className="eyebrow">{complete?'TOUR COMPLETE':`GUIDED TOUR · ${String(index+1).padStart(2,'0')} / ${String(tourStops.length).padStart(2,'0')}`}</span><h2>{stop.title}</h2><p>{stop.description}</p></div>
    <div className="tour-progress" aria-label="Tour stops">{tourStops.map((s,i)=><button key={s.room} aria-label={`Tour stop ${i+1}: ${s.title}`} aria-current={i===index?'step':undefined} onClick={()=>onStep(i)}><span/></button>)}</div>
    <div className="tour-actions"><button aria-label="Previous tour stop" disabled={index===0} onClick={()=>onStep(index-1)}>←</button><button className="tour-play" onClick={onToggle}>{complete?'Replay tour':playing?'Pause tour':'Resume tour'}</button><button aria-label="Next tour stop" disabled={index===tourStops.length-1} onClick={()=>onStep(index+1)}>→</button><button className="tour-explore" onClick={onExplore}>Explore this room</button><button className="tour-close" onClick={onStop} aria-label="Exit guided tour">×</button></div>
  </section>;
}
