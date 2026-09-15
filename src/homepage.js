import {projects} from './projects.js';

export const finderDefaults={city:'All',bedrooms:'',maxArea:'',maxPrice:'',deposit:'',monthly:'',months:24,currency:'KGS'};
export const bedroomChoices=[...new Set(projects.flatMap(p=>p.plans.map(plan=>plan.bedrooms)))].sort((a,b)=>a-b);
export const projectCity=search=>{
 const city=new URLSearchParams(search).get('city');
 return ['Bishkek','Osh'].includes(city)?city:'All';
};
export const projectType=search=>{
 const type=new URLSearchParams(search).get('type');
 return ['Residential','Business centre'].includes(type)?type:'All';
};
// A new homepage search starts with its stated preferences, without quietly
// inheriting an old budget or area limit. Direct finder visits retain saved choices.
export function finderPreferences(search='',saved={}){
 const params=new URLSearchParams(search),query={};
 if(['All','Bishkek','Osh'].includes(params.get('city')))query.city=params.get('city');
 const bedrooms=params.get('bedrooms');
 if(bedrooms!==null&&(bedrooms===''||bedroomChoices.map(String).includes(bedrooms)))query.bedrooms=bedrooms;
 return Object.keys(query).length?{...finderDefaults,...query}:{...finderDefaults,...(saved&&typeof saved==='object'&&!Array.isArray(saved)?saved:{})};
}
export const homeStories=[
 {projectId:'london-square',file:'gallery/london-square-4-6.webp',title:'Space to slow down',description:'Step outside into the landscaped courtyard at London Square.'},
 {projectId:'wilton-park',file:'gallery/wilton-park-6-2.webp',title:'Room for your everyday',description:'Discover the library and shared spaces at Wilton Park.'},
 {projectId:'tokyo-city',file:'gallery/tokyo-city-11-0.webp',title:'A little more adventure',description:'Explore the play spaces and courtyard at Tokyo City.'},
];
