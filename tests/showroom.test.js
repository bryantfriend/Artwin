import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {projects,resolveRoute,projectHref,apartmentHref} from '../src/projects.js';
import {routeHref,routeLocation,presentationHref} from '../src/navigation.js';
import {sharedPlans,allPlans,planKey,contextMessage} from '../src/sales.js';
import {pageMetadata} from '../src/pageMetadata.js';
import {projectMedia} from '../src/projectMedia.js';
import {translate} from '../src/i18n.js';

test('every clean apartment link and legacy hash resolves to the same apartment',()=>{
 for(const project of projects){
  assert.equal(resolveRoute(projectHref(project)).project,project);
  for(const plan of project.plans){
   const href=apartmentHref(project,plan);
   assert.equal(resolveRoute(href).plan,plan);
   const hash=href.replace('/Artwin/','#/').replace(/\/$/,'');
   assert.equal(resolveRoute(hash).plan,plan);
   assert.equal(routeHref(hash),href);
  }
 }
 assert.equal(routeHref('/'),'/Artwin/');
 assert.equal(resolveRoute('/Artwin/').kind,'projects');
 assert.equal(routeLocation({pathname:'/Artwin/finder/',search:'',hash:''}),'/finder/');
 assert.equal(routeLocation({pathname:'/Artwin/',search:'?v=old',hash:'#/projects/seoul'}),'#/projects/seoul');
});
test('presentation links share at most three distinct known selections',()=>{
 const keys=allPlans().slice(0,4).map(({project,plan})=>planKey(project,plan));
 const href=presentationHref([keys[0],...keys]);
 const route=resolveRoute(href);
 assert.equal(route.kind,'presentation');
 assert.deepEqual(sharedPlans(route.search),keys.slice(0,3));
 assert.deepEqual(sharedPlans('plans=unknown,https://other.example'),[]);
});
test('public pages have apartment-specific previews and private workspace routes are not indexable',()=>{
 for(const project of projects)for(const plan of project.plans){
  const route=resolveRoute(apartmentHref(project,plan)),meta=pageMetadata(route);
  assert.equal(meta.url,`https://bryantfriend.github.io${apartmentHref(project,plan)}`);
  assert.ok(meta.image.endsWith(`/plans/${plan.id}.png`));
  assert.equal(meta.noindex,false);
  for(const language of ['ru','ky','en-US','zh-CN'])assert.ok(pageMetadata(route,language).description.length>15);
 }
 for(const path of ['/sales-workspace','/presentation','/shortlist'])assert.equal(pageMetadata(resolveRoute(path)).noindex,true);
 assert.equal(pageMetadata(resolveRoute('/finder')).noindex,false);
 assert.ok(pageMetadata(resolveRoute('/projects/seoul'),'en-US').description.includes('business'));
});
test('curated project gallery files exist, are attributed, and have translated captions',async()=>{
 assert.equal(Object.values(projectMedia).flat().length,48);
 for(const project of projects){
  assert.ok(projectMedia[project.id].length>0);
  for(const item of projectMedia[project.id]){
   assert.ok((await readFile(new URL(`../public/gallery/${item.file}`,import.meta.url))).length>1000);
   assert.match(item.source,/^https:\/\//);
   for(const language of ['ru','ky','zh-CN'])assert.notEqual(translate(item.label,{},language),item.label);
  }
 }
});
test('commercial contact text does not ask for an apartment',()=>{
 const message=contextMessage({project:projects.find(p=>p.id==='seoul')},s=>s);
 assert.match(message,/commercial/);
 assert.doesNotMatch(message,/apartment/);
});
