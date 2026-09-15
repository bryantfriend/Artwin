import * as THREE from 'three';

// Four distinct 80 cm marble tiles, with clouded stone and branching gray veins.
export function kitchenMarbleTextures({tiled=true}={}){
  const hash=(x,y,seed)=>{let n=Math.imul(x,374761393)+Math.imul(y,668265263)+seed;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
  const noise=(x,y,seed)=>{
    const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);
    const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed),c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);
    return (a+(b-a)*u)*(1-v)+(c+(d-c)*u)*v;
  };
  const fbm=(x,y,s)=>noise(x,y,s)*.57+noise(x*2,y*2,s+19)*.28+noise(x*4,y*4,s+83)*.15;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d'),pixels=ctx.createImageData(1024,1024);
  for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
    const seed=tiled?47+Math.floor(x/512)*113+Math.floor(y/512)*277:71,nx=tiled?x%512/512:x/1024,ny=tiled?y%512/512:y/1024;
    const cloud=fbm(nx*4,ny*4,seed),warp=fbm(nx*7,ny*7,seed+41);
    const phase=(nx*.55+ny*1.15+fbm(nx*1.6,ny*1.6,seed)*.6+warp*.1)*Math.PI*3;
    const vein=Math.exp(-Math.abs(Math.sin(phase))*24);
    const haze=Math.exp(-Math.abs(Math.sin(phase+.12))*5);
    const fine=Math.exp(-Math.abs(Math.sin(phase*2.1+warp*4))*55)*.22;
    const value=246-cloud*14-(vein*(40+warp*50)+haze*24+fine*30)*(.25+cloud*.9);
    const i=(y*1024+x)*4;pixels.data[i]=value;pixels.data[i+1]=value+.5;pixels.data[i+2]=value-1.5;pixels.data[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);
  const relief=document.createElement('canvas');relief.width=relief.height=1024;const b=relief.getContext('2d');b.fillStyle='#cccccc';b.fillRect(0,0,1024,1024);
  if(tiled)for(const c of [ctx,b]){c.strokeStyle=c===ctx?'#b9b9b2':'#555555';c.lineWidth=2;c.beginPath();for(const n of [0,512,1024]){c.moveTo(n,0);c.lineTo(n,1024);c.moveTo(0,n);c.lineTo(1024,n);}c.stroke();}
  const map=new THREE.CanvasTexture(canvas),bump=new THREE.CanvasTexture(relief);map.colorSpace=THREE.SRGBColorSpace;
  for(const t of [map,bump]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(tiled?2.5:1,tiled?2.5:1);t.anisotropy=8;}
  return {map,bump};
}
