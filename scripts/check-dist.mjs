import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createPagesServer } from './serve-pages.mjs';
import { projects } from '../src/projects.js';

const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const references=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]);
assert(references.length>=3,'Expected scripts, styles, and favicon');
for(const path of references)assert(path.startsWith('/Artwin/'),`Asset escapes the repository base: ${path}`);
const server=createPagesServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
try {
  const entries=await readdir(new URL('../dist/assets/',import.meta.url));
  const projectImages=projects.map(project=>`/Artwin/projects/${project.id}.webp`);
  const planImages=projects.flatMap(p=>p.plans.map(plan=>`/Artwin/plans/${plan.id}.png`));
  const consultants=JSON.parse(await readFile(new URL('../src/consultants.json',import.meta.url),'utf8'));
  const consultantImages=consultants.map(person=>`/Artwin/${person.photo}`);
  const publicAssets=['/Artwin/artwin-logo.png','/Artwin/textures/kyrgyz-city-panorama.jpg'];
  for(const path of [...references,...entries.map(name=>`/Artwin/assets/${name}`),...projectImages,...planImages,...consultantImages,...publicAssets]) {
    const res=await fetch(origin+path);
    assert.equal(res.status,200,`Missing asset ${path}`);
    const body=await res.arrayBuffer();assert(body.byteLength>0,`Empty asset ${path}`);
    if(path.endsWith('.js'))assert.match(res.headers.get('content-type'),/javascript/);
    if(path.endsWith('.webp'))assert.match(res.headers.get('content-type'),/image\/webp/);
    if(path.endsWith('.png'))assert.match(res.headers.get('content-type'),/image\/png/);
  }
  assert.equal((await fetch(origin+'/')).status,404);
  assert.equal((await fetch(origin+'/Artwin/nonexistent-room')).status,404);
  assert.equal((await fetch(origin+'/Artwin/assets/missing.wasm')).status,404);
  assert.equal((await fetch(origin+'/Artwin/')).status,200);
  console.log(`PASS: ${entries.length} built assets, ${references.length} HTML references, ${projectImages.length} project images, ${planImages.length} 3D previews, ${consultantImages.length} consultant photos and logo/panorama served beneath /Artwin/. Unknown paths return 404.`);
} finally {await new Promise(resolve=>server.close(resolve));}
