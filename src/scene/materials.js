import * as THREE from 'three';
import { decorativeTexture } from './decorativeTextures.js';
import { wovenRugTextures } from './wovenRug.js';
import { kitchenMarbleTextures } from './kitchenMarble.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const boxGeometry=new THREE.BoxGeometry(1,1,1);
export const roundedGeometry=new RoundedBoxGeometry(1,1,1,3,.09);
export const sphereGeometry=new THREE.SphereGeometry(1,20,12);
export const cylinderGeometry=new THREE.CylinderGeometry(1,1,1,40);
export const pillowGeometry=new THREE.SphereGeometry(1,32,20);
{const p=pillowGeometry.attributes.position;for(let i=0;i<p.count;i++){const puff=(n,power)=>Math.sign(n)*Math.pow(Math.abs(n),power);p.setXYZ(i,puff(p.getX(i),.45),puff(p.getY(i),.75),puff(p.getZ(i),.45));}pillowGeometry.computeVertexNormals();}
export const ringGeometry=new THREE.TorusGeometry(1,.045,8,48);
function texture(kind) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;
  const c=canvas.getContext('2d');let seed=193;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  if(['wood','londonFloor','wiltonFloor'].includes(kind)) {
    c.fillStyle='#d5c7b2';c.fillRect(0,0,512,1024);
    const palette=kind==='wiltonFloor'?['#d3c4b5','#c4b3a1','#ded1c1','#cdbdab','#d9cbba']:kind==='londonFloor'?['#e3e0d8','#d8d6cf','#e8e5dc','#d0cec5','#e1ded5']:['#d9cbb6','#c6ad8e','#bea07b','#e0d5c4','#d2bda0','#b79a78'];
    for(let col=0;col<8;col++) {
      for(let row=-1;row<3;row++) {c.fillStyle=palette[Math.floor(random()*palette.length)];c.fillRect(col*64+1,row*430+(col%3)*130,63,429);}
      for(let i=0;i<100;i++){const x=col*64+random()*63;c.strokeStyle=`rgba(66,43,25,${random()*(kind==='londonFloor'?.035:.10)})`;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+5,300,x-5,700,x,1024);c.stroke();}
    }
  } else {
    const dark=kind==='darkMarble';c.fillStyle=dark?'#202123':'#f1f0ec';c.fillRect(0,0,512,1024);
    for(let i=0;i<24;i++) {
      let x=random()*750-120,y=-50;c.beginPath();c.moveTo(x,y);
      for(let j=0;j<12;j++){x+=random()*95-32;y+=100;c.lineTo(x,y);}
      c.strokeStyle=dark?(i%3===0?'#a78550':'#525252'):(i%3===0?'#b2aaa0':'#d0cfca');c.globalAlpha=.3+random()*.4;c.lineWidth=.4+random()*2.5;c.stroke();
    }
    c.globalAlpha=1;
  }
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?2:1,kind==='wood'?2:1);t.anisotropy=8;return t;
}
function stripeTexture(white=false){
  const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
  const colors=white?['#e4e1da','#eeece6','#d3d0c9','#f4f1eb']:['#695240','#b9aa95','#403c38','#d7cdbb','#8c7861'];
  for(let y=0;y<512;y+=32){ctx.fillStyle=colors[Math.floor(y/32)%colors.length];ctx.fillRect(0,y,512,32);}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function weaveTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const c=canvas.getContext('2d');c.fillStyle='#888';c.fillRect(0,0,128,128);
  for(let i=0;i<128;i+=4){c.fillStyle=i%8?'#aaa':'#666';c.fillRect(i,0,1,128);c.fillRect(0,i,128,1);}
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(5,5);return t;
}
export function createMaterials(theme){
  const maps={wood:texture('wood'),stone:texture('stone'),darkMarble:texture('darkMarble'),weave:weaveTexture(),brownBedding:stripeTexture(),whiteBedding:stripeTexture(true)};
  const colors={wall:'#f1f1ef',trim:'#ffffff',dark:'#363638',walnut:'#4b3527',oak:'#b89c7c',linen:'#d3d0c9',taupe:'#857767',sage:'#a8a698',metal:'#292b2c',brass:'#bd9553',ceramic:'#fafaf7',rug:'#d4d0c7',leaf:'#3d4737',soil:'#433528',black:'#141416',white:'#fafaf7',curtain:'#92918d',caramel:'#9c7257',padded:'#adaeaa',pink:'#d4969f'};
  const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='brass'?.3:.82,metalness:k==='brass'?.65:0})]));
  for(const k of ['wood','stone','darkMarble'])materials[k]=new THREE.MeshPhysicalMaterial({map:maps[k],roughness:k==='wood'?.52:.26,clearcoat:k==='wood'?.12:.3,clearcoatRoughness:.3,side:THREE.DoubleSide});
  maps.hallOak=maps.wood.clone();maps.hallOak.repeat.set(3.2,2);maps.hallOak.needsUpdate=true;
  materials.hallOak=new THREE.MeshPhysicalMaterial({map:maps.hallOak,color:'#f1e6d5',roughness:.6,clearcoat:.08});
  const marble=kitchenMarbleTextures();maps.kitchenMarble=marble.map;maps.kitchenGrout=marble.bump;
  materials.kitchenMarble=new THREE.MeshPhysicalMaterial({map:marble.map,bumpMap:marble.bump,bumpScale:.002,roughness:.28,clearcoat:.22,clearcoatRoughness:.3});
  for(const k of ['linen','taupe','padded','rug','curtain','caramel']){materials[k].bumpMap=maps.weave;materials[k].bumpScale=k==='rug'?.022:.008;materials[k].roughness=.92;}
  for(const k of ['brownBedding','whiteBedding'])materials[k]=new THREE.MeshPhysicalMaterial({map:maps[k],roughness:.98,bumpMap:maps.weave,bumpScale:.01,sheen:.45,side:THREE.DoubleSide});
  for(let i=0;i<6;i++){maps['art'+i]=decorativeTexture('art',i);materials['art'+i]=new THREE.MeshStandardMaterial({map:maps['art'+i],roughness:1});}
  for(let i=0;i<3;i++){maps['carpet'+i]=decorativeTexture('rug',i);materials['carpet'+i]=new THREE.MeshStandardMaterial({map:maps['carpet'+i],bumpMap:maps.weave,bumpScale:.018,roughness:1});}
  const woven=wovenRugTextures();maps.livingRug=woven.map;maps.livingRugBump=woven.bump;
  materials.livingRug=new THREE.MeshPhysicalMaterial({map:woven.map,bumpMap:woven.bump,bumpScale:.012,roughness:1,sheen:.25,sheenColor:'#bbb9ae'});
  materials.rugBinding=new THREE.MeshStandardMaterial({color:'#8e8d82',roughness:1,bumpMap:maps.weave,bumpScale:.004});
  materials.sheer=new THREE.MeshStandardMaterial({color:'#f6f1e7',transparent:true,opacity:.38,roughness:1,side:THREE.DoubleSide,depthWrite:false});
  materials.terracotta=new THREE.MeshStandardMaterial({color:'#ac6d50',roughness:.9});
  materials.curtain.side=THREE.DoubleSide;
  materials.upholstery=new THREE.MeshPhysicalMaterial({color:'#ece8df',roughness:.93,bumpMap:maps.weave,bumpScale:.008,sheen:.4,sheenColor:'#fff8ed'});
  for(const [name,color] of Object.entries({sofaGray:'#626563',sofaGrayAccent:'#8f9290'}))materials[name]=new THREE.MeshPhysicalMaterial({color,roughness:.94,bumpMap:maps.weave,bumpScale:.005,sheen:.3,sheenColor:'#d7d5cf'});
  materials.cabinetBlack=new THREE.MeshStandardMaterial({color:'#121315',roughness:.66});
  materials.cabinetDoor=new THREE.MeshStandardMaterial({color:'#191a1b',roughness:.57});
  materials.brushedNickel=new THREE.MeshStandardMaterial({color:'#bfc3c5',metalness:.85,roughness:.3});
  materials.chandelierGold=new THREE.MeshStandardMaterial({color:'#ac8b51',metalness:.72,roughness:.32});
  materials.chandelierLED=new THREE.MeshStandardMaterial({color:'#fff2cb',emissive:'#ffd181',emissiveIntensity:1.15,toneMapped:false});
  for(const [name,color] of Object.entries({sofaBrown:'#755039',sofaAccent:'#9a7656',chairFabric:'#b97540'}))materials[name]=new THREE.MeshPhysicalMaterial({color,roughness:.88,bumpMap:maps.weave,bumpScale:.003,sheen:.3,sheenColor:'#d5aa7d',sheenRoughness:.85});
  materials.chairStitch=new THREE.MeshStandardMaterial({color:'#a96c3e',roughness:.95});
  materials.hallJoinery=new THREE.MeshStandardMaterial({color:'#747779',roughness:.72});
  materials.mirrorPanel=new THREE.MeshStandardMaterial({color:'#64686b',roughness:.78});
  materials.mirrorLED=new THREE.MeshStandardMaterial({color:'#ffe38b',emissive:'#ffc44d',emissiveIntensity:2.5,toneMapped:false});
  materials.mirrorGlow=new THREE.MeshBasicMaterial({color:'#ffd467',transparent:true,opacity:.22,depthWrite:false,toneMapped:false});
  materials.borsok=new THREE.MeshStandardMaterial({color:'#c48b3e',roughness:.85});
  materials.borsokGolden=new THREE.MeshStandardMaterial({color:'#a96a29',roughness:.9});
  materials.porcelain=new THREE.MeshPhysicalMaterial({color:'#f9f7f1',roughness:.2,clearcoat:.45,clearcoatRoughness:.18});
  materials.showerGlass=new THREE.MeshPhysicalMaterial({color:'#d1e5e0',transparent:true,opacity:.15,roughness:.08,metalness:.05,side:THREE.DoubleSide,depthWrite:false});
  materials.glass=new THREE.MeshStandardMaterial({color:'#d6dce0',transparent:true,opacity:.16,roughness:.14,depthWrite:false});
  materials.mirror=new THREE.MeshStandardMaterial({color:'#dedbd2',metalness:.6,roughness:.2});
  materials.bulb=new THREE.MeshStandardMaterial({color:'#fff7e5',emissive:'#ffe2ab',emissiveIntensity:.8});
  materials.screen=new THREE.MeshStandardMaterial({color:'#567b79',emissive:'#537c78',emissiveIntensity:.5});
  if(theme==='wilton'){
    materials.curtain.color.set('#b9b8b3');materials.sheer.color.set('#fafaf6');
    materials.chairFabric.color.set('#486a70');materials.chairStitch.color.set('#739295');
    materials.upholstery.color.set('#c7bcab');materials.sofaAccent.color.set('#6b655d');
    materials.walnut.color.set('#665043');materials.padded.color.set('#9b9b99');
    maps.wiltonFloor=texture('wiltonFloor');maps.wiltonFloor.repeat.set(2,2);
    materials.wiltonFloor=new THREE.MeshStandardMaterial({map:maps.wiltonFloor,roughness:.68});
    for(const [key,color] of Object.entries({charcoal:'#41494e',pearl:'#aca9a2',mocha:'#6d6051'})){
      const cloth=document.createElement('canvas');cloth.width=cloth.height=256;const paint=cloth.getContext('2d');
      paint.fillStyle=color;paint.fillRect(0,0,256,256);paint.fillStyle='#e6e3db';paint.fillRect(0,198,256,58);
      maps[key+'Bedding']=new THREE.CanvasTexture(cloth);maps[key+'Bedding'].colorSpace=THREE.SRGBColorSpace;
      materials[key+'Bedding']=new THREE.MeshPhysicalMaterial({map:maps[key+'Bedding'],roughness:.96,bumpMap:maps.weave,bumpScale:.008,sheen:.3,side:THREE.DoubleSide});
    }
  }
  if(theme==='london'){
    materials.curtain.color.set('#20483c');
    materials.chairFabric.color.set('#666a60');materials.chairStitch.color.set('#777e70');
    materials.sofaAccent.color.set('#496557');materials.oak.color.set('#ad987d');
    maps.londonFloor=texture('londonFloor');maps.londonFloor.repeat.set(2,2);materials.londonFloor=new THREE.MeshStandardMaterial({map:maps.londonFloor,roughness:.72});
    const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
    c.fillStyle='#ece7db';c.fillRect(0,0,256,256);
    for(let y=0;y<256;y+=64)for(let x=0;x<256;x+=64){c.fillStyle=(x+y)%128?'#7c827c':'#5e635e';c.beginPath();c.moveTo(x+32,y+5);c.lineTo(x+59,y+32);c.lineTo(x+32,y+59);c.lineTo(x+5,y+32);c.closePath();c.fill();c.strokeStyle='#f4f0e8';c.lineWidth=3;c.stroke();}
    maps.londonTile=new THREE.CanvasTexture(canvas);maps.londonTile.colorSpace=THREE.SRGBColorSpace;maps.londonTile.wrapS=maps.londonTile.wrapT=THREE.RepeatWrapping;maps.londonTile.repeat.set(2,2);
    materials.londonTile=new THREE.MeshStandardMaterial({map:maps.londonTile,roughness:.55});
    for(const [key,color] of Object.entries({forest:'#285348',rust:'#b7532c',navy:'#364552'})){
      const cloth=document.createElement('canvas');cloth.width=cloth.height=256;const paint=cloth.getContext('2d');paint.fillStyle='#e7e5de';paint.fillRect(0,0,256,256);paint.fillStyle=color;paint.fillRect(0,35,256,95);paint.fillRect(0,140,256,6);maps[key+'Bedding']=new THREE.CanvasTexture(cloth);maps[key+'Bedding'].colorSpace=THREE.SRGBColorSpace;
      materials[key+'Bedding']=new THREE.MeshPhysicalMaterial({map:maps[key+'Bedding'],roughness:.96,bumpMap:maps.weave,bumpScale:.008,sheen:.3,side:THREE.DoubleSide});
    }
  }
  const palette={
    'urpaq-park':{curtain:'#888579',chairFabric:'#707760',padded:'#ada58e',upholstery:'#c5bba7',whiteBedding:'#d9d1bb'},
    hayat:{curtain:'#b5aaa2',chairFabric:'#81665a',padded:'#a5917e',upholstery:'#c8beb3',whiteBedding:'#ded1c3'},
    esentai:{curtain:'#a1a8a7',chairFabric:'#546e62',padded:'#858e8e',upholstery:'#c4c8c2',whiteBedding:'#cfd9d4'},
    tokyo:{curtain:'#7c8177',chairFabric:'#727c69',padded:'#a09c8c',upholstery:'#c6c2b4',whiteBedding:'#d6d7c8'},
    'boston-tower':{curtain:'#87898b',chairFabric:'#7a6354',padded:'#878788',upholstery:'#bbb8b1',whiteBedding:'#d0d0d0'},
  }[theme];
  if(palette)for(const [key,color] of Object.entries(palette))materials[key].color.set(color);
  return {materials,dispose(){Object.values(materials).forEach(m=>m.dispose());Object.values(maps).forEach(t=>t.dispose());}};
}
