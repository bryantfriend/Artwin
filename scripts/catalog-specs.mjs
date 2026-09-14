// Room boundaries traced from the official Artwin presentation boards.
// Pixel coordinates retain the source drawing's proportions; scale is metres/pixel.
// Small shafts are absorbed into adjacent wall thickness, never advertised as rooms.
export const box=(x,z,w,d)=>[[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
export const specs=[];
export function plan(project,code,area,source,scale,rooms,links,windows=[],extra={}){
 const id=`${project}-${code}`;
 specs.push({id,project,area,source,scale,rooms,links,windows,...extra});
 return specs.at(-1);
}
export const R=(id,polygon,extra={})=>({id,polygon,...extra});
export function mirror(spec,code,source,axis='z',area=spec.area){
 const p=structuredClone(spec),index=axis==='x'?0:1;
 const values=p.rooms.flatMap(r=>r.polygon.map(v=>v[index])),sum=Math.min(...values)+Math.max(...values);
 const reflect=v=>{v[index]=sum-v[index];return v;};
 for(const r of p.rooms){r.polygon=r.polygon.map(reflect).reverse();if(r.hint)r.hint=reflect(r.hint);}
 p.links=p.links.map(([a,b,x,z,w])=>{const v=reflect([x,z]);return [a,b,...v,w];});
 p.windows=p.windows.map(([id,x,z,w])=>[id,...reflect([x,z]),w]);
 p.id=`${spec.project}-${code}`;p.source=source;p.area=area;specs.push(p);return p;
}
