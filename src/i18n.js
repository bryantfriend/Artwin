import {catalogMessages} from './locales/catalog.js';
import {showroomMessages} from './locales/showroom.js';
import {useSyncExternalStore} from 'react';
import {uiMessages} from './locales/ui.js';
import {dataMessages} from './locales/data.js';
import {viewerMessages} from './locales/viewer.js';
import {buyerMessages} from './locales/buyer.js';
import {londonMessages} from './locales/london.js';
import {wiltonMessages} from './locales/wilton.js';

export const languages=[{id:'ru',label:'Русский',short:'RU'},{id:'ky',label:'Кыргызча',short:'KY'},{id:'en-US',label:'English (US)',short:'EN'},{id:'zh-CN',label:'中文',short:'中文'}];
export const messages={...uiMessages,...dataMessages,...viewerMessages,...buyerMessages,...londonMessages,...wiltonMessages,...catalogMessages,...showroomMessages};
export function validLanguage(value){return languages.some(l=>l.id===value)?value:'ru';}
let language='ru';
try{language=validLanguage(localStorage.getItem('artwin-language'));}catch{/* Storage is optional. */}
const listeners=new Set();
export function setLanguage(value){
  language=validLanguage(value);
  try{localStorage.setItem('artwin-language',language);}catch{/* Storage is optional. */}
  if(typeof document!=='undefined')document.documentElement.lang=language;
  listeners.forEach(fn=>fn());
}
export function translate(key,params={},locale=language){
  const index={ru:0,ky:1,'zh-CN':2}[locale];
  const value=locale==='en-US'?key:messages[key]?.[index]??key;
  return String(value).replace(/\{(\w+)\}/g,(_,name)=>params[name]??`{${name}}`);
}
export function formatNumber(value,digits=0,locale=language){return new Intl.NumberFormat(locale,{minimumFractionDigits:digits,maximumFractionDigits:digits}).format(Number(value));}
const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
export function useI18n(){useSyncExternalStore(subscribe,()=>language,()=> 'ru');return {t:translate,language,setLanguage,number:formatNumber};}
setLanguage(language);
