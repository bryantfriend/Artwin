import * as THREE from 'three';

export const boxGeometry = new THREE.BoxGeometry(1,1,1);
export const sphereGeometry = new THREE.SphereGeometry(1,16,10);
export const cylinderGeometry = new THREE.CylinderGeometry(1,1,1,24);

// Generated once per viewer. Deterministic and entirely local: no image fetches.
function woodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width=256; canvas.height=512;
  const c=canvas.getContext('2d');
  let seed=193;
  const random=()=> { seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
  c.fillStyle='#b99a73'; c.fillRect(0,0,256,512);
  for(let col=0;col<8;col++) {
    c.fillStyle=`hsl(33 28% ${54+random()*14}%)`;
    c.fillRect(col*32,0,31,512);
    for(let i=0;i<90;i++) {
      c.strokeStyle=`rgba(75,49,29,${random()*.13})`;
      c.beginPath(); const x=col*32+random()*31;
      c.moveTo(x,0);c.bezierCurveTo(x+3,150,x-3,350,x,512);c.stroke();
    }
    c.fillStyle='rgba(50,36,24,.25)';
    const offset=col%2 ? 70 : 210;
    c.fillRect(col*32,offset,32,1); c.fillRect(col*32,offset+256,32,1);
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(2,2);
  texture.anisotropy=4;
  return texture;
}
function stoneTexture() {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const c=canvas.getContext('2d'); c.fillStyle='#e5e1d8';c.fillRect(0,0,256,256);
  for(let i=0;i<15;i++) {
    c.strokeStyle=`rgba(104,103,100,${.025+(i%4)*.014})`;
    c.lineWidth=i%3+1;c.beginPath();
    c.moveTo(i*29-100,0);c.bezierCurveTo(i*19,76,i*31-20,165,i*24+100,256);c.stroke();
  }
  c.strokeStyle='#c8c5be';c.lineWidth=1;c.strokeRect(0,0,256,256);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);return texture;
}
export function createMaterials() {
  const wood=woodTexture(), stone=stoneTexture();
  const colors={wall:'#efede7', trim:'#faf8f1', dark:'#343431', walnut:'#574438', oak:'#b79c77', linen:'#e5dfd2', taupe:'#8b7966', sage:'#b3b6a0', metal:'#292c2b', brass:'#a98c55', ceramic:'#f8f6ef', rug:'#c5bca9', leaf:'#566c45', soil:'#433528', black:'#101618', white:'#faf9f5'};
  const materials=Object.fromEntries(Object.entries(colors).map(([key,color])=>[key,new THREE.MeshStandardMaterial({color,roughness:key==='brass'?.32:.8,metalness:key==='brass'?.6:0})]));
  materials.wood=new THREE.MeshStandardMaterial({map:wood,roughness:.65,side:THREE.DoubleSide});
  materials.stone=new THREE.MeshStandardMaterial({map:stone,roughness:.4,side:THREE.DoubleSide});
  materials.glass=new THREE.MeshStandardMaterial({color:'#c2d6d7',transparent:true,opacity:.18,roughness:.14,depthWrite:false});
  materials.mirror=new THREE.MeshStandardMaterial({color:'#9bafb0',metalness:.75,roughness:.18});
  materials.bulb=new THREE.MeshStandardMaterial({color:'#fff1d2',emissive:'#ffe0a3',emissiveIntensity:.8});
  materials.screen=new THREE.MeshStandardMaterial({color:'#567b79',emissive:'#537c78',emissiveIntensity:.5});
  return {materials,dispose(){Object.values(materials).forEach(m=>m.dispose());wood.dispose();stone.dispose();}};
}
