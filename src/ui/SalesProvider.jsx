import React,{createContext,useContext,useEffect,useState} from 'react';
import {emptySales,safeRead,validateSales} from '../sales.js';
const SalesContext=createContext({data:emptySales,preview:false,failed:false});
export function SalesProvider({children}){
  const [official,setOfficial]=useState(emptySales),[preview,setPreview]=useState(null),[failed,setFailed]=useState(false);
  useEffect(()=>{
    let alive=true;
    fetch(`${import.meta.env.BASE_URL}sales-data.json`).then(r=>{if(!r.ok)throw Error();return r.json();}).then(validateSales).then(data=>{if(alive)setOfficial(data);}).catch(()=>{if(alive)setFailed(true);});
    const sync=()=>{try{const value=safeRead('artwin-inventory-preview',null);setPreview(value?validateSales(value):null);}catch{setPreview(null);}};
    sync();window.addEventListener('artwin-sales-change',sync);window.addEventListener('storage',sync);
    return()=>{alive=false;window.removeEventListener('artwin-sales-change',sync);window.removeEventListener('storage',sync);};
  },[]);
  return <SalesContext.Provider value={{data:preview||official,preview:Boolean(preview),failed}}>{children}</SalesContext.Provider>;
}
export const useSales=()=>useContext(SalesContext);
