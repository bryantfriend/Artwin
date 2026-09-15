import * as THREE from 'three';

// These maps are bundled with the site, never fetched from an asset service at runtime.
export const interiorTextureFiles=['wood-color.jpg','wood-normal.jpg','fabric-normal.jpg','fabric-roughness.jpg'];
export const interiorTextureUrls=interiorTextureFiles.map(file=>`${import.meta.env?.BASE_URL||'/Artwin/'}textures/interiors/${file}`);

export function surfaceMaps(textures){
 const maps={};
 ['timber','timberNormal','fabricNormal','fabricRoughness'].forEach((key,i)=>{
  const map=textures[i].clone();map.colorSpace=i===0?THREE.SRGBColorSpace:THREE.NoColorSpace;
  map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=8;
  map.repeat.set(i>1?2:1,i>1?2:1);map.needsUpdate=true;maps[key]=map;
 });
 // Neutralize the scan's stain so oak and walnut retain the specified finish colors.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
 const context=canvas.getContext('2d');context.drawImage(textures[0].image,0,0,1024,1024);
 const pixels=context.getImageData(0,0,1024,1024);
 for(let i=0;i<pixels.data.length;i+=4){
  const luminance=(pixels.data[i]*.2126+pixels.data[i+1]*.7152+pixels.data[i+2]*.0722)/255;
  const value=Math.min(255,145+Math.sqrt(luminance)*125);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value;
 }
 context.putImageData(pixels,0,0);maps.timber.dispose();maps.timber=new THREE.CanvasTexture(canvas);
 maps.timber.colorSpace=THREE.SRGBColorSpace;maps.timber.wrapS=maps.timber.wrapT=THREE.RepeatWrapping;maps.timber.anisotropy=8;
 return maps;
}

// Soft ambient contact beneath furniture remains available in mobile Light mode.
// A transparent receiver overlay costs one draw, without another shadow camera.
export function contactTexture(){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const context=canvas.getContext('2d'),pixels=context.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const u=Math.abs((x-63.5)/63.5),v=Math.abs((y-63.5)/63.5);
  const r=Math.pow(u**4+v**4,.25),a=Math.max(0,Math.min(1,(1-r)/.48));
  const offset=(y*128+x)*4;pixels.data[offset]=pixels.data[offset+1]=pixels.data[offset+2]=255;
  pixels.data[offset+3]=Math.round(a*a*(3-2*a)*255);
 }
 context.putImageData(pixels,0,0);return new THREE.CanvasTexture(canvas);
}
