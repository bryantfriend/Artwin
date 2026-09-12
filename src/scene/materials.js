import * as THREE from 'three';
import { decorativeTexture } from './decorativeTextures.js';
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
  if(kind==='wood') {
    c.fillStyle='#d5c7b2';c.fillRect(0,0,512,1024);
    const palette=['#d9cbb6','#c6ad8e','#bea07b','#e0d5c4','#d2bda0','#b79a78'];
    for(let col=0;col<8;col++) {
      for(let row=-1;row<3;row++) {c.fillStyle=palette[Math.floor(random()*palette.length)];c.fillRect(col*64+1,row*430+(col%3)*130,63,429);}
      for(let i=0;i<100;i++){const x=col*64+random()*63;c.strokeStyle=`rgba(66,43,25,${random()*.10})`;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+5,300,x-5,700,x,1024);c.stroke();}
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
export function createMaterials(){
  const maps={wood:texture('wood'),stone:texture('stone'),darkMarble:texture('darkMarble'),weave:weaveTexture(),brownBedding:stripeTexture(),whiteBedding:stripeTexture(true)};
  const colors={wall:'#f1f1ef',trim:'#ffffff',dark:'#363638',walnut:'#4b3527',oak:'#b89c7c',linen:'#d3d0c9',taupe:'#857767',sage:'#a8a698',metal:'#292b2c',brass:'#bd9553',ceramic:'#fafaf7',rug:'#d4d0c7',leaf:'#3d4737',soil:'#433528',black:'#141416',white:'#fafaf7',curtain:'#92918d',caramel:'#9c7257',padded:'#adaeaa',pink:'#d4969f'};
  const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='brass'?.3:.82,metalness:k==='brass'?.65:0})]));
  for(const k of ['wood','stone','darkMarble'])materials[k]=new THREE.MeshPhysicalMaterial({map:maps[k],roughness:k==='wood'?.52:.26,clearcoat:k==='wood'?.12:.3,clearcoatRoughness:.3,side:THREE.DoubleSide});
  for(const k of ['linen','taupe','padded','rug','curtain','caramel']){materials[k].bumpMap=maps.weave;materials[k].bumpScale=k==='rug'?.022:.008;materials[k].roughness=.92;}
  for(const k of ['brownBedding','whiteBedding'])materials[k]=new THREE.MeshPhysicalMaterial({map:maps[k],roughness:.98,bumpMap:maps.weave,bumpScale:.01,sheen:.45,side:THREE.DoubleSide});
  for(let i=0;i<6;i++){maps['art'+i]=decorativeTexture('art',i);materials['art'+i]=new THREE.MeshStandardMaterial({map:maps['art'+i],roughness:1});}
  for(let i=0;i<3;i++){maps['carpet'+i]=decorativeTexture('rug',i);materials['carpet'+i]=new THREE.MeshStandardMaterial({map:maps['carpet'+i],bumpMap:maps.weave,bumpScale:.018,roughness:1});}
  materials.sheer=new THREE.MeshStandardMaterial({color:'#f6f1e7',transparent:true,opacity:.38,roughness:1,side:THREE.DoubleSide,depthWrite:false});
  materials.terracotta=new THREE.MeshStandardMaterial({color:'#ac6d50',roughness:.9});
  materials.curtain.side=THREE.DoubleSide;
  materials.upholstery=new THREE.MeshPhysicalMaterial({color:'#ece8df',roughness:.93,bumpMap:maps.weave,bumpScale:.008,sheen:.4,sheenColor:'#fff8ed'});
  materials.glass=new THREE.MeshStandardMaterial({color:'#d6dce0',transparent:true,opacity:.16,roughness:.14,depthWrite:false});
  materials.mirror=new THREE.MeshStandardMaterial({color:'#dedbd2',metalness:.6,roughness:.2});
  materials.bulb=new THREE.MeshStandardMaterial({color:'#fff7e5',emissive:'#ffe2ab',emissiveIntensity:.8});
  materials.screen=new THREE.MeshStandardMaterial({color:'#567b79',emissive:'#537c78',emissiveIntensity:.5});
  return {materials,dispose(){Object.values(materials).forEach(m=>m.dispose());Object.values(maps).forEach(t=>t.dispose());}};
}
