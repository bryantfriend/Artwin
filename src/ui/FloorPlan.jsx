import React from 'react';
import { rooms } from '../apartmentConfig.js';

export default function FloorPlan({selected,onSelect,position,mode}) {
  return <svg className="floor-plan" viewBox="-1 -2 11.7 19" role="group" aria-label="Interactive apartment floor plan">
    {rooms.map((r)=><g key={r.id} role="button" tabIndex={0} aria-label={`Go to ${r.name}`} aria-pressed={selected===r.id} onClick={()=>onSelect(r.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(r.id);}}} className={`plan-room ${selected===r.id?'selected':''}`}>
      <polygon points={r.polygon.map(p=>p.join(',')).join(' ')}/>
      <text x={r.label[0]} y={r.label[1]}>{r.short}</text>
    </g>)}
    {mode==='walkthrough'&&position&&<g transform={`translate(${position.x} ${position.z}) rotate(${-position.yaw*180/Math.PI})`} className="plan-player"><path d="M0 -.8 -.4 -.2 .4 -.2Z"/><circle r=".17"/></g>}
    <g className="plan-entry"><path d="M7.1 6.7h-1m.4-.3-.4.3.4.3"/><text x="7.25" y="6.8">ENTRY</text></g>
  </svg>;
}
