// Project identity and imagery: Artwin's project directory, checked 2026-09-13.
// Plan availability describes this interactive collection, not sales inventory.
export const projectSource='https://artwin.kg/#rec596501902';
const tokyoPlans=[
  {id:'two-room-euro-52',name:'Two-room · Euro layout',area:52.10,bedrooms:1,bathrooms:1,viewer:'tokyo-layout',description:'An open kitchen and living room, a private bedroom, a loggia and a separate storage room.'},
  {id:'three-room-euro-70',name:'Three-room · Euro layout',area:70.33,bedrooms:2,bathrooms:2,viewer:'tokyo-layout',description:'Two bedrooms around an open living space, with an en suite, a loggia and useful storage.'},
  {id:'two-room-78',name:'Two-room residence',area:78.83,bedrooms:1,bathrooms:2,viewer:'tokyo-layout',description:'A generous bedroom and separate living room, with a dedicated kitchen, two bathrooms and a kitchen loggia.'},
  {id:'three-room-euro-82',name:'Three-room · Euro layout',area:82.30,bedrooms:2,bathrooms:2,viewer:'tokyo-layout',description:'An open kitchen and living room, two private bedrooms, an en suite and a bright side loggia.'},
  {id:'three-room-106',name:'Three-room residence',area:106.01,bedrooms:2,bathrooms:2,viewer:'tokyo-layout',description:'Living and dining together, a separate kitchen, two bedrooms and a loggia at each end of the apartment.'},
  {id:'four-room-134',name:'Four-room residence',area:134.68,bedrooms:3,bathrooms:3,viewer:'tokyo-four-room',description:'A generous living and dining space, three bedrooms and two loggias. Explore the furnished apartment at your own pace.'},
];
export const projects=[
  {id:'london-square',name:'London Square',city:'Bishkek',address:'Tokombaev / Duisheev',type:'Residential',description:'English-inspired architecture in the upper part of Bishkek.',sourceUrl:'https://artwin.kg/london-square',plans:[]},
  {id:'wilton-park',name:'Wilton Park',city:'Bishkek',address:'Aaly Tokombaev · AUCA district',type:'Residential',description:'European-inspired living near the mountain foothills.',sourceUrl:'https://artwin.kg/wilton',plans:[]},
  {id:'seoul',name:'Seoul',city:'Bishkek',address:'Yunusaliev / Suvanberdiev',type:'Business centre',description:'A contemporary business address in Bishkek.',sourceUrl:'https://artwin.kg/seoul',plans:[]},
  {id:'urpaq-park',name:'Urpaq Park',city:'Bishkek',address:'Baitik Baatyr / Tokombaev',type:'Residential',description:'Green spaces and welcoming courtyards for everyday life.',sourceUrl:'https://artwin.kg/urpaq-park',plans:[]},
  {id:'hayat',name:'Hayat',city:'Bishkek',address:'Suyumbaev / Moskovskaya',type:'Residential',description:'City living close to the Central Mosque.',sourceUrl:'https://artwin.kg/hayat',plans:[]},
  {id:'tokyo-city',name:'Tokyo City',city:'Bishkek',address:'7 April / Isakeev',type:'Residential',description:'Japanese-inspired architecture, landscaped paths and a quieter rhythm of city life.',sourceUrl:'https://artwin.kg/tokyo_city',plans:tokyoPlans},
  {id:'esentai',name:'Esentai',city:'Bishkek',address:'Ch. Valikhanov / Sh. Baatyr',type:'Residential',description:'Colourful architecture and a landscaped neighbourhood courtyard.',sourceUrl:'https://artwin.kg/esentai',plans:[]},
  {id:'tokyo',name:'Tokyo',city:'Bishkek',address:'7 April / M. Gorky',type:'Residential',description:'Eastern-inspired city living near Technopark.',sourceUrl:'https://artwin.kg/tokyo',plans:[]},
  {id:'french-house',name:'French House',nativeName:'Французский дом',city:'Osh',address:'275 Shakirov Street',type:'Residential',description:'A residential address with views towards the embankment.',sourceUrl:'https://artwin.kg/page31314850.html',plans:[]},
  {id:'boston-tower',name:'Boston Tower',city:'Osh',address:'Razzakov Avenue · KhBK district',type:'Residential',description:'A residential tower on Razzakov Avenue.',sourceUrl:'https://artwin.kg/page31279315.html',plans:[]},
];
export const projectImage=project=>`${import.meta.env.BASE_URL}projects/${project.id}.webp`;
export const projectHref=project=>`#/projects/${project.id}`;
export const apartmentHref=(project,plan)=>`${projectHref(project)}/apartments/${plan.id}`;

export function resolveRoute(hash=''){
  const [rawPath,search='']=hash.replace(/^#/, '').split('?');
  const path=rawPath.replace(/\/$/,'');
  if(path==='/finder')return {kind:'finder'};
  if(path==='/shortlist')return {kind:'shortlist',search};
  if(path==='/sales-workspace')return {kind:'workspace'};
  if(!path||path==='/projects')return {kind:'projects'};
  const parts=path.split('/').filter(Boolean);
  if(parts[0]==='consultations'){
    if(parts.length===1)return {kind:'consultations'};
    const project=parts.length===2?projects.find(p=>p.id===parts[1]):null;
    return project?{kind:'consultations',project}:{kind:'missing'};
  }
  if(parts[0]!=='projects')return {kind:'missing'};
  const project=projects.find(p=>p.id===parts[1]);
  if(!project)return {kind:'missing'};
  if(parts.length===2)return {kind:'project',project};
  const plan=parts.length===4&&parts[2]==='apartments'?project.plans.find(p=>p.id===parts[3]):null;
  return plan&&['tokyo-four-room','tokyo-layout'].includes(plan.viewer)?{kind:'apartment',project,plan}:{kind:'missing'};
}
