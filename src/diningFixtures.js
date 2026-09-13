// Table centers differ from furniture footprints because the latter include chairs.
export function diningFixture(item){
  if(item.kind==='dining')return {offset:[0,0],radii:[.33*item.size[0]/2.2,.7*item.size[2]/3]};
  if(item.kind==='diningCompact')return {offset:[0,-.2*item.size[2]/1.6],radii:[.43*item.size[0]/1.55,.24*item.size[2]/1.6]};
  if(item.kind==='breakfast')return {offset:[-.25,0],radii:[.25,.52]};
  return null;
}

export function diningFixtures(layout){
  return layout.furniture.flatMap(item=>{
    const shape=diningFixture(item);if(!shape)return [];
    const yaw=item.rotation||0,[x,z]=shape.offset;
    const room=item.room||layout.rooms.find(r=>r.id===(item.kind==='breakfast'?'kitchen':'living'))?.id;
    return [{id:item.id,room,radii:shape.radii,rotation:yaw,position:[item.position[0]+x*Math.cos(yaw)+z*Math.sin(yaw),0,item.position[2]-x*Math.sin(yaw)+z*Math.cos(yaw)]}];
  });
}
