import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {calculatePayment,validateSales,emptySales,matchPlans,sharedPlans,contextMessage,whatsappHref,track} from '../src/sales.js';
import {resolveRoute,projects} from '../src/projects.js';
import {furnitureFits} from '../src/spacePlanning.js';
import {messages,translate} from '../src/i18n.js';
import {projectDetails} from '../src/projectDetails.js';
const unit={id:'test-only',projectId:'tokyo-city',building:'TEST',floor:4,number:'TEST-4',planId:'two-room-euro-52',price:6000000,currency:'KGS',status:'available',updatedAt:'2026-09-14',orientation:'S',handover:null};
const dataset={...emptySales,updatedAt:'2026-09-14',units:[unit]};
test('payment estimates handle cash, installments, interest and invalid input',()=>{
 assert.deepEqual(calculatePayment({price:6000000,deposit:1800000,months:24}),{balance:4200000,monthly:175000,total:6000000,interest:0});
 assert.equal(calculatePayment({price:100,deposit:100,months:24}).monthly,0);
 const loan=calculatePayment({price:100000,deposit:0,months:12,annualRate:12});
 assert(Math.abs(loan.monthly-8884.8788678)<.01);assert(Math.abs(loan.total-106618.5464)<.01);
 for(const changes of [{price:0},{price:Infinity},{deposit:-1},{deposit:101},{months:0},{months:1.5},{months:361},{annualRate:-1},{annualRate:NaN}])assert.equal(calculatePayment({price:100,deposit:0,months:12,...changes}),null);
});
test('inventory import validates identity, prices, links, language and dates without inventing units',async()=>{
 assert.deepEqual(validateSales(dataset),dataset);
 for(const change of [{projectId:'missing'},{planId:'wrong-plan'},{price:-1},{price:'6000000'},{status:'fake'},{floor:4.5},{updatedAt:'2026-02-31'},{orientation:'sunset'},{currency:'EUR'}])assert.throws(()=>validateSales({...dataset,units:[{...unit,...change}]}));
 assert.throws(()=>validateSales({...dataset,units:[unit,unit]}));
 assert.throws(()=>validateSales({...dataset,documents:[{projectId:'tokyo-city',date:'2026-09-14',url:'javascript:alert(1)',title:{ru:'x',ky:'x','en-US':'x','zh-CN':'x'}}]}));
 assert.deepEqual(validateSales(JSON.parse(await readFile(new URL('../public/sales-data.json',import.meta.url)))),emptySales);
});
test('matching never treats unpriced, reserved or wrong-currency units as affordable',()=>{
 assert.equal(matchPlans({bedrooms:1}).length,4);
 assert.equal(matchPlans({city:'Osh'}).length,0);
 assert(matchPlans({maxPrice:7000000}).every(r=>r.budget==='unknown'));
 assert.equal(matchPlans({maxPrice:7000000},[unit])[0].budget,'match');
 assert(!matchPlans({maxPrice:5000000},[unit]).some(r=>r.plan.id===unit.planId));
 for(const change of [{price:null},{status:'sold'},{status:'reserved'},{currency:'USD'}])assert.equal(matchPlans({maxPrice:7000000},[{...unit,...change}]).find(r=>r.plan.id===unit.planId).budget,'unknown');
 assert.equal(matchPlans({monthly:175000,deposit:1800000,months:24},[unit])[0].budget,'match');
});
test('share routing accepts only known plan identities and omits arbitrary values',()=>{
 const search='plans=tokyo-city:two-room-euro-52,tokyo-city:two-room-euro-52,evil:plan,hello%3Cscript%3E';
 assert.deepEqual(sharedPlans(search),['tokyo-city:two-room-euro-52']);
 assert.equal(resolveRoute('#/shortlist?'+search).kind,'shortlist');
 assert.equal(resolveRoute('#/finder').kind,'finder');
 assert.equal(resolveRoute('#/sales-workspace').kind,'workspace');
 assert.equal(resolveRoute('#/projects/tokyo-city/apartments/two-room-euro-52?x=y').kind,'apartment');
});
test('WhatsApp summaries preserve selection and escape user text as data',()=>{
 globalThis.window={location:{href:'https://bryantfriend.github.io/Artwin/?private=hidden#/projects'}};
 const project=projects.find(p=>p.id==='tokyo-city'),plan=project.plans[0];
 const text=contextMessage({project,plan,note:'a & b? #note',unit,payment:{currency:'KGS',price:6000000,deposit:1800000,months:24}},key=>key);
 assert(text.includes('52.10'));assert(text.includes('TEST-4'));assert(!text.includes('private=hidden'));
 const url=new URL(whatsappHref(text));assert.equal(url.origin,'https://wa.me');assert.equal(url.searchParams.get('text'),text);
 delete globalThis.window;
});
test('local measurement is opt-in and excludes personal information',()=>{
 const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};globalThis.window={dispatchEvent:()=>{}};
 track('plan_view');assert.equal(storage.has('artwin-events'),false);
 storage.set('artwin-measurement','true');track('plan_view',{projectId:'tokyo-city',planId:'two-room-euro-52',phone:'secret',note:'secret',price:3});
 const events=JSON.parse(storage.get('artwin-events'));assert.equal(events.length,1);assert.deepEqual(Object.keys(events[0]).sort(),['at','event','planId','projectId']);
 track('sale_completed');assert.equal(JSON.parse(storage.get('artwin-events')).length,1);
 delete globalThis.localStorage;delete globalThis.window;
});
test('furniture fitting rejects oversized and concave-boundary footprints',()=>{
 const box=[[0,0],[4,0],[4,4],[0,4]],l=[[0,0],[4,0],[4,1],[1,1],[1,4],[0,4]];
 assert(furnitureFits(box,[2,2],2,.9));assert(!furnitureFits(box,[.1,.1],2,.9));assert(!furnitureFits(box,[2,2],0,1));assert(!furnitureFits(l,[2,2],2,2));
});
test('project facts and buyer dynamic labels have all four language variants',()=>{
 for(const p of Object.values(projectDetails))for(const key of [...p.features,...p.documents])assert(key in messages,key);
 for(const key of ['Available apartments','Plan payments','Discuss my selection','Furniture planner','Reserved','Sold','Office visit','Property visit','Video consultation','Installments','Trade-in','Your home','Your budget','Your estimated trade-in and cash contribution','Direction NW'])for(const locale of ['ru','ky','zh-CN'])assert.notEqual(translate(key,{},locale),key);
});
