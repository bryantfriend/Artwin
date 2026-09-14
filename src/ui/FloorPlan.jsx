import {translate as t,useI18n} from '../i18n.js';
import React from 'react';
import {wallYaw} from '../geometry.js';
import {originalLayout} from '../layouts/index.js';

// Advertised room areas transcribed from the supplied plan, not calculated
// from the approximate walkthrough geometry.
const areas={living:'30.02',kitchen:'16.31',primary:'20.52',bedroom2:'15.67',bedroom3:'15.03',hall:'19.53',bath1:'3.25',bath2:'3.90',bath3:'3.79',loggia1:'3.48',loggia2:'3.18'};
const labels={living:'Living room',kitchen:'Kitchen',primary:'Bedroom',bedroom2:'Bedroom',bedroom3:'Bedroom',hall:'Hall',bath1:'Bathroom',bath2:'Bathroom',bath3:'Bathroom',loggia1:'Loggia',loggia2:'Loggia'};
function PlanWall({wall}) {
  if(wall.railing)return <g transform={`translate(${wall.start[0]} ${wall.start[1]}) rotate(${-wallYaw(wall)*180/Math.PI})`} className="plan-window"><path d={`M0 -.04H${wall.length}M0 .04H${wall.length}`}/></g>;
  const openings=[...(wall.openings||[])].sort((a,b)=>a.at-b.at),segments=[];
  let end=0;
  for(const o of openings){if(o.at>end)segments.push([end,o.at]);end=o.at+o.width;}
  if(end<wall.length)segments.push([end,wall.length]);
  return <g transform={`translate(${wall.start[0]} ${wall.start[1]}) rotate(${-wallYaw(wall)*180/Math.PI})`} className={`plan-wall ${wall.exterior?'exterior':''}`}>
    {segments.map(([a,b],i)=><path key={i} d={`M${a} 0H${b}`}/>)}
    {openings.map((o,i)=>{const sign=wall.roomIds?(o.hingeAtEnd?1:-1)*(o.swing||1):(o.swing||1);return <g key={i} transform={`translate(${o.at+(o.hingeAtEnd?o.width:0)} 0) scale(${o.hingeAtEnd?-1:1} 1)`}>
      {o.kind==='window'?<g className="plan-window"><path d={`M0 -.065H${o.width}M0 .065H${o.width}M0 0H${o.width}`}/><path d={`M${o.width/2} -.065V.065`}/></g>:o.kind!=='passage'?<g className="plan-door"><path d={`M0 0V${sign*o.width}`}/><path className="plan-door-arc" d={`M${o.width} 0A${o.width} ${o.width} 0 0 ${sign>0?1:0} 0 ${sign*o.width}`}/></g>:null}
    </g>;})}
  </g>;
}
function Dimension({x,z,width,label}) {return <g className="plan-dimension" transform={`translate(${x} ${z})`}><path d={`M0 -.1V.1M0 0H${width}M${width} -.1V.1`}/><text x={width/2} y={-.12}>{label}</text></g>;}
export default function FloorPlan({layout=originalLayout,selected,onSelect,position,mode,interactive=true}) {
  const {number}=useI18n();
  const {rooms,walls,bounds,APARTMENT}=layout;
  const viewBox=`${bounds.minX-.45} ${bounds.minZ-.45} ${bounds.maxX-bounds.minX+.9} ${bounds.maxZ-bounds.minZ+.9}`;
  return <svg className="floor-plan" viewBox={viewBox} role={interactive?'group':'img'} aria-label={interactive?t('Interactive apartment floor plan'):t('{area} square meter apartment floor plan',{area:number(APARTMENT.advertisedArea,2)})}>
    {rooms.map(r=><g key={r.id} {...(interactive?{role:'button',tabIndex:0,'aria-label':t('Go to {room}',{room:t(r.name)}),'aria-pressed':selected===r.id,onClick:()=>onSelect(r.id),onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(r.id);}}}:{})} className={`plan-room ${selected===r.id?'selected':''}`}>
      <title>{t(r.name)}{(r.area||layout.id==='four-room-134')&&<> · {number(r.area||areas[r.id],2)} {t('m²')}</>}{interactive?' · '+t('Select to explore'):''}</title>
      <polygon points={r.polygon.map(p=>p.join(',')).join(' ')}/>
      <text x={r.label[0]} y={r.label[1]-.12}><tspan className="plan-room-name" x={r.label[0]}>{t(r.planName||labels[r.id])}</tspan><tspan className="plan-room-area" x={r.label[0]} dy=".34">{(r.area||layout.id==='four-room-134')&&<>{number(r.area||areas[r.id],2)} {t('m²')}</>}</tspan></text>
    </g>)}
    <g className="plan-architecture" aria-hidden="true">{walls.map(wall=><PlanWall key={wall.id} wall={wall}/>)}</g>
    {layout.id==='four-room-134'&&<g className="plan-dimensions" aria-hidden="true">
      <Dimension x={.22} z={.48} width={2.96} label="3400"/><Dimension x={3.62} z={.48} width={2.56} label="3000"/>
      <Dimension x={.22} z={14.55} width={2.96} label="3400"/><Dimension x={3.62} z={14.55} width={2.56} label="3000"/>
      <Dimension x={6.62} z={8.45} width={2.96} label="3400"/>
    </g>}
    {mode==='walkthrough'&&position&&<g transform={`translate(${position.x} ${position.z}) rotate(${-position.yaw*180/Math.PI})`} className="plan-player"><path d="M0 -.8 -.4 -.2 .4 -.2Z"/><circle r=".17"/></g>}
  </svg>;
}
