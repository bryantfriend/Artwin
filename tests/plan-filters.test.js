import assert from 'node:assert/strict';
import test from 'node:test';
import {filterPlans} from '../src/planFilters.js';
import {projects} from '../src/projects.js';

test('area bands include each boundary once and sorting does not mutate the catalog',()=>{
  const plans=Object.freeze([110.01,80,79.99,110].map((area,i)=>Object.freeze({id:String(i),area,bedrooms:2})));
  assert.deepEqual(filterPlans(plans,{area:'small'}).map(p=>p.area),[79.99]);
  assert.deepEqual(filterPlans(plans,{area:'medium'}).map(p=>p.area),[80,110]);
  assert.deepEqual(filterPlans(plans,{area:'large'}).map(p=>p.area),[110.01]);
  assert.deepEqual(filterPlans(plans,{sort:'descending'}).map(p=>p.area),[110.01,110,80,79.99]);
  assert.deepEqual(plans.map(p=>p.area),[110.01,80,79.99,110]);
});

test('bedrooms, saved plans and area filters combine and support empty results',()=>{
  const plans=projects.find(p=>p.id==='tokyo-city').plans;
  assert.equal(filterPlans(plans).length,6);
  assert.deepEqual(filterPlans(plans,{bedrooms:1}).map(p=>p.area),[52.1,78.83]);
  assert.deepEqual(filterPlans(plans,{bedrooms:2,area:'medium',savedOnly:true,saved:['three-room-euro-82','two-room-78','unknown']}).map(p=>p.area),[82.3]);
  assert.deepEqual(filterPlans(plans,{savedOnly:true}),[]);
  assert.deepEqual(filterPlans(plans,{bedrooms:3,area:'small'}),[]);
});
