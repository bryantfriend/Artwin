import {pathToFileURL} from 'node:url';
import {additionalLayouts} from '../src/layouts/tokyoLayouts.js';
import {pointInPolygon,circleIntersectsBox,wallSegments,doorPose} from '../src/geometry.js';
export function obstacles(layout){return [...layout.walls.flatMap(w=>wallSegments(w).filter(s=>s.position[1]-s.size[1]/2<1.6).map(s=>({x:s.position[0],z:s.position[2],width:s.size[0],depth:s.size[2],yaw:s.yaw}))),...layout.doors.map(d=>({...doorPose(d,d.swing*Math.PI/2),width:d.width,depth:.07})),...layout.furniture.map(f=>({x:f.position[0],z:f.position[2],width:f.size[0],depth:f.size[2],yaw:f.rotation}))];}
export function connectedRooms(layout){
 const boxes=obstacles(layout),b=layout.bounds,step=.1,nx=Math.ceil((b.maxX-b.minX)/step),nz=Math.ceil((b.maxZ-b.minZ)/step),free=new Uint8Array(nx*nz),visited=new Uint8Array(nx*nz);
 const world=(ix,iz)=>[b.minX+(ix+.5)*step,b.minZ+(iz+.5)*step];
 for(let iz=0;iz<nz;iz++)for(let ix=0;ix<nx;ix++){
  const [x,z]=world(ix,iz);if(layout.rooms.some(r=>pointInPolygon(x,z,r.polygon))&&!boxes.some(o=>circleIntersectsBox(x,z,.27,o)))free[iz*nx+ix]=1;
 }
 const nearest=r=>{let best=-1,d=Infinity;for(let i=0;i<free.length;i++)if(free[i]){const [x,z]=world(i%nx,Math.floor(i/nx)),n=Math.hypot(x-r.destination[0],z-r.destination[2]);if(n<d&&pointInPolygon(x,z,r.polygon)){best=i;d=n;}}return best;};
 const start=nearest(layout.rooms.find(r=>r.id==='hall')),queue=[start];visited[start]=1;
 for(let j=0;j<queue.length;j++){const i=queue[j],ix=i%nx,iz=Math.floor(i/nx);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=ix+dx,z=iz+dz,k=z*nx+x;if(x>=0&&x<nx&&z>=0&&z<nz&&free[k]&&!visited[k]){visited[k]=1;queue.push(k);}}}
 return layout.rooms.filter(r=>!visited[nearest(r)]).map(r=>r.id);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)for(const layout of additionalLayouts){
 const outside=[];
 for(const f of layout.furniture){const room=layout.rooms.find(r=>r.id===f.room);for(const dx of [-f.size[0]/2+.01,f.size[0]/2-.01])for(const dz of [-f.size[2]/2+.01,f.size[2]/2-.01]){const x=f.position[0]+dx*Math.cos(f.rotation)+dz*Math.sin(f.rotation),z=f.position[2]-dx*Math.sin(f.rotation)+dz*Math.cos(f.rotation);if(!pointInPolygon(x,z,room.polygon))outside.push(f.id);}}
 console.log(layout.id,JSON.stringify({unreachable:connectedRooms(layout),outside:[...new Set(outside)]}));
}
