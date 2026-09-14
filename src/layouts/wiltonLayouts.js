import {rect,room,item as f,bed,finishLayout} from './buildLayout.js';

// Traced from the three unique Wilton Park presentation boards, supplied by
// Artwin. Furnishing geometry is approximate; room areas are not inferred.
const P=Math.PI;
const r=(id,name,polygon,destination,yaw=0)=>({...room(id,name,null,polygon.map(p=>p.map(v=>Math.round(v*1e6)/1e6)),destination,yaw),material:id.startsWith('bath')?'stone':id==='kitchen'?'kitchenMarble':id==='balcony'?'stone':'wiltonFloor',...(id==='balcony'?{outdoor:true}: {})});
const sofa=(id,room,x,z,w,rotation=0)=>f(id,'sofa',room,[x,z],[w,.9,.95],rotation,{color:'light'});
const tv=(id,room,x,z,w,rotation=0)=>f(id,'tv',room,[x,z],[w,2.1*w/3.1,.38],rotation);
const coffee=(x,z,w=1.15,d=.75)=>f('coffee-table','coffeeOval','living',[x,z],[w,.43,d]);
const dining=(room,x,z,rotation=0)=>f('dining','dining',room,[x,z],[2.05,.85,2.9],rotation,{seats:6});
const kitchen=(room,x,z,w,rotation=0)=>f('kitchen-cabinets','kitchen',room,[x,z],[w,.95,.65],rotation);
const wardrobe=(id,room,x,z,w,rotation=0)=>f(id,'wardrobe',room,[x,z],[w,2.4,.5],rotation,{color:'dark'});
const plant=(id,room,x,z)=>f(id,'plant',room,[x,z],[.4,1.35,.4]);
const art=(x,z,rotation=0,index=0)=>({kind:'art',position:[x,1.88,z],rotation,width:1.15,height:.75,index});
const rug=(x,z,width,depth)=>({kind:'rug',position:[x,.025,z],width,depth,index:2});
function wilton(config){
 const layout=finishLayout({...config,theme:'wilton'});
 for(const wall of layout.walls)if(wall.exterior&&wall.roomIds.includes('balcony'))wall.railing=true;
 const balcony=layout.rooms.find(r=>r.outdoor);
 if(balcony)layout.tourStops.splice(1,0,{room:balcony.id,title:'An open-air retreat',description:'Step onto the balcony for a little fresh air and a view beyond the city.',position:[balcony.destination[0],1.68,balcony.destination[2]],target:[-18,3,balcony.destination[2]-8],fov:76});
 return layout;
}

export const wilton82=wilton({
 id:'wilton-two-room-82',area:82.60,entrance:{position:[1,.82,8.2],yaw:-P/2},
 rooms:[
  r('primary','Bedroom',rect(0,0,3.5,4.9),[2.55,3.6]),
  r('living','Living room',rect(3.5,0,3.7,7.1),[4.65,6.1]),
  r('bath1','Bathroom',rect(0,4.9,2.1,2.2),[1.25,6.3]),
  r('hall','Entrance hall',[[2.1,4.9],[3.5,4.9],[3.5,9.4],[0,9.4],[0,7.1],[2.1,7.1]],[1.1,8.15]),
  r('bath2','Guest bathroom',rect(1.1,9.4,2.4,1.4),[2.4,10.1]),
  r('storage','Storage',rect(0,9.4,1.1,1.4),[.55,10.05]),
  r('kitchen','Kitchen & dining',rect(3.5,7.1,5.45,3.7),[4.4,8.1]),
 ],
 openings:[['entrance',0,8.15,1.05,['hall']],['door',2.75,4.9,.95,['hall','primary'],'Bedroom door',1],['door',2.1,6.4,.85,['hall','bath1'],'Bathroom door',1,true],['door',3.5,6.25,.95,['hall','living'],'Living room door',1],['door',3.5,8.25,1,['hall','kitchen'],'Kitchen door',1],['door',2.8,9.4,.85,['hall','bath2'],'Guest bathroom door',1],['door',.55,9.4,.8,['hall','storage'],'Storage door',1],['window',1.75,0,2.6,['primary']],['window',5.4,0,2.65,['living']],['window',7.2,3.2,3.8,['living']],['window',6.4,10.8,3.8,['kitchen']],['window',8.95,9.25,2.3,['kitchen']]],
 furniture:[...bed('primary',1.6,1.6,0,'charcoal',1.7,2.25,'walnut'),wardrobe('primary-storage','primary',.35,3.65,1.55,P/2),sofa('sofa','living',6.58,3.8,2.85,-P/2),sofa('sofa-return','living',5.4,1.1,1.9),coffee(5.1,3.65),tv('tv-console','living',3.82,3.65,2.8,P/2),plant('living-plant','living',6.75,.5),kitchen('kitchen',5.4,10.38,3.2,P),dining('kitchen',7.15,8.4,P/2),f('shower-bath1','shower','bath1',[.59,5.49],[.95,2.1,.95]),f('vanity-bath1','vanity','bath1',[1.6,5.19],[.7,.88,.36]),f('toilet-bath1','toilet','bath1',[.42,6.65],[.43,.75,.65],P/2),f('toilet-bath2','toilet','bath2',[1.53,10.08],[.43,.75,.65],P/2),f('vanity-bath2','vanity','bath2',[3.19,10.33],[.65,.88,.4],-P/2),f('storage-shelves','shelf','storage',[.55,10.52],[.85,1.8,.32])],
 decor:[rug(5.5,3.5,2.65,3.55),art(7.09,5.8,-P/2,3)],
});

export const wilton92=wilton({
 id:'wilton-three-room-92',area:92.70,entrance:{position:[7.6,.82,8.3],yaw:P/2},
 rooms:[
  r('primary','Bedroom 01',rect(1.38,0,3.7,5.2),[4.05,4.1]),
  r('bedroom2','Bedroom 02',rect(5.08,0,3.5,4.2),[6.1,3.1]),
  r('bath1','Bathroom',rect(6.42,4.2,2.16,2.7),[7.3,6.05]),
  r('hall','Entrance hall',[[5.08,4.2],[6.42,4.2],[6.42,6.9],[8.58,6.9],[8.58,9.25],[5.08,9.25]],[7.55,8.25]),
  r('living','Kitchen & living',[[1.38,5.2],[5.08,5.2],[5.08,10.65],[0,10.65],[0,7.83],[1.38,7.83]],[4.25,7.7]),
  r('bath2','Guest bathroom',rect(5.08,9.25,2.3,1.4),[6.3,9.97]),
  r('storage','Storage',rect(7.38,9.25,1.2,1.4),[7.98,9.9]),
  r('balcony','Balcony',rect(0,0,1.38,7.83),[.68,5.8],0),
 ],
 openings:[['entrance',8.58,8.05,1.05,['hall']],['door',5.08,4.7,.9,['hall','primary'],'Bedroom 01 door',1,true],['door',5.78,4.2,.95,['hall','bedroom2'],'Bedroom 02 door',1],['door',6.42,6.15,.9,['hall','bath1'],'Bathroom door',1],['passage',5.08,8.45,1.1,['hall','living']],['door',6.7,9.25,.85,['hall','bath2'],'Guest bathroom door',1],['door',7.99,9.25,.8,['hall','storage'],'Storage door',1],['door',1.38,6.6,.85,['living','balcony'],'Balcony door',1,true],['window',1.38,2.2,2.6,['primary','balcony']],['window',3.15,0,2.7,['primary']],['window',6.8,0,2.5,['bedroom2']],['window',8.58,2,2.7,['bedroom2']],['window',2.6,10.65,3.8,['living']]],
 furniture:[...bed('primary',3.15,1.65,0,'pearl',1.8,2.35,'padded'),wardrobe('primary-storage','primary',1.73,4.08,1.4,P/2),...bed('bedroom2',6.82,1.55,0,'charcoal',1.7,2.2,'walnut'),sofa('sofa','living',3.42,5.85,2.35),coffee(3.75,7.2,1.05,.5),tv('tv-console','living',2.7,8.05,1.65,P),kitchen('living',.42,9.35,2.15,P/2),f('dining','diningRound','living',[3.25,9.32],[2.1,.85,2.1]),f('shower-bath1','shower','bath1',[7.01,4.79],[.95,2.1,.95]),f('vanity-bath1','vanity','bath1',[8.12,4.5],[.65,.88,.4]),f('toilet-bath1','toilet','bath1',[8.16,6.4],[.43,.75,.65],-P/2),f('toilet-bath2','toilet','bath2',[5.51,9.97],[.43,.75,.65],P/2),f('vanity-bath2','vanity','bath2',[7.07,10.15],[.65,.88,.4],-P/2),f('storage-shelves','shelf','storage',[7.98,10.37],[.95,1.8,.32]),wardrobe('hall-storage','hall',7.55,7.23,1.3),sofa('balcony-seat','balcony',.69,1.25,1.4,P/2),plant('balcony-plant','balcony',.65,2.65)],
 zones:[{polygon:rect(0,8.05,5.08,2.6),material:'kitchenMarble'}],
 decor:[rug(3.55,6.7,2.65,2.15),art(3.42,5.31,0,2),art(5.19,1.8,P/2,4)],
});

export const wilton122=wilton({
 id:'wilton-four-room-122',area:122.10,entrance:{position:[9.6,.82,.9],yaw:P},
 rooms:[
  r('living','Kitchen & living',rect(0,0,7.03,3.75),[5.9,2.85]),
  r('hall','Entrance hall',[[7.03,0],[10.63,0],[10.63,3.35],[8.75,3.35],[8.75,5.4],[7.03,5.4]],[9.5,.9]),
  r('primary','Bedroom 01',[[1.75,3.75],[7.03,3.75],[7.03,5.4],[5.3,5.4],[5.3,10.85],[1.75,10.85]],[4.35,5.05],P),
  r('bedroom2','Bedroom 02',rect(5.3,5.4,3.45,5.45),[7.8,6.4],P),
  r('bedroom3','Bedroom 03',[[8.75,3.35],[10.63,3.35],[10.63,5.49],[12.5,5.49],[12.5,10.85],[8.75,10.85]],[9.55,5.15],P),
  r('bath1','Bathroom',rect(10.63,0,1.87,3.35),[11.45,2.5]),
  r('bath2','Guest bathroom',rect(10.63,3.35,1.87,2.14),[11.5,4.7]),
 ],
 openings:[['entrance',9.75,0,1.05,['hall']],['passage',7.03,2.85,1.1,['hall','living']],['door',7.03,4.52,.95,['hall','primary'],'Bedroom 01 door',1,true],['door',7.92,5.4,.95,['hall','bedroom2'],'Bedroom 02 door',-1],['door',8.75,4.52,.95,['hall','bedroom3'],'Bedroom 03 door',1],['door',10.63,2.5,.9,['hall','bath1'],'Bathroom door',1],['door',10.63,4.68,.85,['bedroom3','bath2'],'Guest bathroom door',-1],['window',2.1,0,3.2,['living']],['window',0,1.85,2.6,['living']],['window',3.5,10.85,2.6,['primary']],['window',1.75,8.3,3.5,['primary']],['window',7,10.85,2.4,['bedroom2']],['window',10.6,10.85,2.7,['bedroom3']],['window',12.5,8.15,3.8,['bedroom3']]],
 furniture:[kitchen('living',4.88,.42,3.65),f('dining','diningRound','living',[5.15,2.1],[2,.85,2]),sofa('sofa','living',.9,1.85,2.65,P/2),coffee(2.1,1.75,.75,1.15),tv('tv-console','living',3.05,2.05,2.2,-P/2),plant('living-plant','living',2.4,3.35),...bed('primary',3.875,8.9,-P/2,'pearl',1.8,2.35,'padded'),wardrobe('primary-storage','primary',2.12,5.7,2.1,P/2),f('primary-desk','desk','primary',[4.35,4.13],[1.4,.76,.55]),...bed('bedroom2',7.325,8.9,-P/2,'mocha',1.7,2.35,'walnut'),wardrobe('bedroom2-storage','bedroom2',5.65,6.6,1.6,P/2),...bed('bedroom3',10.175,8.9,P/2,'charcoal',1.8,2.35,'padded'),wardrobe('bedroom3-storage','bedroom3',12.13,6.65,1.65,-P/2),plant('bedroom3-plant','bedroom3',9.3,6.45),wardrobe('hall-storage','hall',7.4,1.15,1.55,P/2),f('shower-bath1','shower','bath1',[11.23,.65],[.95,2.1,1.05]),f('vanity-bath1','vanity','bath1',[12.16,1.48],[.85,.88,.4],-P/2),f('toilet-bath1','toilet','bath1',[12.08,2.85],[.43,.75,.65],-P/2),f('shower-bath2','shower','bath2',[11.2,3.92],[.88,2.1,.88]),f('vanity-bath2','vanity','bath2',[12.02,3.64],[.6,.88,.36]),f('toilet-bath2','toilet','bath2',[12.08,5.03],[.43,.75,.65],-P/2)],
 zones:[{polygon:rect(3.5,0,3.53,3.75),material:'kitchenMarble'}],
 decor:[rug(1.8,1.85,2.75,3.1),art(8.64,7.15,-P/2,3)],
});

// Two viewpoints keep the lounge and kitchen visible on opposite sides of the media divider.
wilton122.tourStops[0]={...wilton122.tourStops[0],position:[1.8,1.68,3.12],target:[.9,.95,1.85]};
wilton122.tourStops.splice(1,0,{room:'living',title:'Everyday rituals',description:'Everyday rituals, beautifully framed',position:[6.5,1.68,3.2],target:[4.7,1.15,1.4],fov:76});

export const wiltonLayouts=[wilton82,wilton92,wilton122];
