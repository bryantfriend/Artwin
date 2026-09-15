import React,{useMemo,useEffect} from 'react';
import {cushionGeometry,cushionSeam} from './upholstery.js';

export default function UpholsteredCushion({size,material,seam=true,...props}){
 const [w,h,d]=size;
 const resources=useMemo(()=>({body:cushionGeometry([w,h,d]),seam:seam?cushionSeam([w,h,d]):null}),[w,h,d,seam]);
 useEffect(()=>()=>{resources.body.dispose();resources.seam?.dispose();},[resources]);
 return <group {...props}><mesh geometry={resources.body} material={material} castShadow receiveShadow/>{resources.seam&&<mesh geometry={resources.seam} material={material}/>}</group>;
}
