// Original abstract prints and woven patterns, generated locally for this apartment.
import * as THREE from 'three';
export function decorativeTexture(kind,index=0){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=kind==='art'?640:512;
  const c=canvas.getContext('2d'),h=canvas.height;
  c.fillStyle=['#ece2cf','#d8d7cb','#e5d9c7'][index%3];c.fillRect(0,0,512,h);
  if(kind==='art'){
    const palettes=[['#bb7357','#575e50','#b2a08a'],['#6b7c7b','#b9a58b','#444d50'],['#9d7957','#c4b9a2','#666b54']];const p=palettes[index%3];
    c.fillStyle=p[0];c.beginPath();c.arc(345,170,90,0,Math.PI*2);c.fill();
    for(let i=0;i<3;i++){c.fillStyle=p[i];c.beginPath();c.moveTo(0,h);c.lineTo(0,330+i*60);c.bezierCurveTo(180,130+i*110,300,550-i*60,512,320+i*50);c.lineTo(512,h);c.fill();}
    if(index%2){c.strokeStyle='#f3ead9';c.lineWidth=5;for(let i=0;i<6;i++){c.beginPath();c.moveTo(100+i*14,550);c.bezierCurveTo(60+i*10,380,220+i*22,300,170+i*16,100);c.stroke();}}
    if(index===3||index===5){
      c.fillStyle=index===3?'#e4ddce':'#ded7c7';c.fillRect(0,0,512,h);
      c.strokeStyle='#626b50';c.lineWidth=4;
      for(let branch=0;branch<3;branch++){
        const base=140+branch*100;c.beginPath();c.moveTo(base,570);c.bezierCurveTo(base-35,390,base+45,250,base-20,100);c.stroke();
        for(let j=0;j<6;j++){const y=160+j*60,side=j%2?1:-1;c.save();c.translate(base+Math.sin(j)*18,y);c.rotate(side*.6);c.fillStyle=['#637254','#8c9873','#a9b091'][branch];c.beginPath();c.ellipse(side*25,0,38,14,0,0,Math.PI*2);c.fill();c.restore();}
      }
    }
    let seed=123+index;for(let i=0;i<7000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%512;seed=(seed*1664525+1013904223)>>>0;c.fillStyle=i%2?'#ffffff0c':'#15151509';c.fillRect(x,seed%h,1,2);}
  }else{
    c.strokeStyle=index===1?'#8c857466':'#a69a8666';c.lineWidth=3;c.strokeRect(24,24,464,464);c.strokeRect(34,34,444,444);
    c.lineWidth=2;for(let x=-512;x<1024;x+=90){c.beginPath();c.moveTo(x,0);c.lineTo(x+256,256);c.lineTo(x,512);c.stroke();}
    for(let y=0;y<512;y+=3){c.strokeStyle=y%2?'#ffffff18':'#40352813';c.lineWidth=1;c.beginPath();c.moveTo(0,y);c.lineTo(512,y);c.stroke();}
  }
  const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
