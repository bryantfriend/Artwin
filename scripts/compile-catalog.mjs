import {writeFileSync,mkdirSync} from 'node:fs';
import {specs} from './catalog-specs.mjs';
import './specs-hayat.mjs';import './specs-urpaq.mjs';import './specs-esentai.mjs';import './specs-boston.mjs';import './specs-tokyo.mjs';
import {room,finishLayout} from '../src/layouts/buildLayout.js';
import {pointInPolygon,wallSegments,doorPose,circleIntersectsBox} from '../src/geometry.js';
import {furnish} from './furnish-catalog.mjs';
import {connectedRooms} from './audit-layouts.mjs';
const round=n=>Math.round(n*1e5)/1e5;
const names={primary:'Bedroom 01',bedroom2:'Bedroom 02',bedroom3:'Bedroom 03',bedroom4:'Bedroom 04',hall:'Entrance hall',living:'Living room',kitchen:'Kitchen & dining',bath1:'Bathroom',bath2:'Guest bathroom',bath3:'En suite',storage:'Storage',loggia:'Loggia',loggia2:'Loggia 02'};
export function compile(spec,empty=false){
 const origin=[Math.min(...spec.rooms.flatMap(r=>r.polygon.map(p=>p[0]))),Math.min(...spec.rooms.flatMap(r=>r.polygon.map(p=>p[1])))];
 const toWorld=p=>p.map((n,i)=>round((n-origin[i])*spec.scale));
 const rooms=spec.rooms.map(r=>{const poly=r.polygon.map(toWorld),xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]),center=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2];
  const name=r.id==='living'&&spec.openLiving?'Kitchen & living':names[r.id];
  return {...room(r.id,name,null,poly,center),material:r.id.startsWith('bath')?'stone':r.id==='kitchen'?'kitchenMarble':'hallOak'};
 });
 const openings=spec.links.map(([a,b,x,z,width])=>[a==='outside'?'entrance':'door',...toWorld([x,z]),round(width*spec.scale),a==='outside'?[b]:[a,b],names[b]+' door']);
 openings.push(...spec.windows.map(([id,x,z,width])=>['window',...toWorld([x,z]),round(width*spec.scale),[id]]));
 const config={id:spec.id,theme:spec.project,area:spec.area,rooms,openings,furniture:[],entrance:{position:[0,.82,0],yaw:0}};
 let layout=finishLayout(config);
 // Choose the hinge which folds the leaf closest to the room perimeter.
 for(const o of openings.filter(o=>o[0]==='door')){
  const w=layout.walls.find(w=>w.openings.some(v=>v.name===o[5]&&Math.abs((w.axis==='x'?w.start[1]:w.start[0])-(w.axis==='x'?o[2]:o[1]))<.001));
  if(!w)continue;
  const target=rooms.find(r=>r.id===o[4][1]),axis=w.axis==='x'?0:1,fixed=o[axis===0?2:1],at=o[axis===0?1:2];
  const inward=pointInPolygon(o[1]+(axis===1?.2:0),o[2]+(axis===0?.2:0),target.polygon)?1:-1;
  const edges=target.polygon.map(p=>p[axis]);
  const end=Math.max(...edges)-at<at-Math.min(...edges);
  o[6]=(axis===0?-inward:inward)*(end?-1:1);o[7]=end;
 }
 layout=finishLayout(config);
 if(!empty){
  let decorated,lastError;
  const originalDoors=openings.map(o=>[o[6],o[7]]);
  const wallBoxes=layout.walls.flatMap(w=>wallSegments(w)).filter(s=>s.position[1]-s.size[1]/2<1.6).map(s=>({x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2],yaw:s.yaw}));
  const clearsWalls=d=>{const p=doorPose(d,d.swing*Math.PI/2);for(let at=.15;at<d.width;at+=.1)if(wallBoxes.some(w=>circleIntersectsBox(d.hinge[0]+Math.cos(p.yaw)*at,d.hinge[1]-Math.sin(p.yaw)*at,.025,w)))return false;return true;};
  const doorOptions=openings.map(o=>{
   if(o[0]!=='door')return [];
   const d=layout.doors.find(d=>d.id===`${o[4][0]}-${o[4].at(-1)}-door`);
   return [0,1,2,3].filter(v=>clearsWalls({...d,swing:d.swing*(v%2?-1:1),hinge:v>1?[d.hinge[0]+Math.cos(d.baseAngle)*d.width,d.hinge[1]-Math.sin(d.baseAngle)*d.width]:d.hinge,baseAngle:d.baseAngle+(v>1?Math.PI:0)}));
  });
  for(let seed=0;seed<256;seed++){
   try{
    let doorIndex=0;
    for(let i=0;i<openings.length;i++){const o=openings[i];if(o[0]!=='door')continue;
     let hash=Math.imul(seed+1,0x9e3779b1)^Math.imul(i+1,0x85ebca6b);hash=Math.imul(hash^(hash>>>16),0x85ebca6b);hash=Math.imul(hash^(hash>>>13),0xc2b2ae35);hash^=hash>>>16;
     // Exhaust all four-door combinations for this compact plan; larger layouts
     // use a deterministic search so generating them does not grow exponentially.
     const options=doorOptions[i];if(!options.length)throw Error('Door has no clear hinge: '+o[5]);
     const index=spec.id==='esentai-36'?Math.floor(seed/4**doorIndex):seed<16?0:hash>>>0;
     const variant=options[index%options.length];doorIndex++;
     o[6]=(originalDoors[i][0]||1)*(variant%2?-1:1);o[7]=variant>1?!originalDoors[i][1]:originalDoors[i][1];}
    layout=finishLayout({...config,furniture:[]});
    for(const d of layout.doors){const p=doorPose(d,d.swing*Math.PI/2);for(let at=.15;at<d.width;at+=.1)if(wallBoxes.some(w=>circleIntersectsBox(d.hinge[0]+Math.cos(p.yaw)*at,d.hinge[1]-Math.sin(p.yaw)*at,.025,w)))throw Error('Open door intersects wall: '+d.id);}
    decorated=furnish(layout,spec,seed);
    const trial=finishLayout({...config,furniture:decorated.furniture,rooms:config.rooms.map(r=>({...r,destination:[decorated.destinations[r.id][0],.82,decorated.destinations[r.id][1]]}))});
    const missing=connectedRooms(trial);if(missing.length)throw Error('Walking route blocked: '+missing.join(', '));
    break;
   }catch(e){decorated=null;lastError=e;}
  }
  if(!decorated)throw lastError;
  config.furniture=decorated.furniture;config.decor=decorated.decor;
  for(const r of config.rooms){const p=decorated.destinations[r.id];if(p)r.destination=[p[0],.82,p[1]];}
  layout=finishLayout(config);
 }
 layout.reference={kind:spec.evidence||'drawing',asset:spec.source};
 return layout;
}
const output=[],errors=[];
for(const spec of specs.filter(s=>!process.env.PLAN||s.id.includes(process.env.PLAN))){
 try{const layout=compile(spec,process.env.EMPTY==='1');output.push(layout);console.log(spec.id,layout.rooms.length,layout.furniture.length);}
 catch(e){errors.push(spec.id+': '+e.message);console.error(spec.id,e.stack);}
}
mkdirSync('src/layouts/generated',{recursive:true});
mkdirSync('output',{recursive:true});
writeFileSync('output/catalog-errors.json',JSON.stringify(errors,null,2));
writeFileSync('output/catalog-draft.json',JSON.stringify(output));
if(!errors.length&&!process.env.PLAN&&process.env.EMPTY!=='1'){
 writeFileSync('src/layouts/generated/catalog.js','// Precomputed from the official reference registry.\nexport const catalogLayouts='+JSON.stringify(output)+';\n');
 writeFileSync('src/catalogPlans.js','// Generated from the source registry by scripts/compile-catalog.mjs.\nexport const catalogPlans='+JSON.stringify(specs.map(s=>{const l=output.find(l=>l.id===s.id),bedrooms=l.rooms.filter(r=>r.id==='primary'||r.id.startsWith('bedroom')).length;return {id:s.id,project:s.project,area:s.area,bedrooms,bathrooms:l.rooms.filter(r=>r.id.startsWith('bath')).length,name:bedrooms===0?'One-room residence':s.openLiving?'Euro residence':bedrooms===1?'Two-room residence':bedrooms===2?'Three-room residence':bedrooms===3?'Four-room residence':'Five-room residence',description:s.openLiving?'An open living space with private rooms and practical everyday storage.':'Distinct living and private spaces, arranged around a welcoming entrance hall.',viewer:'furnished-layout',openLiving:!!s.openLiving,reference:s.source,evidence:s.evidence||'drawing'};}),null,2)+';\n');
}
if(errors.length)process.exitCode=1;
