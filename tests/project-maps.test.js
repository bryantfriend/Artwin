import test from 'node:test';
import assert from 'node:assert/strict';
import {projects} from '../src/projects.js';
import {projectMapHref,nearbyMapHref,neighbourhoodCategories} from '../src/projectMaps.js';
import {setLanguage,translate} from '../src/i18n.js';

test('2GIS project links choose the correct city and retain project identity',()=>{
 for(const project of projects){
  const url=new URL(projectMapHref(project));
  assert.equal(url.origin,'https://2gis.kg');
  assert.equal(url.pathname.split('/')[1],project.city==='Osh'?'osh':'bishkek');
  const query=decodeURIComponent(url.pathname.split('/search/')[1]);
  assert.ok(query.includes(project.nativeName||project.name));
  assert.ok(query.includes(project.id==='seoul'?'бизнес-центр':'жилой комплекс'));
 }
});

test('nearby links retain the local address when the interface language changes',()=>{
 try{
  for(const project of projects)for(const category of neighbourhoodCategories){
   const expected=nearbyMapHref(project,category.id);
   for(const language of ['ru','ky','en-US','zh-CN']){
    setLanguage(language);
    assert.equal(nearbyMapHref(project,category.id),expected);
   }
   const decoded=decodeURIComponent(expected);
   assert.ok(decoded.includes(category.query));
   assert.ok(decoded.includes(translate(project.address,{},'ru')));
  }
 }finally{setLanguage('ru');}
});

test('unknown categories fall back to the project lookup',()=>{
 const project=projects[0];
 assert.equal(nearbyMapHref(project,'unknown'),projectMapHref(project));
});
