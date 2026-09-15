import * as THREE from 'three';

// All coordinates are in metres, so the seam and folds keep their scale on small chairs.
export function cushionGeometry(size){
 const geometry=new THREE.SphereGeometry(1,32,20),p=geometry.attributes.position;
 const thin=size.indexOf(Math.min(...size));
 for(let i=0;i<p.count;i++){
  const original=[p.getX(i),p.getY(i),p.getZ(i)];
  const v=original.map((n,axis)=>Math.sign(n)*Math.pow(Math.abs(n),axis===thin?.64:.38)*size[axis]/2);
  const edge=1-Math.abs(original[thin]);
  // Small tension creases gather at the sewn perimeter rather than covering the face.
  v[thin]*=1-.035*Math.sin(original[(thin+1)%3]*29+original[(thin+2)%3]*17)*edge**3;
  p.setXYZ(i,...v);
 }
 geometry.computeVertexNormals();return geometry;
}
export function cushionSeam(size){
 const thin=size.indexOf(Math.min(...size)),axes=[0,1,2].filter(i=>i!==thin),points=[];
 for(let i=0;i<80;i++){
  const a=i/80*Math.PI*2,v=[0,0,0];
  v[axes[0]]=Math.sign(Math.cos(a))*Math.abs(Math.cos(a))**.38*size[axes[0]]*.497;
  v[axes[1]]=Math.sign(Math.sin(a))*Math.abs(Math.sin(a))**.38*size[axes[1]]*.497;
  points.push(new THREE.Vector3(...v));
 }
 return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true),80,.0018,4,true);
}
export function duvetGeometry(width,depth){
 const geometry=new THREE.PlaneGeometry(width+.42,depth*.82,64,52);geometry.rotateX(-Math.PI/2);
 const p=geometry.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),z=p.getZ(i),side=Math.max(0,(Math.abs(x)-width/2)/.21);
  const foot=Math.max(0,(z+depth*.18-depth/2)/(depth*.09));
  const fold=.015*Math.sin(x*9+z*3.2)+.009*Math.sin(x*17-z*5)+.006*Math.cos(z*24+x*4);
  const loft=.016*Math.cos(x/width*Math.PI)*Math.cos(z/depth*Math.PI);
  if(side>0)p.setX(i,Math.sign(x)*(width/2+.105*Math.sin(side*Math.PI/2)));
  if(foot>0)p.setZ(i,depth*.32+.10*Math.sin(foot*Math.PI/2));
  p.setY(i,fold+loft-.27*Math.max(side**1.6,foot**1.6));
 }
 geometry.computeVertexNormals();return geometry;
}
