// Retain reviewed furniture while repairing the hinge choices of existing models.
import {writeFileSync,mkdirSync} from 'node:fs';
import {catalogLayouts} from '../src/layouts/generated/catalog.js';
import {wallSegments,doorPose,circleIntersectsBox} from '../src/geometry.js';
import {connectedRooms} from './audit-layouts.mjs';
const repaired=[],failed=[],changed=[];
for(const original of catalogLayouts){
 const l=structuredClone(original),walls=l.walls.flatMap(w=>wallSegments(w)).filter(s=>s.position[1]-s.size[1]/2<1.6).map(s=>({x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2],yaw:s.yaw}));
 const furniture=l.furniture.map(f=>({x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation}));
 const choices=l.doors.map(d=>[0,1,2,3].map(v=>({...d,swing:d.swing*(v%2?-1:1),hingeAtEnd:v>1?!d.hingeAtEnd:d.hingeAtEnd,hinge:v>1?[d.hinge[0]+Math.cos(d.baseAngle)*d.width,d.hinge[1]-Math.sin(d.baseAngle)*d.width]:d.hinge,baseAngle:d.baseAngle+(v>1?Math.PI:0)})).filter(d=>{
  const p=doorPose(d,d.swing*Math.PI/2);
  for(let at=.15;at<d.width;at+=.05){const x=d.hinge[0]+Math.cos(p.yaw)*at,z=d.hinge[1]-Math.sin(p.yaw)*at;if(walls.some(w=>circleIntersectsBox(x,z,.025,w))||furniture.some(f=>circleIntersectsBox(x,z,.04,f)))return false;}
  const leaf={...p,width:d.width,depth:.07};return l.rooms.every(r=>!circleIntersectsBox(r.destination[0],r.destination[2],.28,leaf));
 }));
 let attempts=0;
 function search(i){if(i===choices.length){attempts++;return connectedRooms(l).length===0;}for(const d of choices[i]){l.doors[i]=d;if(search(i+1))return true;if(attempts>256)return false;}return false;}
 if(choices.some(c=>!c.length)||!search(0)){failed.push({id:l.id,choices:choices.map(c=>c.length)});continue;}
 for(const w of l.walls)for(const o of w.openings.filter(o=>o.kind==='door')){const d=l.doors.find(d=>d.id===o.id);o.swing=d.swing;o.hingeAtEnd=d.hingeAtEnd;}
 if(JSON.stringify(l.doors)!==JSON.stringify(original.doors))changed.push(l.id);
 repaired.push(l);
}
mkdirSync('output',{recursive:true});
writeFileSync('output/repaired-catalog.json',JSON.stringify(repaired));
writeFileSync('output/door-repair-failures.json',JSON.stringify(failed,null,2));
console.log(JSON.stringify({changed,failed}));
if(!failed.length)writeFileSync('src/layouts/generated/catalog.js','// Precomputed from the official reference registry.\nexport const catalogLayouts='+JSON.stringify(repaired)+';\n');
else process.exitCode=1;
