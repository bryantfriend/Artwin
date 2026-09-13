import {APARTMENT as defaults} from '../apartmentConfig.js';
import {pointInPolygon,circleIntersectsBox,wallSegments,doorPose} from '../geometry.js';
export const rect=(x,z,w,d)=>[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
export function room(id,name,area,polygon,destination,yaw=0){
 const xs=polygon.map(p=>p[0]),zs=polygon.map(p=>p[1]);
 const planName=id==='hall'?'Hall':id.startsWith('loggia')?'Loggia':id==='kitchen'?'Kitchen':id.startsWith('bath')?'Bathroom':id==='primary'||id.startsWith('bedroom')?'Bedroom':name;
 return {id,name,short:name,area:String(area),planName,subtitle:id==='living'?'Room to come together':id==='kitchen'?'Everyday rituals, beautifully framed':id.startsWith('bath')?'Considered details':'A space of your own',type:id.startsWith('bath')||id==='kitchen'||id.startsWith('loggia')?'stone':'wood',polygon,destination:[destination[0],.82,destination[1]],yaw,label:[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2]};
}
export const item=(id,kind,room,position,size,rotation=0,extra={})=>({id,kind,room,position:[position[0],0,position[1]],size,rotation,...extra});
export function bed(roomId,x,z,rotation=0,color='white',w=1.7,d=2.25,feature='padded'){
 const transform=(dx,dz)=>[x+dx*Math.cos(rotation)+dz*Math.sin(rotation),z-dx*Math.sin(rotation)+dz*Math.cos(rotation)];
 return [item('bed-'+roomId,'bed',roomId,[x,z],[w,1.05,d],rotation,{color,feature}),...[-1,1].map((s,i)=>item('nightstand-'+roomId+'-'+i,'nightstand',roomId,transform(s*(w/2+.3),-d/2+.28),[.44,.55,.46],rotation))];
}
// Split and deduplicate the traced room edges. Shared edges become one wall.
// Openings are placed on those same walls, so the drawing and physics agree.
function makeWalls(rooms,openings){
 const lines=new Map();
 for(const room of rooms)for(let i=0;i<room.polygon.length;i++){
  const a=room.polygon[i],b=room.polygon[(i+1)%room.polygon.length],axis=a[1]===b[1]?'x':'z',fixed=axis==='x'?a[1]:a[0],index=axis==='x'?0:1,key=axis+':'+fixed;
  if(!lines.has(key))lines.set(key,{axis,fixed,edges:[]});lines.get(key).edges.push({from:Math.min(a[index],b[index]),to:Math.max(a[index],b[index]),room:room.id});
 }
 const walls=[];
 for(const {axis,fixed,edges} of lines.values()){
  const cuts=[...new Set(edges.flatMap(e=>[e.from,e.to]))].sort((a,b)=>a-b);let previous=null;
  for(let i=1;i<cuts.length;i++){
   const from=cuts[i-1],to=cuts[i],mid=(from+to)/2,ids=[...new Set(edges.filter(e=>e.from<mid&&e.to>mid).map(e=>e.room))].sort();if(!ids.length)continue;
   if(previous&&previous.roomIds.join()===ids.join()&&Math.abs(previous.end-from)<.001){previous.length=to-previous.start[axis==='x'?0:1];previous.end=to;continue;}
   const start=axis==='x'?[from,fixed]:[fixed,from];
   const owner=rooms.find(r=>r.id===ids[0]),normal=axis==='x'?(pointInPolygon(mid,fixed+.02,owner.polygon)?1:-1):(pointInPolygon(fixed+.02,mid,owner.polygon)?1:-1);
   previous={id:'wall-'+walls.length,axis,start,length:to-from,end:to,roomIds:ids,exterior:ids.length===1,tall:ids.length===1&&normal===1,normal,openings:[]};walls.push(previous);
  }
 }
 for(const [kind,x,z,width,ids,name,swing=1,hingeAtEnd=false] of openings){
  const wall=walls.find(w=>ids.every(id=>w.roomIds.includes(id))&&(ids.length>1||w.exterior)&&Math.abs((w.axis==='x'?z:x)-(w.axis==='x'?w.start[1]:w.start[0]))<.01&&(w.axis==='x'?x:z)-width/2>=w.start[w.axis==='x'?0:1]-.001&&(w.axis==='x'?x:z)+width/2<=w.end+.001);
  if(!wall)throw Error('Opening does not fit: '+JSON.stringify([kind,x,z,width,ids]));
  wall.openings.push({kind,at:(wall.axis==='x'?x:z)-wall.start[wall.axis==='x'?0:1]-width/2,width,id:ids[0]+'-'+ids.at(-1)+'-'+kind,name:name||rooms.find(r=>r.id===ids.at(-1)).name+' door',swing,hingeAtEnd});
 }
 return walls;
}
export function destinationClear(layout,x,z,roomId,margin=.28,open=false){
 const target=layout.rooms.find(r=>r.id===roomId);
 if(![[0,0],[margin,0],[-margin,0],[0,margin],[0,-margin]].every(([dx,dz])=>pointInPolygon(x+dx,z+dz,target.polygon)))return false;
 for(const wall of layout.walls)for(const s of wallSegments(wall))if(s.position[1]-s.size[1]/2<1.6&&circleIntersectsBox(x,z,margin,{x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2]}))return false;
 for(const d of layout.doors)if(circleIntersectsBox(x,z,margin,{...doorPose(d,open?d.swing*Math.PI/2:0),width:d.width,depth:.07}))return false;
 for(const f of layout.furniture)if(circleIntersectsBox(x,z,margin,{x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation}))return false;
 return true;
}
export function finishLayout({id,area,rooms,openings,furniture,entrance,decor=[],zones=[]}){
 const walls=makeWalls(rooms,openings),doors=walls.flatMap(w=>w.openings.filter(o=>o.kind==='door').map(o=>{const at=o.at+(o.hingeAtEnd?o.width:0);return {...o,hinge:w.axis==='x'?[w.start[0]+at,w.start[1]]:[w.start[0],w.start[1]+at],baseAngle:(w.axis==='x'?0:-Math.PI/2)+(o.hingeAtEnd?Math.PI:0)};}));
 const xs=rooms.flatMap(r=>r.polygon.map(p=>p[0])),zs=rooms.flatMap(r=>r.polygon.map(p=>p[1])),bounds={minX:Math.min(...xs),maxX:Math.max(...xs),minZ:Math.min(...zs),maxZ:Math.max(...zs)};
 const cx=(bounds.minX+bounds.maxX)/2,cz=(bounds.minZ+bounds.maxZ)/2;
 const layout={id,rooms,walls,doors,furniture,decor,zones,bounds,APARTMENT:{...defaults,advertisedArea:area.toFixed(2),entrance:{position:[...entrance.position],yaw:entrance.yaw},overview:{position:[cx+16,20,cz+18],target:[cx,.5,cz]}},switches:[]};
 for(const r of rooms){
  const [dx,,dz]=r.destination;let best=null,distance=Infinity;
  const safe=(x,z)=>destinationClear(layout,x,z,r.id)&&destinationClear(layout,x,z,r.id,.28,true);
  if(safe(dx,dz))best=[dx,dz];
  else for(let x=Math.min(...r.polygon.map(p=>p[0]))+.3;x<Math.max(...r.polygon.map(p=>p[0]))-.25;x+=.12)for(let z=Math.min(...r.polygon.map(p=>p[1]))+.3;z<Math.max(...r.polygon.map(p=>p[1]))-.25;z+=.12){const d=Math.hypot(x-dx,z-dz);if(d<distance&&safe(x,z)){best=[x,z];distance=d;}}
  if(!best)throw Error('No safe room destination: '+id+'/'+r.id);r.destination=[...best.slice(0,1),.82,best[1]];
  if(!pointInPolygon(...r.label,r.polygon))r.label=[best[0],best[1]];
 }
 layout.APARTMENT.entrance.position=[...rooms.find(r=>r.id==='hall').destination];
 for(const r of rooms.filter(r=>['living','kitchen','primary','bedroom2'].includes(r.id))){
  const wall=walls.find(w=>w.roomIds.includes(r.id)&&w.openings.some(o=>o.kind==='door'));
  if(!wall)continue;const opening=wall.openings.find(o=>o.kind==='door');
  let at=opening.at+opening.width+.2;if(at>wall.length-.12)at=opening.at-.2;if(at<.12||at>wall.length-.12)continue;
  const p=wall.axis==='x'?[wall.start[0]+at,wall.start[1]]:[wall.start[0],wall.start[1]+at];
  const sign=pointInPolygon(p[0]+(wall.axis==='z'?.14:0),p[1]+(wall.axis==='x'?.14:0),r.polygon)?1:-1;
  layout.switches.push({id:'light-'+r.id,room:r.id,position:[p[0]+(wall.axis==='z'?sign*.105:0),1.25,p[1]+(wall.axis==='x'?sign*.105:0)],rotation:wall.axis==='x'?(sign===1?0:Math.PI):sign*Math.PI/2});
 }
 layout.tourStops=rooms.filter(r=>['living','kitchen','primary','bedroom2','bath1'].includes(r.id)).map(r=>{
  const focal=furniture.find(f=>f.room===r.id&&['sofa','bed','kitchen','vanity'].includes(f.kind));const p=focal?focal.position:[r.label[0],0,r.label[1]];
  return {room:r.id,title:r.id==='living'?'Space to come together':r.id==='kitchen'?'Everyday rituals':r.id==='primary'?'A quieter retreat':r.id==='bedroom2'?'A room of your own':'Considered details',description:r.subtitle,position:[r.destination[0],1.68,r.destination[2]],target:[p[0],r.id.startsWith('bath')?1.3:.9,p[2]],fov:76};
 });
 return layout;
}
