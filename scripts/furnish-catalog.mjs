import {item,bed} from '../src/layouts/buildLayout.js';
import {pointInPolygon,wallSegments,doorPose,wallPoint,wallYaw} from '../src/geometry.js';
const P=Math.PI;
const aabb=f=>{const c=Math.abs(Math.cos(f.rotation||0)),s=Math.abs(Math.sin(f.rotation||0));return {x:f.position[0],z:f.position[2],w:f.size[0]*c+f.size[2]*s,d:f.size[0]*s+f.size[2]*c};};
const intersects=(a,b,gap=0)=>Math.abs(a.x-b.x)<(a.w+b.w)/2+gap&&Math.abs(a.z-b.z)<(a.d+b.d)/2+gap;
const blocked=(x,z,b,r=.27)=>Math.hypot(Math.max(Math.abs(x-b.x)-b.w/2,0),Math.max(Math.abs(z-b.z)-b.d/2,0))<r;
const shift=(x,z,yaw,side,forward)=>[x+side*Math.cos(yaw)+forward*Math.sin(yaw),z-side*Math.sin(yaw)+forward*Math.cos(yaw)];
const bounds=room=>({x:Math.min(...room.polygon.map(p=>p[0])),X:Math.max(...room.polygon.map(p=>p[0])),z:Math.min(...room.polygon.map(p=>p[1])),Z:Math.max(...room.polygon.map(p=>p[1]))});
const area=room=>Math.abs(room.polygon.reduce((s,p,i)=>{const q=room.polygon[(i+1)%room.polygon.length];return s+p[0]*q[1]-q[0]*p[1];},0))/2;

export function furnish(layout,spec,seed=0){
 const furniture=[],decor=[],destinations={};
 const walls=layout.walls.flatMap(w=>wallSegments(w).filter(s=>s.position[1]-s.size[1]/2<1.6).map(s=>({x:s.position[0],z:s.position[2],w:s.size[0],d:s.size[2]})));
 const leaves=layout.doors.map(d=>{const p=doorPose(d,d.swing*P/2);return aabb({position:[p.x,0,p.z],rotation:p.yaw,size:[d.width,2,.08]});});
 const packingSeed=seed;
 for(const room of layout.rooms){
  let success=false,lastError;
  for(let retry=0;retry<8;retry++){
   const seed=packingSeed+retry*7,decorStart=decor.length;
   try{
  const b=bounds(room),chosen=[],access=[],portals=[];
  const polygon=room.polygon,inside=(x,z,m=.12)=>[[0,0],[-m,-m],[-m,m],[m,-m],[m,m]].every(([dx,dz])=>pointInPolygon(x+dx,z+dz,polygon));
  for(const w of layout.walls.filter(w=>w.roomIds.includes(room.id)))for(const o of w.openings.filter(o=>o.kind!=='window')){
   const p=wallPoint(w,o.at+o.width/2),yaw=wallYaw(w),normal=pointInPolygon(p[0]+Math.sin(yaw)*.2,p[1]+Math.cos(yaw)*.2,polygon)?1:-1;
   portals.push([p[0]+Math.sin(yaw)*normal*.5,p[1]+Math.cos(yaw)*normal*.5]);
  }
  const obstacles=[...walls,...leaves];
  const step=.16,nx=Math.ceil((b.X-b.x)/step),nz=Math.ceil((b.Z-b.z)/step),base=new Uint8Array(nx*nz),coords=[];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=b.x+(i+.5)*step,z=b.z+(j+.5)*step,k=j*nx+i;coords[k]=[x,z];if(inside(x,z,.28)&&!obstacles.some(o=>blocked(x,z,o)))base[k]=1;}
  function route(items,required=[]){
   const boxes=items.map(aabb),free=base.slice();for(let k=0;k<free.length;k++)if(free[k]&&boxes.some(o=>blocked(...coords[k],o)))free[k]=0;
   const nearest=p=>{let best=-1,dist=Infinity;for(let k=0;k<free.length;k++)if(free[k]){const d=Math.hypot(coords[k][0]-p[0],coords[k][1]-p[1]);if(d<dist){dist=d;best=k;}}return dist<.7?best:-1;};
   const targets=[...portals,...required].map(nearest);if(targets.some(k=>k<0))return null;
   let start=targets[0]??free.findIndex(v=>v);if(start<0)return null;
   const seen=new Uint8Array(free.length),queue=[start];seen[start]=1;
   for(let i=0;i<queue.length;i++){const k=queue[i],x=k%nx,z=Math.floor(k/nx);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz,n=zz*nx+xx;if(xx>=0&&xx<nx&&zz>=0&&zz<nz&&free[n]&&!seen[n]){seen[n]=1;queue.push(n);}}}
   if(targets.some(k=>!seen[k]))return null;
   // A roomy vantage point near the entrance keeps furniture ahead of the camera.
   const anchor=portals[0]||[(b.x+b.X)/2,(b.z+b.Z)/2];let best=start,score=-Infinity;
   for(const k of queue){const p=coords[k],clear=Math.min(...[...boxes,...obstacles].map(o=>Math.hypot(Math.max(Math.abs(p[0]-o.x)-o.w/2,0),Math.max(Math.abs(p[1]-o.z)-o.d/2,0))));const value=Math.min(clear,1.1)-Math.hypot(p[0]-anchor[0],p[1]-anchor[1])*.06;if(value>score){score=value;best=k;}}
   return coords[best];
  }
  function valid(group,approaches=[]){
   const boxes=group.map(aabb),old=chosen.map(aabb);
   for(const a of boxes){
    for(let x=a.x-a.w/2;x<=a.x+a.w/2+.001;x+=Math.min(.2,a.w))for(const z of [a.z-a.d/2,a.z+a.d/2])if(!inside(x,z,.11))return false;
    for(let z=a.z-a.d/2;z<=a.z+a.d/2+.001;z+=Math.min(.2,a.d))for(const x of [a.x-a.w/2,a.x+a.w/2])if(!inside(x,z,.11))return false;
    if([...old,...leaves].some(o=>intersects(a,o,.045)))return false;
    if(access.some(p=>blocked(...p,a,.28)))return false;
   }
   if(boxes.some((a,i)=>boxes.slice(i+1).some(o=>intersects(a,o,.025))))return false;
   for(const p of approaches)if(!inside(...p,.22)||[...old,...boxes,...obstacles].some(o=>blocked(...p,o,.24)))return false;
   return !!route([...chosen,...group],[...access,...approaches]);
  }
  function candidates(width,depth,back=.14,solid=true){
   const result=[];
   for(let i=0;i<polygon.length;i++){
    const a=polygon[i],q=polygon[(i+1)%polygon.length],horizontal=a[1]===q[1],len=Math.hypot(q[0]-a[0],q[1]-a[1]);if(len<width+.3)continue;
    const mid=[(a[0]+q[0])/2,(a[1]+q[1])/2],sign=pointInPolygon(mid[0]+(horizontal?0:.2),mid[1]+(horizontal?.2:0),polygon)?1:-1,yaw=horizontal?(sign===1?0:P):sign*P/2;
    const lo=Math.min(a[horizontal?0:1],q[horizontal?0:1])+width/2+.15,hi=Math.max(a[horizontal?0:1],q[horizontal?0:1])-width/2-.15;
    const values=[(lo+hi)/2,lo,hi];for(let at=lo;at<=hi;at+=.24)values.push(at);
    for(const at of values){const x=horizontal?at:a[0]+sign*(depth/2+back),z=horizontal?a[1]+sign*(depth/2+back):at;
     if(solid&&layout.walls.some(w=>w.roomIds.includes(room.id)&&w.openings.some(o=>{const p=wallPoint(w,o.at+o.width/2);return Math.abs((horizontal?p[1]:p[0])-(horizontal?a[1]:a[0]))<.05&&Math.abs((horizontal?p[0]:p[1])-at)<(width+o.width)/2+.14;})))continue;
     const doorDistance=Math.min(...portals.map(p=>Math.hypot(x-p[0],z-p[1])),10);
     result.push({x,z,yaw,score:doorDistance+Math.min(at-lo,hi-at)*.12});
    }
   }
   result.sort((a,b)=>b.score-a.score);const offset=seed?Math.floor(result.length*((seed*.381966011)%1)):0;return [...result.slice(offset),...result.slice(0,offset)];
  }
  const create=(kind,x,z,w,h,d,yaw=0,extra={})=>item(`${room.id}-${kind}-${chosen.length}`,kind,room.id,[x,z],[w,h,d],yaw,extra);
  function place(opts,build,mandatory=false){
   for(const c of opts){const {group,approaches=[]}=build(c);if(!valid(group,approaches))continue;chosen.push(...group);access.push(...approaches);return group;}
   if(mandatory)throw Error(`Cannot furnish ${room.id}`);return null;
  }
  const isBed=room.id==='primary'||room.id.startsWith('bedroom');
  if(isBed){
   let placed;
   for(const [w,depth,one] of [[1.7,2.2,false],[1.55,2.2,false],[1.4,2.05,false],[1.4,2.05,true],[1,2,true]]){
    for(const side of [0,1,-1]){placed=place(candidates(w+(one?.55:1.05),depth,.19),c=>({group:bed(room.id,c.x,c.z,c.yaw,'white',w,depth,spec.project==='urpaq-park'?'walnut':'padded').filter((f,i)=>!one||i!==2),approaches:[shift(c.x,c.z,c.yaw,side*(w/2+.36),side?.25:depth/2+.36)]}));if(placed)break;}if(placed)break;
   }
   if(!placed)throw Error(`No bed fits ${room.id}`);
   place(candidates(1.3,.5),c=>({group:[create('wardrobe',c.x,c.z,1.3,2.3,.5,c.yaw,{color:'dark'})],approaches:[shift(c.x,c.z,c.yaw,0,.65)]}));
  }else if(room.id.startsWith('bath')){
   // Pack the sanitary fixtures together, preserving the bowl's approach zone.
   let success=false;
   const showerSizes=area(room)>4.2?[1,.85,.8]:[.85,.8];if(room.id!=='bath1')showerSizes.push(0);
   for(const showerSize of showerSizes){
    const showerOptions=showerSize?candidates(showerSize,showerSize):[{x:0,z:0,yaw:0}];
    for(const sh of showerOptions){
     chosen.length=0;access.length=0;
     if(showerSize){const f=create('shower',sh.x,sh.z,showerSize,2.1,showerSize,sh.yaw);if(!valid([f]))continue;chosen.push(f);}
     for(const tc of candidates(.43,.65,.13)){
      chosen.length=showerSize?1:0;access.length=0;
      const toilet=create('toilet',tc.x,tc.z,.43,.75,.65,tc.yaw),front=shift(tc.x,tc.z,tc.yaw,0,.65);
      if(!valid([toilet],[front]))continue;chosen.push(toilet);access.push(front);
      const vanity=place(candidates(.5,.32,.13),c=>({group:[create('vanity',c.x,c.z,.5,.88,.32,c.yaw)],approaches:[shift(c.x,c.z,c.yaw,0,.5)]}));
      if(vanity){success=true;break;}
     }
     if(success)break;
    }
    if(success)break;
   }
   if(!success)throw Error(`No sanitary arrangement fits ${room.id}`);
  }else if(room.id==='living'||room.id==='kitchen'){
   const combined=room.id==='living'&&spec.openLiving;
   if(room.id==='kitchen'||combined){
    let fitted;
    for(const width of [3.2,2.6,2.1,1.8].slice(seed%4)){fitted=place(candidates(width,.65,.14),c=>({group:[create('kitchen',c.x,c.z,width,.95,.65,c.yaw)],approaches:[shift(c.x,c.z,c.yaw,0,.75)]}));if(fitted)break;}
    if(!fitted)throw Error(`No kitchen fits ${room.id}`);
   }
   if(room.id==='living'){
    let fitted;
    for(const width of [2.6,2.2,1.8].slice(seed%3)){
     for(const c of candidates(width,.95,.27,false)){
      const sofa=create('sofa',c.x,c.z,width,.9,.95,c.yaw,{color:spec.project==='boston-tower'?'charcoal':spec.project==='esentai'?'gray':'light'});
      const tvs=candidates(Math.min(width,1.4),.32,.15).filter(t=>Math.cos(t.yaw-c.yaw)<-.99).sort((a,b)=>Math.abs((a.x-c.x)*Math.cos(c.yaw)-(a.z-c.z)*Math.sin(c.yaw))-Math.abs((b.x-c.x)*Math.cos(c.yaw)-(b.z-c.z)*Math.sin(c.yaw)));
      for(const t of tvs){const tv=create('tv',t.x,t.z,Math.min(width,1.4),1.7,.32,t.yaw);if(Math.hypot(c.x-t.x,c.z-t.z)<1.8)continue;
       const approach=shift(c.x,c.z,c.yaw,0,.92);if(!valid([sofa,tv],[approach]))continue;chosen.push(sofa,tv);access.push(approach);fitted=sofa;break;}
      if(fitted)break;
     }if(fitted)break;
    }
    if(!fitted)throw Error(`No lounge fits ${room.id}`);
   }
   if(room.id==='kitchen'||combined){
    let table;
    for(const [w,d] of [[1.78,1.2],[1.65,1.05]]){table=place(candidates(w,d,.13,false),c=>({group:[create('diningCompact',c.x,c.z,w,.8,d,c.yaw)]}));if(table)break;}
    if(!table){const opts=[];for(let x=b.x+1.15;x<b.X-1.1;x+=.3)for(let z=b.z+1.15;z<b.Z-1.1;z+=.3)opts.push({x,z,yaw:0});table=place(opts,c=>({group:[create('diningRound',c.x,c.z,2.05,.85,2.05)]}));}
    if(!table)throw Error(`No dining table fits ${room.id}`);
   }
   const sofa=chosen.find(f=>f.kind==='sofa');
   if(sofa){
    const [x,z]=shift(sofa.position[0],sofa.position[2],sofa.rotation,0,1.27);
    const coffee=create('coffeeOval',x,z,.9,.43,.5,sofa.rotation);
    const seated=shift(sofa.position[0],sofa.position[2],sofa.rotation,0,.92),i=access.findIndex(p=>Math.hypot(p[0]-seated[0],p[1]-seated[1])<.01),removed=i<0?null:access.splice(i,1)[0];
    if(valid([coffee]))chosen.push(coffee);else if(removed)access.push(removed);
    const rug=[[-1.1,-.9],[-1.1,.9],[1.1,.9],[1.1,-.9]].map(([dx,dz])=>shift(x,z,sofa.rotation,dx,dz));
    if(rug.every(p=>inside(...p,.1)))decor.push({kind:'rug',position:[x,.025,z],width:2.2,depth:1.8,rotation:sofa.rotation,index:2});
   }
  }else if(room.id==='storage'){
   place(candidates(.75,.3),c=>({group:[create('shelf',c.x,c.z,.75,1.8,.3,c.yaw)]}));
  }
  if(['living','kitchen','hall'].includes(room.id)||isBed){
   place(candidates(.4,.4,.18,false),c=>({group:[create('plant',c.x,c.z,.4,1.3,.4)]}));
   const art=candidates(1.1,.02,.12).find(c=>!chosen.some(f=>f.size[1]>1.5&&intersects(aabb(f),{x:c.x,z:c.z,w:.1,d:.1},.3)));
   if(art)decor.push({kind:'art',position:[art.x,1.9,art.z],rotation:art.yaw,width:1.1,height:.72,index:room.id==='living'?3:2});
  }
  const destination=route(chosen,access);if(!destination)throw Error(`No route remains in ${room.id}`);
  destinations[room.id]=destination;furniture.push(...chosen);
  success=true;break;
   }catch(e){decor.length=decorStart;lastError=e;}
  }
  if(!success)throw lastError;
 }
 return {furniture,decor,destinations};
}
