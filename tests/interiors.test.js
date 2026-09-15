import test from 'node:test';
import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {layouts} from '../src/layouts/index.js';
import {duvetGeometry,cushionGeometry,cushionSeam} from '../src/scene/upholstery.js';
import {interiorTextureFiles,interiorTextureUrls} from '../src/scene/interiorSurfaces.js';

test('draped bedding clears every catalog mattress and stays within a small overhang',()=>{
 const dimensions=new Map(layouts.flatMap(l=>l.furniture.filter(f=>f.kind==='bed').map(f=>[`${f.size[0]}:${f.size[2]}`,[f.size[0],f.size[2]]])));
 for(const [w,d] of dimensions.values()){
  const geometry=duvetGeometry(w,d),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
   const x=p.getX(i),y=p.getY(i)+.69,z=p.getZ(i)+d*.18;
   assert.ok([x,y,z].every(Number.isFinite));
   assert.ok(Math.abs(x)<=w/2+.106&&z<=d/2+.101);
   if(Math.abs(x)<=w/2&&z<=d/2)assert.ok(y>.615,`Mattress intersection for ${w} x ${d}`);
  }
  geometry.dispose();
 }
});
test('tailored seat and back cushions retain their intended furniture dimensions',()=>{
 for(const size of [[.56,.13,.534],[.8,.46,.18],[.35,.35,.13],[.8,.19,.43]]){
  const body=cushionGeometry(size),seam=cushionSeam(size);
  body.computeBoundingBox();const box=body.boundingBox;
  for(const [i,axis] of ['x','y','z'].entries()){
   assert.ok(box.max[axis]<=size[i]/2+.001);assert.ok(box.min[axis]>=-size[i]/2-.001);
  }
  for(const g of [body,seam]){assert.ok([...g.attributes.position.array,...g.attributes.normal.array].every(Number.isFinite));g.dispose();}
 }
});
test('scanned material assets are local, complete and fit a modest download budget',async()=>{
 let bytes=0;
 for(const [i,file] of interiorTextureFiles.entries()){
  assert.equal(interiorTextureUrls[i],`/Artwin/textures/interiors/${file}`);
  const asset=await stat(new URL(`../public/textures/interiors/${file}`,import.meta.url));
  assert.ok(asset.size>1000);bytes+=asset.size;
 }
 assert.ok(bytes<2_000_000,`Shared material download: ${bytes}`);
});
