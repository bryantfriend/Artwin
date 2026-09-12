import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export const boxGeometry=new THREE.BoxGeometry(1,1,1);
export const roundedGeometry=new RoundedBoxGeometry(1,1,1,3,.09);
export const sphereGeometry=new THREE.SphereGeometry(1,20,12);
export const cylinderGeometry=new THREE.CylinderGeometry(1,1,1,40);
export const ringGeometry=new THREE.TorusGeometry(1,.045,8,48);
function texture(kind) {
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=1024;
  const c=canvas.getContext('2d');let seed=193;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  if(kind==='wood') {
    c.fillStyle='#d5c7b2';c.fillRect(0,0,512,1024);
    const palette=['#e5ddcb','#c5aa87','#b89064','#ece9e1','#d2c2a9','#ac835d'];
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
export function createMaterials(){
  const maps={wood:texture('wood'),stone:texture('stone'),darkMarble:texture('darkMarble')};
  const colors={wall:'#f1f1ef',trim:'#ffffff',dark:'#363638',walnut:'#4b3527',oak:'#b89c7c',linen:'#d3d0c9',taupe:'#857767',sage:'#a8a698',metal:'#292b2c',brass:'#bd9553',ceramic:'#fafaf7',rug:'#d4d0c7',leaf:'#3d4737',soil:'#433528',black:'#141416',white:'#fafaf7',curtain:'#92918d',caramel:'#9c7257',padded:'#adaeaa',pink:'#d4969f'};
  const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,roughness:k==='brass'?.3:.82,metalness:k==='brass'?.65:0})]));
  for(const [k,map]of Object.entries(maps))materials[k]=new THREE.MeshStandardMaterial({map,roughness:k==='wood'?.65:.35,side:THREE.DoubleSide});
  materials.glass=new THREE.MeshStandardMaterial({color:'#d6dce0',transparent:true,opacity:.16,roughness:.14,depthWrite:false});
  materials.mirror=new THREE.MeshStandardMaterial({color:'#dedbd2',metalness:.6,roughness:.2});
  materials.bulb=new THREE.MeshStandardMaterial({color:'#fff7e5',emissive:'#ffe2ab',emissiveIntensity:.8});
  materials.screen=new THREE.MeshStandardMaterial({color:'#567b79',emissive:'#537c78',emissiveIntensity:.5});
  return {materials,dispose(){Object.values(materials).forEach(m=>m.dispose());Object.values(maps).forEach(t=>t.dispose());}};
}
