import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {messages,languages,validLanguage,translate,formatNumber} from '../src/i18n.js';
import {projects} from '../src/projects.js';
import {layouts} from '../src/layouts/index.js';

test('Russian is the default and only supported language preferences are accepted',()=>{
  for(const value of [null,undefined,'','en','invalid'])assert.equal(validLanguage(value),'ru');
  for(const {id} of languages)assert.equal(validLanguage(id),id);
  assert.equal(translate('Bedrooms'),messages.Bedrooms[0]);
  assert.equal(translate('Bedrooms',{},'en-US'),'Bedrooms');
  assert.equal(formatNumber(52.1,2,'ru'),'52,10');
  assert.equal(formatNumber(52.1,2,'en-US'),'52.10');
  assert.equal(translate('Explore {project}',{project:'Tokyo City'},'ru'),'Открыть Tokyo City');
});

test('every translation has three complete variants and preserves interpolation fields',()=>{
  const fields=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
  for(const [key,variants] of Object.entries(messages)){
    assert.equal(variants.length,3,key);
    for(const value of variants){
      assert.equal(typeof value,'string',key);
      assert(value.trim().length>0,key);
      assert.deepEqual(fields(value),fields(key),key);
    }
  }
});

test('every project, floor-plan, room and guided-tour description is translated',()=>{
  const required=new Set();
  for(const p of projects){
    [p.city,p.type,p.address,p.description].forEach(v=>required.add(v));
    p.plans.forEach(plan=>[plan.name,plan.description].forEach(v=>required.add(v)));
  }
  for(const layout of layouts){
    layout.doors.forEach(door=>required.add(door.name.replace(/ door$/,'')));
    layout.rooms.forEach(r=>[r.name,r.planName,r.subtitle].filter(Boolean).forEach(v=>required.add(v)));
    layout.tourStops.forEach(stop=>[stop.title,stop.description].forEach(v=>required.add(v)));
  }
  for(const key of required)assert(key in messages,`Untranslated data: ${key}`);
});

test('direct translation calls in app components have dictionary entries',async()=>{
  async function sources(dir){
    const entries=await readdir(dir,{withFileTypes:true});
    return (await Promise.all(entries.map(e=>e.isDirectory()?sources(new URL(e.name+'/',dir)):e.name.endsWith('.jsx')?[new URL(e.name,dir)]:[]))).flat();
  }
  for(const file of await sources(new URL('../src/',import.meta.url))){
    const source=await readFile(file,'utf8');
    for(const match of source.matchAll(/\bt\(\s*(['"])((?:\\.|(?!\1)[^\\])*?)\1/g)){
      const key=match[2].replace(/\\(['"\\])/g,'$1');
      assert(key in messages,`${file.pathname}: ${key}`);
    }
  }
});
