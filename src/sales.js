import {routeHref} from './navigation.js';
import {projects,apartmentHref} from './projects.js';

export const emptySales={version:1,updatedAt:null,units:[],milestones:[],documents:[]};
export const allPlans=()=>projects.flatMap(project=>project.plans.map(plan=>({project,plan})));
export const planKey=(project,plan)=>`${project.id}:${plan.id}`;
export const resolvePlan=key=>allPlans().find(({project,plan})=>planKey(project,plan)===key);
export const safeRead=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
export function safeWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new Event('artwin-sales-change'));return true;}catch{return false;}}
export function sharedPlans(search=''){return [...new Set(new URLSearchParams(search).get('plans')?.split(',')||[])].filter(resolvePlan).slice(0,12);}
export function shortlistUrl(keys){const url=new URL(window.location.href);return new URL(routeHref(`/shortlist?${new URLSearchParams({plans:keys.filter(resolvePlan).slice(0,12).join(',')})}`),url.origin).href;}
export function readSaved(){const raw=safeRead('artwin-saved-plans',[]);return Array.isArray(raw)?[...new Set(raw.filter(id=>typeof id==='string'))]:[];}
export function savedKeys(){return allPlans().filter(({plan})=>readSaved().includes(plan.id)).map(({project,plan})=>planKey(project,plan));}
export function calculatePayment({price,deposit,months,annualRate=0}){
  if(![price,deposit,months,annualRate].every(v=>Number.isFinite(v))||price<=0||price>1e12||deposit<0||deposit>price||!Number.isInteger(months)||months<1||months>360||annualRate<0||annualRate>100)return null;
  const balance=price-deposit,rate=annualRate/1200;
  const monthly=balance===0?0:rate?balance*rate/(1-Math.pow(1+rate,-months)):balance/months;
  return {balance,monthly,total:deposit+monthly*months,interest:monthly*months-balance};
}
const text=(v,max=160)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&new Date(v).toISOString().startsWith(v);
const officialUrl=v=>{try{const url=new URL(v);return url.protocol==='https:'&&(url.hostname==='artwin.kg'||url.hostname.endsWith('.artwin.kg'));}catch{return false;}};
export function validateSales(data){
  if(!data||data.version!==1||!Array.isArray(data.units)||!Array.isArray(data.milestones)||!Array.isArray(data.documents)||data.units.length>5000||data.milestones.length>500||data.documents.length>500)throw Error('Invalid inventory file');
  if(data.updatedAt!==null&&!date(data.updatedAt))throw Error('Invalid inventory date');
  const ids=new Set();
  for(const u of data.units){
    const project=projects.find(p=>p.id===u.projectId);
    if(!project||!text(u.id,80)||ids.has(u.id)||!text(u.building,80)||!text(u.number,30)||!Number.isInteger(u.floor)||u.floor<0||u.floor>200||!['available','reserved','sold'].includes(u.status)||!['KGS','USD'].includes(u.currency)||!(u.price===null||(Number.isFinite(u.price)&&u.price>0&&u.price<=1e12))||!(u.planId===null||project.plans.some(p=>p.id===u.planId))||!date(u.updatedAt)||!['N','NE','E','SE','S','SW','W','NW',null].includes(u.orientation)||!(u.handover===null||date(u.handover)))throw Error('Invalid apartment record');
    ids.add(u.id);
  }
  for(const key of ['milestones','documents'])for(const item of data[key]){
    if(!projects.some(p=>p.id===item.projectId)||!date(item.date)||!officialUrl(item.url)||!item.title||!['ru','ky','en-US','zh-CN'].every(l=>text(item.title[l],300)))throw Error('Invalid project record');
  }
  return {version:1,updatedAt:data.updatedAt,units:data.units.map(u=>Object.fromEntries(['id','projectId','building','number','floor','status','currency','price','planId','updatedAt','orientation','handover'].map(k=>[k,u[k]]))),milestones:data.milestones.map(cleanRecord),documents:data.documents.map(cleanRecord)};
}
function cleanRecord(r){return {projectId:r.projectId,date:r.date,url:r.url,title:Object.fromEntries(['ru','ky','en-US','zh-CN'].map(l=>[l,r.title[l]]))};}
export function matchPlans({city='All',bedrooms='',maxArea='',maxPrice='',deposit='',monthly='',months=24,currency='KGS'},units=[]){
  return allPlans().filter(({project,plan})=>(city==='All'||city===project.city)&&(bedrooms===''||bedrooms==null||plan.bedrooms===Number(bedrooms))&&(!maxArea||plan.area<=Number(maxArea))).map(({project,plan})=>{
    const live=units.filter(u=>u.projectId===project.id&&u.planId===plan.id&&u.status==='available'&&u.currency===currency&&u.price!==null);
    const matching=live.filter(u=>(!maxPrice||u.price<=Number(maxPrice))&&(!monthly||calculatePayment({price:u.price,deposit:Number(deposit),months:Number(months)})?.monthly<=Number(monthly)));
    const constrained=Boolean(maxPrice||monthly);
    return {project,plan,matching,budget:constrained?(live.length?(matching.length?'match':'over'):'unknown'):'none'};
  }).filter(r=>r.budget!=='over').sort((a,b)=>(a.budget==='match'?0:1)-(b.budget==='match'?0:1)||a.plan.area-b.plan.area);
}
export function contextMessage({project,plan,unit,keys=[],payment,note='',visit},t){
  const lines=[t(project?.type==='Business centre'?'Hello Artwin, I would like to discuss a commercial space.':'Hello Artwin, I would like to discuss an apartment.')];
  if(project)lines.push(project.name);
  if(plan)lines.push(`${t(plan.name)} · ${plan.area.toFixed(2)} ${t('m²')}`);
  if(unit)lines.push(`${t('Building')}: ${unit.building} · ${t('Floor')}: ${unit.floor} · ${t('Apartment')}: ${unit.number}`);
  if(payment){
    lines.push(`${t('My payment scenario')}: ${payment.currency} ${payment.price}; ${t('Down payment')}: ${payment.deposit}`);
    if(payment.mode==='cash')lines.push(t('Cash payment'));
    else lines.push(`${t(payment.mode==='trade'?'Trade-in':'Installments')} · ${t('Months')}: ${payment.months}; ${t('Annual interest assumption (%)')}: ${payment.annualRate||0}`);
  }
  for(const key of keys.slice(0,6)){const r=resolvePlan(key);if(r)lines.push(`${r.project.name} · ${r.plan.area.toFixed(2)} ${t('m²')}`);}
  if(visit)lines.push(`${t('Preferred appointment')}: ${visit}`);
  if(note.trim())lines.push(note.trim().slice(0,500));
  if(project&&plan){lines.push(new URL(apartmentHref(project,plan),window.location.href).href);}
  return lines.join('\n');
}
export const whatsappHref=message=>`https://wa.me/996228880000?text=${encodeURIComponent(message)}`;
export function track(event,context={}){
  if(safeRead('artwin-measurement',false)!==true)return;
  const allowed=['home_view','home_search_started','project_view','plan_view','finder_used','payment_calculated','shortlist_saved','whatsapp_opened','booking_opened'];
  if(!allowed.includes(event))return;
  const events=safeRead('artwin-events',[]);
  const row={event,at:new Date().toISOString(),projectId:projects.some(p=>p.id===context.projectId)?context.projectId:null,planId:allPlans().some(r=>r.plan.id===context.planId)?context.planId:null};
  safeWrite('artwin-events',[...(Array.isArray(events)?events:[]).slice(-999),row]);
}
export function downloadJson(name,data){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function copyText(value){try{await navigator.clipboard.writeText(value);return true;}catch{return false;}}
