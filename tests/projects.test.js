import assert from 'node:assert/strict';
import test from 'node:test';
import {projects,resolveRoute,projectHref,apartmentHref} from '../src/projects.js';

test('collection routes expose the listed projects without inventing apartment availability',()=>{
  assert.equal(projects.length,10);
  assert.equal(new Set(projects.map(p=>p.id)).size,10);
  assert.equal(projects.filter(p=>p.plans.length).length,1);
  assert.equal(resolveRoute('').kind,'projects');
  assert.equal(resolveRoute('#/projects').kind,'projects');
  for(const project of projects)assert.equal(resolveRoute(projectHref(project)).project,project);
  const tokyo=projects.find(p=>p.id==='tokyo-city');
  assert.equal(resolveRoute(apartmentHref(tokyo,tokyo.plans[0])).plan,tokyo.plans[0]);
});
test('unavailable or malformed routes cannot open the Tokyo apartment under another project',()=>{
  for(const path of ['#/projects/no-such-project','#/projects/tokyo/apartments/four-room-134','#/projects/seoul/apartments/four-room-134','#/projects/tokyo-city/apartments/missing','#/projects/tokyo-city/extra','#/projects/tokyo-city/apartments/four-room-134/extra','#/%E0%A4%A'])assert.equal(resolveRoute(path).kind,'missing',path);
});

test('consultations support every project and reject missing or malformed project links',()=>{
  assert.equal(resolveRoute('#/consultations').kind,'consultations');
  for(const project of projects)assert.deepEqual(resolveRoute(`#/consultations/${project.id}`),{kind:'consultations',project});
  for(const path of ['#/consultations/unknown','#/consultations/tokyo-city/extra','#/consultations/%E0%A4%A'])assert.equal(resolveRoute(path).kind,'missing');
});
