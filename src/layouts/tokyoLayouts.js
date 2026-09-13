import {rect,room,item as f,bed,finishLayout} from './buildLayout.js';
const P=Math.PI;
const kitchen=(r,x,z,w,rotation=0)=>f('kitchen-cabinets','kitchen',r,[x,z],[w,.95,.65],rotation);
const sofa=(x,z,w,rotation=0,color='brown')=>f('sofa','sofa','living',[x,z],[w,.9,.95],rotation,{color});
const tv=(x,z,w,rotation=0)=>f('tv-console','tv','living',[x,z],[w,2.1*w/3.1,.38],rotation);
const coffee=(x,z)=>f('coffee-table','coffee','living',[x,z],[.85,.45,1.2]);
const table=(r,x,z,rotation=0)=>f('dining-compact','diningCompact',r,[x,z],[1.55,.9,1.6],rotation);
const wardrobe=(id,r,x,z,w,rotation=0,color='light')=>f(id,'wardrobe',r,[x,z],[w,2.4,.5],rotation,{color});
const vanity=(id,r,x,z,w=.8,rotation=0)=>f(id,'vanity',r,[x,z],[w,.88,.4],rotation);
const shower=(r,x,z,w=.9,d=.9,rotation=0)=>f('shower-'+r,'shower',r,[x,z],[w,2.1,d],rotation);
const wc=(r,x,z,rotation=0)=>f('toilet-'+r,'toilet',r,[x,z],[.43,.75,.65],rotation);
const plant=(r,x,z)=>f('plant-'+r,'plant',r,[x,z],[.4,1.35,.4]);
const tub=(r,x,z,rotation=0)=>f('tub-'+r,'tub',r,[x,z],[1.48,.6,.68],rotation);

export const euro52=finishLayout({
 id:'two-room-euro-52',area:52.10,entrance:{position:[7.55,.82,3.7],yaw:P/2},
 rooms:[
  room('living','Kitchen & living','20.30',[[0,3.15],[4.5,3.15],[4.5,4.5],[5.65,4.5],[5.65,6.5],[0,6.5]],[4.3,5.45],P/2),
  room('primary','Bedroom','14.20',rect(1.25,0,4.4,3.15),[4.8,2.6],0),
  room('hall','Entrance hall','6.40',[[5.65,2.05],[8.4,2.05],[8.4,4.5],[4.5,4.5],[4.5,3.15],[5.65,3.15]],[7.55,3.7],P/2),
  room('bath1','Bathroom','4.30',rect(5.65,0,2.75,2.05),[6.8,1.4],0),
  room('storage','Storage','3.61',rect(5.65,4.5,2.75,2),[6.7,5.3],P),
  room('loggia1','Loggia','3.18',rect(0,0,1.25,3.15),[.6,1.8],P/2),
 ],
 openings:[['entrance',8.4,3.65,1.05,['hall']],['door',5.04,3.15,.9,['hall','primary'],'Bedroom door',-1,true],['door',4.5,3.82,.9,['hall','living'],'Living room door',-1],['door',6.95,2.05,.9,['hall','bath1'],'Bathroom door',1],['door',6.95,4.5,.9,['hall','storage'],'Storage door',1,true],['door',1.25,2.5,.85,['primary','loggia1'],'Loggia door',1],['window',0,1.3,1.7,['loggia1']],['window',0,4.8,1.95,['living']]],
 furniture:[...bed('primary',3.45,1.3,0,'taupe',1.7,2.15,'walnut'),wardrobe('bed-wardrobe','primary',5.3,.7,1.1,-P/2,'dark'),sofa(1.25,3.75,2.1,0,'gray'),f('coffee-table','coffeeOval','living',[1.3,5.12],[1.7,.45,.68]),tv(1.3,6.24,1.8,P),kitchen('living',3.65,6.1,2.6,P),{...table('living',3.1,4.22),size:[1.35,.9,1.6]},wardrobe('hall-wardrobe','hall',8.03,2.8,1.2,-P/2,'dark'),wardrobe('store-shelves','storage',8.02,5.6,1.4,-P/2,'oak'),vanity('vanity1','bath1',6.25,.31,.85),shower('bath1',7.75,.6,1.05,1.0),wc('bath1',7.8,1.55,P/2),plant('loggia1',.6,.4)],
 zones:[{polygon:[[0,3.15],[4.5,3.15],[4.5,4.5],[5.65,4.5],[5.65,6.5],[0,6.5]],material:'kitchenMarble'}],
 decor:[{kind:'art',position:[1.3,1.86,3.26],width:1.4,height:.75,index:0},{kind:'rug',position:[1.3,.025,4.86],width:2.35,depth:2.45,index:0}],
});

export const classic78=finishLayout({
 id:'two-room-78',area:78.83,entrance:{position:[8.15,.82,5.62],yaw:0},
 rooms:[room('living','Living room','19.87',rect(9.6,0,5.1,3.35),[10.5,2.1],-P/2),room('kitchen','Kitchen & dining','16.31',rect(9.6,3.35,5.1,3.05),[10.6,5.2],-P/2),room('primary','Bedroom','20.56',rect(0,0,5.2,3.35),[3.5,2.65],P/2),room('hall','Entrance hall','11.63',[[5.2,1.95],[9.6,1.95],[9.6,6.4],[7.1,6.4],[7.1,3.35],[5.2,3.35]],[8.15,5.62],0),room('bath1','Bathroom','3.07',rect(5.2,0,1.9,1.95),[6.45,1.55],0),room('bath2','Guest bathroom','3.91',rect(7.1,0,2.5,1.95),[8.1,1.3],0),room('loggia1','Kitchen loggia','3.48',rect(14.7,3.35,1.15,3.05),[15.25,5.5],0)],
 openings:[['entrance',8.15,6.4,1.05,['hall']],['door',5.2,2.65,.95,['hall','primary'],'Bedroom door',-1],['door',6.4,1.95,.9,['hall','bath1'],'Bathroom door',1],['door',8.15,1.95,.9,['hall','bath2'],'Guest bathroom door',-1],['door',9.6,2.65,.95,['hall','living'],'Living room door',1],['door',9.6,4.3,1.0,['hall','kitchen'],'Kitchen door',-1],['door',14.7,4.25,.95,['kitchen','loggia1'],'Loggia door',1],['window',0,1.7,2.25,['primary']],['window',14.7,1.7,2.2,['living']],['window',15.85,5,2.4,['loggia1']]],
 furniture:[...bed('primary',1.4,1.675,P/2,'white',1.8,2.35),wardrobe('bed-wardrobe','primary',4.87,.95,1.45,-P/2),sofa(12.2,.65,2.7,0,'charcoal'),coffee(12.2,1.85),tv(12.2,3.04,2.8,P),f('accent-chair','chair','living',[10.3,.85],[.65,.95,.65],.65),plant('living',14.25,2.8),kitchen('kitchen',12.2,3.75,3.7),table('kitchen',12.45,5.45),tub('bath1',6.15,.45),vanity('vanity1','bath1',5.53,1.3,.7,P/2),wc('bath1',6.7,1.1,P/2),vanity('vanity2','bath2',8,.3,.9),shower('bath2',9,.56,.95,.9),wc('bath2',9.1,1.47,P),wardrobe('hall-storage','hall',7.42,4.55,1.2,P/2),plant('loggia1',15.3,6.0)],
 decor:[{kind:'art',position:[12.2,1.9,.11],width:1.5,height:.75,index:0},{kind:'rug',position:[12.2,.025,1.8],width:3.35,depth:2.15,index:0}],
});

export const euro70=finishLayout({
 id:'three-room-euro-70',area:70.33,entrance:{position:[6.35,.82,.78],yaw:P},
 rooms:[room('living','Kitchen & living','20.13',rect(1,3.7,4.6,4.3),[4.4,4.85],P),room('primary','Bedroom 01','14.61',rect(0,0,3.85,3.7),[2.9,2.8],0),room('bedroom2','Bedroom 02','14.26',[[5.6,3.7],[8.4,3.7],[8.4,4.25],[6.8,4.25],[6.8,6],[8.4,6],[8.4,9.6],[5.6,9.6]],[6.2,6.5],P),room('hall','Entrance hall','7.81',[[5.8,0],[7,0],[7,3.7],[3.85,3.7],[3.85,2.25],[5.8,2.25]],[6.35,.78],P),room('bath1','Bathroom','4.25',rect(3.85,0,1.95,2.25),[4.9,1.6],0),room('bath2','En suite','2.81',rect(6.8,4.25,1.6,1.75),[7.22,5.55],0),room('storage','Storage','3.75',rect(7,.65,1.4,3.05),[7.45,1.7],P),room('loggia1','Loggia','2.71',rect(0,3.7,1,2.9),[.5,4.65],0)],
 openings:[['entrance',6.4,0,1.0,['hall']],['door',3.85,2.98,.95,['hall','primary'],'Bedroom 01 door',1,true],['door',4.8,2.25,.9,['hall','bath1'],'Bathroom door',-1,true],['door',4.75,3.7,.95,['hall','living'],'Living room door',-1],['door',6.22,3.7,.9,['hall','bedroom2'],'Bedroom 02 door',-1],['door',7,2.6,.85,['hall','storage'],'Storage door',1,true],['door',7.35,6,.8,['bedroom2','bath2'],'En suite door',1],['door',1,4.65,.9,['living','loggia1'],'Loggia door',1,true],['window',0,1.8,2.5,['primary']],['window',0,5.25,1.8,['loggia1']],['window',3.3,8,2.8,['living']],['window',7,9.6,1.95,['bedroom2']]],
 furniture:[...bed('primary',1.92,1.35,0,'white',1.7,2.25),wardrobe('bed-wardrobe','primary',3.52,1.05,1.4,-P/2),...bed('bedroom2',7.02,8.25,P,'taupe',1.65,2.3,'darkMarble'),wardrobe('bedroom2-wardrobe','bedroom2',8.08,6.47,.75,-P/2,'oak'),sofa(4.92,6.65,2.35,-P/2),tv(1.29,6.8,1.95,P/2),{...coffee(3.35,7.25),rotation:P/2},kitchen('living',2.62,4.09,2.7),table('living',2.95,5.33),vanity('vanity1','bath1',4.48,.3,.8),shower('bath1',5.28,.72,.86,1.1),wc('bath1',4.2,1.65),vanity('vanity2','bath2',7.22,4.54,.65),shower('bath2',7.94,4.85,.75,1),wc('bath2',7.95,5.62,P),wardrobe('storage-shelves','storage',8.1,2.15,2.15,-P/2,'oak')],
 zones:[{polygon:rect(1,3.7,3.05,.85),material:'kitchenMarble'}],decor:[{kind:'art',position:[5.49,1.9,6.6],rotation:-P/2,width:1.3,height:.75,index:2},{kind:'rug',position:[3.2,.025,6.75],width:3.0,depth:2.05,index:0}],
});

export const euro82=finishLayout({
 id:'three-room-euro-82',area:82.30,entrance:{position:[1.91,.82,.8],yaw:P},
 rooms:[room('living','Kitchen & living','24.32',rect(3.1,3.35,5.05,4.05),[4,4.3],P),room('primary','Bedroom 01','17.20',rect(4.85,0,4.55,3.35),[5.65,2.55],-P/2),room('bedroom2','Bedroom 02','15.50',[[0,3.35],[3.1,3.35],[3.1,8.65],[0,8.65],[0,5.5],[1.65,5.5],[1.65,3.85],[0,3.85]],[2.35,5.9],P),room('hall','Entrance hall','10.14',[[1.25,0],[2.6,0],[2.6,1.85],[4.85,1.85],[4.85,3.35],[1.25,3.35]],[1.91,.8],P),room('bath1','Bathroom','4.80',rect(2.6,0,2.25,1.85),[3.55,1.25],0),room('bath2','En suite','2.81',rect(0,3.85,1.65,1.65),[1.12,4.42],P/2),room('storage','Storage','3.75',rect(0,.55,1.25,2.8),[.62,1.5],P),room('loggia1','Loggia','3.79',rect(8.15,3.35,1.25,2.9),[8.75,5.5],0)],
 openings:[['entrance',1.93,0,1.05,['hall']],['door',1.25,2.35,.85,['hall','storage'],'Storage door',-1,true],['door',3.5,1.85,.9,['hall','bath1'],'Bathroom door',1],['door',4.85,2.6,.95,['hall','primary'],'Bedroom 01 door',1],['door',2.25,3.35,.9,['hall','bedroom2'],'Bedroom 02 door',-1],['door',3.65,3.35,.9,['hall','living'],'Living room door',-1],['door',1.65,4.6,.7,['bedroom2','bath2'],'En suite door',1],['door',8.15,4.6,.9,['living','loggia1'],'Loggia door',1],['window',7.1,0,2.8,['primary']],['window',1.55,8.65,2.1,['bedroom2']],['window',5.7,7.4,2.8,['living']],['window',8.78,6.25,.95,['loggia1']]],
 furniture:[...bed('primary',8.05,1.675,-P/2,'white',1.7,2.3),wardrobe('bed-wardrobe','primary',5.17,.87,1.3,P/2),...bed('bedroom2',1.35,7.03,P/2,'taupe',1.65,2.25,'darkMarble'),wardrobe('bedroom2-wardrobe','bedroom2',2.77,5.55,.85,-P/2,'oak'),sofa(5.3,6.85,2.7,P),tv(7.84,6.15,1.95,-P/2),{...coffee(6.85,5.85),rotation:P/2},kitchen('living',6.12,3.74,3.05),table('living',4.8,4.95),vanity('vanity1','bath1',3.25,.3,.85),shower('bath1',4.3,.55,.9,.85),wc('bath1',4.4,1.42,P),vanity('vanity2','bath2',.42,4.15,.55),shower('bath2',.48,4.98,.78,.85,P/2),wc('bath2',1.22,5.15,-P/2),wardrobe('storage-shelves','storage',.3,2.1,1.6,P/2,'oak')],
 zones:[{polygon:rect(4.45,3.35,3.7,1.1),material:'kitchenMarble'}],decor:[{kind:'art',position:[3.21,1.86,6.1],rotation:P/2,width:.9,height:.85,index:0},{kind:'rug',position:[5.8,.025,6.2],width:3.1,depth:2.05,index:0}],
});

export const classic106=finishLayout({
 id:'three-room-106',area:106.01,entrance:{position:[.85,.82,6.4],yaw:-P/2},
 rooms:[room('living','Living room','25.50',rect(3.1,7.75,3.6,6.3),[4.2,11.4],P),room('kitchen','Kitchen & dining','16.31',rect(0,0,3.1,5.55),[1.7,4.65],0),room('primary','Bedroom 01','20.16',rect(3.1,0,3.6,5.55),[4.4,4.2],0),room('bedroom2','Bedroom 02','18.31',[[0,7.75],[3.1,7.75],[3.1,14.05],[0,14.05],[0,10.2],[1.65,10.2],[1.65,8.35],[0,8.35]],[2.2,11.2],P),room('hall','Entrance hall','11.82',rect(0,5.55,4.5,2.2),[.85,6.4],-P/2),room('bath1','Bathroom','4.41',rect(4.5,5.55,2.2,2.2),[5.05,6.65],-P/2),room('bath2','En suite','3.05',rect(0,8.35,1.65,1.85),[1.14,8.98],P/2),room('loggia1','Kitchen loggia','3.48',rect(0,-1.2,3.1,1.2),[1.4,-.6],0),room('loggia2','Bedroom loggia','3.18',rect(0,14.05,3.1,1.1),[1.55,14.6],P)],
 openings:[['entrance',0,6.4,1.05,['hall']],['door',2.42,5.55,.95,['hall','kitchen'],'Kitchen door',1],['door',3.88,5.55,.95,['hall','primary'],'Bedroom 01 door',1],['door',4.5,6.7,.9,['hall','bath1'],'Bathroom door',1],['door',2.37,7.75,.95,['hall','bedroom2'],'Bedroom 02 door',-1],['door',3.89,7.75,1.0,['hall','living'],'Living room door',-1],['door',1.65,9,.85,['bedroom2','bath2'],'En suite door',-1],['door',1.55,0,1.0,['kitchen','loggia1'],'Kitchen loggia door',1],['door',1.55,14.05,1.0,['bedroom2','loggia2'],'Bedroom loggia door',-1],['window',1.55,-1.2,2.6,['loggia1']],['window',4.9,0,2.6,['primary']],['window',4.9,14.05,2.6,['living']],['window',1.55,15.15,2.6,['loggia2']]],
 furniture:[kitchen('kitchen',.42,2.6,3.7,P/2),f('breakfast','breakfast','kitchen',[2.16,2.7],[1.4,.82,2]),...bed('primary',5.35,2.2,-P/2,'white',1.8,2.3),wardrobe('bed-wardrobe','primary',3.43,1.15,1.5,P/2),...bed('bedroom2',1.25,12.5,P/2,'taupe',1.75,2.15,'padded'),wardrobe('bedroom2-wardrobe','bedroom2',2.77,10.2,1.0,-P/2,'dark'),f('dining','dining','living',[5.15,9.5],[2,.85,2.7]),sofa(6.05,12.5,2.55,-P/2,'light'),tv(3.41,12.5,2.5,P/2),coffee(4.75,12.5),f('hall-console','hallStorage','hall',[.33,7.05],[.85,2.15,.42],P/2),vanity('vanity1','bath1',5.1,5.86,.85),shower('bath1',6.1,6.13,1,1),wc('bath1',6.2,7.24,P),vanity('vanity2','bath2',.42,8.64,.55),shower('bath2',1.2,9.74,.74,.78),wc('bath2',.42,9.63,P/2),plant('loggia1',2.67,-.6),plant('loggia2',.45,14.62)],
 decor:[{kind:'art',position:[6.59,1.9,12.5],rotation:-P/2,width:1.4,height:.75,index:0},{kind:'rug',position:[4.8,.025,12.4],width:2.55,depth:2.9,index:0}],
});
export const additionalLayouts=[euro52,euro70,classic78,euro82,classic106];
