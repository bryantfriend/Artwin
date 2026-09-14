import {rect,room,item as f,bed,finishLayout} from './buildLayout.js';

// Traced from Artwin's London Square presentation boards. Room dimensions and
// furnishing positions are approximate; only total advertised areas are published.
const P=Math.PI;
const r=(id,name,polygon,destination,yaw=0)=>({...room(id,name,null,polygon.map(p=>p.map(v=>Math.round(v*1e6)/1e6)),destination,yaw),material:id.startsWith('bath')?'londonTile':'londonFloor'});
const sofa=(id,x,z,w,rotation=0)=>f(id,'sofa','living',[x,z],[w,.9,.95],rotation,{color:'light'});
const tv=(id,room,x,z,w,rotation=0)=>f(id,'tv',room,[x,z],[w,2.1*w/3.1,.38],rotation);
const coffee=(x,z,w=1.15,d=.75)=>f('coffee-table','coffeeOval','living',[x,z],[w,.43,d]);
const dining=(room,x,z,rotation=0)=>f('dining','dining',room,[x,z],[2.05,.85,2.9],rotation);
const kitchen=(room,x,z,w,rotation=0)=>f('kitchen-cabinets','kitchen',room,[x,z],[w,.95,.65],rotation);
const wardrobe=(id,room,x,z,w,rotation=0)=>f(id,'wardrobe',room,[x,z],[w,2.4,.5],rotation,{color:'oak'});
const plant=(id,room,x,z)=>f(id,'plant',room,[x,z],[.4,1.35,.4]);
// Fixtures face the room, with a clear approach to every toilet.
const bath=(id,x,z,w,d)=>[
 f('shower-'+id,'shower',id,[x+.65,z+.65],[1.02,2.1,1.02]),
 f('vanity-'+id,'vanity',id,[x+w-.6,z+.31],[.78,.88,.4]),
 f('toilet-'+id,'toilet',id,[x+w-.42,z+d-.48],[.43,.75,.65],-P/2),
];
const smallBath=(id,x,z,w,d)=>[
 f('shower-'+id,'shower',id,[x+.54,z+.56],[.84,2.1,.88]),
 f('vanity-'+id,'vanity',id,[x+w-.52,z+.29],[.6,.88,.36]),
 f('toilet-'+id,'toilet',id,[x+w-.42,z+d-.4],[.43,.75,.65],-P/2),
];
const art=(x,z,rotation=0,index=0)=>({kind:'art',position:[x,1.88,z],rotation,width:1.15,height:.75,index});
const rug=(x,z,width,depth)=>({kind:'rug',position:[x,.025,z],width,depth,index:2});
const london=config=>finishLayout({...config,theme:'london',area:config.area});

export const london71=london({
 id:'london-two-room-71',area:71.95,entrance:{position:[.8,.82,3.1],yaw:-P/2},
 rooms:[
  r('bath1','Bathroom',rect(0,0,3.2,1.9),[1.7,1.3]),
  r('hall','Entrance hall',rect(0,1.9,3.2,3.2),[1.3,3.4]),
  r('primary','Bedroom',rect(3.2,0,3.8,3.3),[4,2.55]),
  r('living','Living room',rect(3.2,3.3,3.8,6.4),[4.15,4.4],P),
  r('kitchen','Kitchen & dining',rect(0,5.1,3.2,6.4),[2.4,6.2]),
  r('loggia1','Loggia',rect(3.2,9.7,2.75,1.8),[4.7,10.5]),
 ],
 openings:[['entrance',0,3.05,1.05,['hall']],['door',1.9,1.9,.9,['hall','bath1'],'Bathroom door',-1],['door',3.2,2.55,.95,['hall','primary'],'Bedroom door',1],['passage',3.2,4.25,1.1,['hall','living']],['door',2.5,5.1,.95,['hall','kitchen'],'Kitchen door',1,true],['door',4.35,9.7,.9,['living','loggia1'],'Loggia door',-1],['window',5.15,0,2.6,['primary']],['window',7,5.3,2.5,['living']],['window',7,8.25,1.9,['living']],['window',1.6,11.5,2.4,['kitchen']],['window',4.55,11.5,2.15,['loggia1']]],
 furniture:[...bed('primary',5.52,1.65,-P/2,'forest',1.7,2.2,'walnut'),wardrobe('bed-storage','primary',3.55,.8,1.25,P/2),sofa('sofa',6.38,6.3,2.8,-P/2),sofa('sofa-return',5.25,8.35,1.65,P),coffee(5.05,6.8),tv('tv-console','living',3.51,6.7,2.35,P/2),kitchen('kitchen',.43,6.65,2.8,P/2),dining('kitchen',1.65,9.85),wardrobe('hall-storage','hall',.35,4.1,1.35,P/2),...smallBath('bath1',0,0,3.2,1.9),plant('loggia-plant','loggia1',5.5,10.6),plant('living-plant','living',6.6,9.15)],
 decor:[rug(5.25,6.75,2.5,3.9),art(.11,8.6,P/2,4)],
});

export const london110=london({
 id:'london-three-room-110',area:110.13,entrance:{position:[3.7,.82,8.0],yaw:0},
 rooms:[
  r('primary','Bedroom 01',rect(0,0,5.7,3.9),[4.55,2.6]),
  r('living','Kitchen & living',rect(5.7,0,6.9,5.5),[6.65,4.6]),
  r('hall','Entrance hall',[[2.45,3.9],[5.7,3.9],[5.7,8.9],[2.45,8.9],[2.45,5.95],[2.1,5.95],[2.1,3.9]],[3.7,7.9]),
  r('bath1','Bathroom',rect(0,5.95,2.45,2.95),[1.3,8.1]),
  r('bath2','En suite',rect(0,3.9,2.1,2.05),[1.1,5.2]),
  r('bedroom2','Bedroom 02',[[5.7,5.5],[12.6,5.5],[12.6,8.9],[7.8,8.9],[7.8,7.1],[5.7,7.1]],[8.65,6.7]),
  r('bath3','En suite 02',rect(5.7,7.1,2.1,1.8),[6.8,8.3]),
 ],
 openings:[['entrance',3.7,8.9,1.05,['hall']],['door',3.25,3.9,1.0,['hall','primary'],'Bedroom 01 door',-1],['passage',5.7,4.65,1.1,['hall','living']],['door',5.7,6.25,.95,['hall','bedroom2'],'Bedroom 02 door',-1],['door',2.45,8.25,.9,['hall','bath1'],'Bathroom door',1],['door',.65,3.9,.85,['primary','bath2'],'En suite door',1],['door',6.85,7.1,.85,['bedroom2','bath3'],'En suite 02 door',1],['window',1.5,0,2.3,['primary']],['window',4.2,0,1.9,['primary']],['window',7.5,0,2.6,['living']],['window',10.7,0,2.7,['living']],['window',12.6,2.45,3.6,['living']],['window',12.6,7.2,2.3,['bedroom2']]],
 furniture:[...bed('primary',1.55,1.65,0,'rust',1.8,2.35,'walnut'),wardrobe('primary-storage','primary',5.34,1.2,1.8,-P/2),f('reading-chair','chair','primary',[4.3,.8],[.7,.95,.7],.5),plant('bed-plant','primary',4.35,3.35),sofa('sofa',7.65,.72,2.95),sofa('sofa-return',6.38,2.25,1.65,P/2),coffee(8.1,2.15),tv('tv-console','living',8,5.2,2.75,P),dining('living',10.8,2.15,P/2),kitchen('living',11.95,4.35,1.95,-P/2),plant('living-plant','living',12.1,.55),...bed('bedroom2',10.35,7.42,P,'forest',1.8,2.25,'walnut'),wardrobe('bedroom-storage','bedroom2',8.4,5.84,1.1),...bath('bath1',0,5.95,2.45,2.95).map(f=>f.kind==='toilet'?{...f,position:[2.03,0,7.5]}:f),f('shower-bath2','shower','bath2',[.55,5.4],[.88,2.1,.88]),f('vanity-bath2','vanity','bath2',[1.8,5.5],[.65,.88,.36],-P/2),f('toilet-bath2','toilet','bath2',[1.48,4.32],[.43,.75,.65]),...smallBath('bath3',5.7,7.1,2.1,1.8).filter(f=>f.kind!=='shower').map(f=>f.kind==='vanity'?{...f,position:[6.12,0,7.39]}:f),wardrobe('hall-storage','hall',4.8,8.55,1.05,P)],
 decor:[rug(8.05,2.35,3.0,3.4),art(5.59,1.3,-P/2,2)],
});

export const london100=london({
 id:'london-studio-100',area:100.72,entrance:{position:[8.3,.82,.9],yaw:P},
 rooms:[
  r('living','Kitchen & living',[[0,0],[5,0],[5,2],[7.5,2],[7.5,3.8],[0,3.8]],[5.6,3]),
  r('bath1','Bathroom',rect(5,0,2.5,2),[6.3,1.35]),
  r('hall','Entrance hall',[[7.5,0],[9.2,0],[9.2,5.3],[6,5.3],[6,6.6],[4.4,6.6],[4.4,3.8],[7.5,3.8]],[8.35,1.0]),
  r('bedroom2','Bedroom 02',rect(0,3.8,4.4,2.8),[3.35,5.35]),
  r('primary','Bedroom 01',rect(1.3,6.6,4.7,3.8),[4.7,7.5],P),
  r('storage','Dressing room',rect(0,6.6,1.3,3.8),[.65,8.1]),
  r('bedroom3','Bedroom 03',[[6,5.3],[9.2,5.3],[9.2,6.7],[11.7,6.7],[11.7,10.4],[6,10.4]],[7.1,6.35],P),
  r('bath2','En suite',rect(9.2,3.8,2.5,2.9),[10.55,5.75]),
 ],
 openings:[['entrance',8.35,0,1.05,['hall']],['passage',6.4,3.8,1.1,['hall','living']],['door',6.3,2,.9,['living','bath1'],'Bathroom door',-1],['door',4.4,4.5,.9,['hall','bedroom2'],'Bedroom 02 door',-1,true],['door',5.18,6.6,.95,['hall','primary'],'Bedroom 01 door',-1],['door',6,5.95,.9,['hall','bedroom3'],'Bedroom 03 door',1],['door',1.3,7.15,.85,['primary','storage'],'Dressing room door',1],['door',9.85,6.7,.9,['bedroom3','bath2'],'En suite door',1],['window',2.4,0,3.7,['living']],['window',0,5.15,1.8,['bedroom2']],['window',3.6,10.4,3.6,['primary']],['window',9,10.4,3.9,['bedroom3']]],
 furniture:[sofa('sofa',1.55,.69,2.6),coffee(1.35,2.0,1.1),tv('tv-console','living',1.05,3.5,1.6,P),{...dining('living',3.5,2.75,P/2),size:[1.85,.85,2.65]},kitchen('living',7.1,2.9,1.5,-P/2),plant('living-plant','living',.4,1.85),...bed('bedroom2',1.4,5.2,P/2,'rust',1.65,2.15,'walnut'),wardrobe('bed2-storage','bedroom2',3.48,6.27,1.05,P),...bed('primary',2.9,8.85,P,'navy',1.8,2.35,'padded'),...bed('bedroom3',9.65,8.95,P,'forest',1.8,2.35,'walnut'),wardrobe('bed3-storage','bedroom3',6.36,8.75,2.2,P/2),...smallBath('bath1',5,0,2.5,2),...bath('bath2',9.2,3.8,2.5,2.9),wardrobe('dressing-storage','storage',.32,9.0,2,P/2),wardrobe('hall-storage','hall',8.85,2.6,1.5,-P/2)],
 decor:[rug(1.85,2.0,2.9,2.6),art(11.59,8.1,-P/2,3)],
});

export const london131=london({
 id:'london-four-room-131',area:131.20,entrance:{position:[7.6,.82,8.05],yaw:0},
 rooms:[
  r('living','Kitchen & living',[[-.7,0],[-1.5,-2.1],[-.65,-4.2],[1.4,-5.05],[3.45,-4.2],[3.75,-3.4],[5.6,-3.4],[5.6,2.4],[0,2.4],[0,0]],[4.5,1.1],0),
  r('primary','Bedroom 01',[[5.6,-3.4],[11.3,-3.4],[11.3,.6],[9.4,.6],[9.4,2.4],[5.6,2.4]],[8.7,1.55]),
  r('bedroom3','Bedroom 03',rect(0,2.4,3.9,2.8),[3.0,4.35]),
  r('hall','Entrance hall',[[3.9,2.4],[9.4,2.4],[9.4,5.2],[7.25,5.2],[7.25,5.8],[3.9,5.8]],[7.6,4.35]),
  r('bedroom2','Bedroom 02',[[0,5.2],[3.9,5.2],[3.9,5.8],[7.25,5.8],[7.25,6.5],[4.85,6.5],[4.85,8.5],[0,8.5]],[3.55,6.45]),
  r('bath1','Bathroom',rect(9.4,2.4,1.9,2.8),[10.3,4.4]),
  r('bath2','En suite',rect(9.4,.6,1.9,1.8),[10.35,1.9]),
  r('bath3','En suite 02',rect(4.85,6.5,2.4,2),[6,7.85]),
 ],
 openings:[['entrance',8.15,5.2,1.05,['hall']],['passage',4.65,2.4,1.1,['hall','living']],['door',7.35,2.4,1.0,['hall','primary'],'Bedroom 01 door',-1],['door',3.9,3.2,.9,['hall','bedroom3'],'Bedroom 03 door',-1,true],['door',4.43,5.8,.95,['hall','bedroom2'],'Bedroom 02 door',1],['door',9.4,4.5,.9,['hall','bath1'],'Bathroom door',-1,true],['door',9.4,1.55,.8,['primary','bath2'],'En suite door',-1,true],['door',4.85,7.95,.85,['bedroom2','bath3'],'En suite 02 door',-1],['window',-1.075,-3.15,1.25,['living']],['window',.375,-4.625,1.45,['living']],['window',2.425,-4.625,1.45,['living']],['window',0,1.15,1.6,['living']],['window',7.2,-3.4,2.1,['primary']],['window',9.8,-3.4,1.9,['primary']],['window',0,3.8,1.85,['bedroom3']],['window',0,6.85,2.35,['bedroom2']]],
 furniture:[sofa('sofa',1.35,-3.83,2.65),sofa('sofa-left',-.44,-2.48,1.65,P/2),sofa('sofa-right',3.0,-2.45,1.65,-P/2),coffee(1.45,-2.2),dining('living',2.4,.6,P/2),kitchen('living',5.19,-.95,3.7,-P/2),plant('bay-plant','living',-.25,-3.6),plant('living-plant','living',.42,1.8),...bed('primary',8.9,-1.75,0,'rust',1.8,2.35,'walnut'),wardrobe('primary-storage','primary',5.96,-1.7,2.2,P/2),...bed('bedroom3',1.45,3.8,P/2,'navy',1.65,2.2,'walnut'),...bed('bedroom2',1.5,6.85,P/2,'forest',1.8,2.35,'walnut'),wardrobe('bedroom-storage','bedroom2',3.15,5.55,1.4),...smallBath('bath1',9.4,2.4,1.9,2.8),...smallBath('bath2',9.4,.6,1.9,1.8).filter(f=>f.kind!=='shower'),...smallBath('bath3',4.85,6.5,2.4,2),tv('tv-console','living',.32,-.7,1.7,P/2),wardrobe('hall-storage','hall',8.55,2.76,1.1)],
 decor:[rug(1.4,-2.1,3.55,3.0),art(3.79,4.4,-P/2,1)],
});

export const londonLayouts=[london71,london100,london110,london131];

