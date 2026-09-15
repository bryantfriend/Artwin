import {translate} from './i18n.js';

// Public 2GIS web links work without an API key or loading a third-party map.
// Use Russian address/search terms independently of the interface language,
// so switching to Chinese or English does not change the local place lookup.
export const neighbourhoodCategories=[
 {id:'schools',label:'Schools',query:'Школы',icon:'school'},
 {id:'parks',label:'Parks',query:'Парки',icon:'park'},
 {id:'clinics',label:'Clinics',query:'Клиники',icon:'clinic'},
 {id:'shops',label:'Shops',query:'Магазины',icon:'shop'},
 {id:'transport',label:'Public transport',query:'Остановки общественного транспорта',icon:'bus'},
];
const cityPath=project=>project.city==='Osh'?'osh':'bishkek';
const searchHref=(project,query)=>`https://2gis.kg/${cityPath(project)}/search/${encodeURIComponent(query)}`;
export function projectMapHref(project){
 const type=project.type==='Business centre'?'бизнес-центр':'жилой комплекс';
 return searchHref(project,`${project.nativeName||project.name} ${type}`);
}
export function nearbyMapHref(project,categoryId){
 const category=neighbourhoodCategories.find(item=>item.id===categoryId);
 if(!category)return projectMapHref(project);
 return searchHref(project,`${category.query} ${translate(project.address,{},'ru')}`);
}
