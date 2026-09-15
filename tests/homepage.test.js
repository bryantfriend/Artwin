import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolveRoute,projects} from '../src/projects.js';
import {pageMetadata} from '../src/pageMetadata.js';
import {finderPreferences,finderDefaults,projectCity,projectType,homeStories} from '../src/homepage.js';
import {matchPlans} from '../src/sales.js';
import {homeMessages} from '../src/locales/home.js';
import {projectLifestyle} from '../src/projectLifestyle.js';

test('the brand homepage, collection and direct project links remain distinct',()=>{
 for(const path of ['', '/', '#/', '/Artwin/', '/Artwin/?v=release'])assert.equal(resolveRoute(path).kind,'home',path);
 assert.equal(resolveRoute('/projects').kind,'projects');
 assert.equal(resolveRoute('/projects/tokyo-city').project.id,'tokyo-city');
 assert.equal(resolveRoute('#/projects/seoul').project.type,'Business centre');
 assert.equal(pageMetadata(resolveRoute('/')).url,'https://bryantfriend.github.io/Artwin/');
 assert.notEqual(pageMetadata(resolveRoute('/')).url,pageMetadata(resolveRoute('/projects')).url);
 assert.equal(pageMetadata(resolveRoute('/')).noindex,false);
});
test('a homepage search preserves the chosen city and bedrooms and clears stale budget restrictions',()=>{
 const route=resolveRoute('/Artwin/finder/?city=Osh&bedrooms=2');
 const filters=finderPreferences(route.search,{city:'Bishkek',bedrooms:'1',maxArea:20,maxPrice:10});
 assert.deepEqual(filters,{...finderDefaults,city:'Osh',bedrooms:'2'});
 const matches=matchPlans(filters,[]);
 assert.ok(matches.length>0);
 for(const {project,plan} of matches){assert.equal(project.city,'Osh');assert.equal(plan.bedrooms,2);}
 assert.deepEqual(finderPreferences('city=All&bedrooms=',{city:'Osh',maxArea:10}),finderDefaults);
 assert.equal(projectCity(resolveRoute('/projects?city=Osh').search),'Osh');
 assert.equal(projectType(resolveRoute('/projects?city=Bishkek&type=Residential').search),'Residential');
 assert.equal(projectType('type=Business+centre'),'Business centre');
 assert.equal(projectType('type=unknown'),'All');
});
test('invalid query values cannot override finder preferences or become a city filter',()=>{
 const saved={city:'Osh',bedrooms:'1',maxArea:'100'};
 assert.deepEqual(finderPreferences('',saved),{...finderDefaults,...saved});
 assert.deepEqual(finderPreferences('city=https://other.example&bedrooms=-4',saved),{...finderDefaults,...saved});
 assert.equal(projectCity('city=unknown'),'All');
 assert.deepEqual(finderPreferences('',null),finderDefaults);
});
test('homepage lifestyle imagery belongs to the named project and copy is localized',async()=>{
 for(const story of homeStories){
  assert.ok(projects.some(p=>p.id===story.projectId));
  assert.ok(projectLifestyle[story.projectId].some(image=>image.file===story.file));
  assert.ok((await readFile(new URL(`../public/${story.file}`,import.meta.url))).length>1000);
 }
 for(const [key,values] of Object.entries(homeMessages)){
  assert.equal(values.length,3,key);
  for(const text of values){assert.ok(text.length>0);assert.deepEqual([...text.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...key.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),key);}
 }
});
