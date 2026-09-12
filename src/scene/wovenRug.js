import * as THREE from 'three';

// Six broad flat-knit fields separated by denser raised cable bands.
export function rugBand(u){
  const phase=((u*6)%1+1)%1;
  return Math.pow(Math.max(0,1-Math.abs(phase-.5)/.12),.65);
}
export function wovenRugTextures(){
  const color=document.createElement('canvas'),height=document.createElement('canvas');
  color.width=height.width=1024;color.height=height.height=1024;
  const c=color.getContext('2d'),b=height.getContext('2d');
  c.fillStyle='#8e8d85';c.fillRect(0,0,1024,1024);b.fillStyle='#484848';b.fillRect(0,0,1024,1024);
  let seed=731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let x=0;x<1024;x+=5){
    const band=rugBand(x/1024),step=band>.1?10:7;
    for(let y=-10;y<1034;y+=step){
      const yy=y+(x%10?step/2:0),shade=Math.floor(143+random()*35-band*42);
      // Paired yarn loops make a knitted V instead of a printed stripe.
      for(const side of [-1,1]){
        const curve=ctx=>{ctx.beginPath();ctx.moveTo(x+side*2.1,yy);ctx.bezierCurveTo(x+side*3,yy+step*.42,x+side*.6,yy+step*.7,x,yy+step*.86);};
        curve(c);c.strokeStyle='#62645e';c.lineWidth=3.5;c.stroke();
        curve(c);c.strokeStyle=`rgb(${shade+5},${shade+4},${shade-3})`;c.lineWidth=2.1;c.stroke();
        curve(b);const value=Math.round(145+band*60);b.strokeStyle=`rgb(${value},${value},${value})`;b.lineWidth=2.7;b.stroke();
      }
    }
  }
  const map=new THREE.CanvasTexture(color);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
  const bump=new THREE.CanvasTexture(height);bump.anisotropy=8;
  return {map,bump};
}
