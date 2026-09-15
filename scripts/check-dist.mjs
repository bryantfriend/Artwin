import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createPagesServer } from './serve-pages.mjs';
import { projects,projectHref,apartmentHref } from '../src/projects.js';
import {projectMedia} from '../src/projectMedia.js';
import {projectLifestyle} from '../src/projectLifestyle.js';
import {validateSales} from '../src/sales.js';

const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const references=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(url=>!url.startsWith('https:'));
assert(references.length>=3,'Expected scripts, styles, and favicon');
for(const path of references)assert(path.startsWith('/Artwin/'),`Asset escapes the repository base: ${path}`);
const server=createPagesServer();
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
try {
  const entries=await readdir(new URL('../dist/assets/',import.meta.url));
  const projectImages=projects.map(project=>`/Artwin/projects/${project.id}.webp`);
  const planImages=projects.flatMap(p=>p.plans.map(plan=>`/Artwin/plans/${plan.id}.png`));
  const galleryImages=Object.values(projectMedia).flat().map(item=>`/Artwin/gallery/${item.file}`);
  const lifestyleImages=[...new Set(Object.values(projectLifestyle).flat().map(item=>`/Artwin/${item.file}`))];
  const consultants=JSON.parse(await readFile(new URL('../src/consultants.json',import.meta.url),'utf8'));
  const consultantImages=consultants.map(person=>`/Artwin/${person.photo}`);
  const referenceImages=(await readdir(new URL('../dist/references/',import.meta.url))).map(name=>`/Artwin/references/${name}`);
  const publicAssets=['/Artwin/artwin-logo.png','/Artwin/textures/kyrgyz-city-panorama.jpg','/Artwin/sales-data.json'];
  validateSales(await (await fetch(origin+'/Artwin/sales-data.json')).json());
  for(const path of [...references,...entries.map(name=>`/Artwin/assets/${name}`),...projectImages,...planImages,...galleryImages,...lifestyleImages,...consultantImages,...referenceImages,...publicAssets]) {
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
  const routes=projects.flatMap(p=>[projectHref(p),...p.plans.map(a=>apartmentHref(p,a))]);
  for(const path of [...routes,'/Artwin/finder/','/Artwin/presentation/','/Artwin/shortlist/','/Artwin/sales-workspace/']){
    const res=await fetch(origin+path);assert.equal(res.status,200,path);const page=await res.text();
    assert.match(page,/<link rel="canonical"/);assert.match(page,/<meta property="og:image"/);assert.match(page,/<h1>/);assert.match(page,/\/Artwin\/assets\//);
    if(path.includes('/apartments/'))assert.match(page,/og:image" content="https:\/\/bryantfriend.github.io\/Artwin\/plans\//);
  }
  assert.equal((await fetch(origin+'/Artwin/sitemap.xml')).status,200);
  console.log(`PASS: ${routes.length} project/apartment entry pages, ${galleryImages.length} gallery images and ${lifestyleImages.length} lifestyle images.`);
  console.log(`PASS: ${entries.length} built assets, ${references.length} HTML references, ${projectImages.length} project images, ${planImages.length} 3D previews, ${consultantImages.length} consultant photos and logo/panorama served beneath /Artwin/. Unknown paths return 404.`);
} finally {await new Promise(resolve=>server.close(resolve));}
