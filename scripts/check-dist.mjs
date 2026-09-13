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
  for(const path of [...references,...entries.map(name=>`/Artwin/assets/${name}`),...projectImages]) {
    const res=await fetch(origin+path);
    assert.equal(res.status,200,`Missing asset ${path}`);
    const body=await res.arrayBuffer();assert(body.byteLength>0,`Empty asset ${path}`);
    if(path.endsWith('.js'))assert.match(res.headers.get('content-type'),/javascript/);
    if(path.endsWith('.webp'))assert.match(res.headers.get('content-type'),/image\/webp/);
  }
  assert.equal((await fetch(origin+'/')).status,404);
  assert.equal((await fetch(origin+'/Artwin/nonexistent-room')).status,404);
  assert.equal((await fetch(origin+'/Artwin/assets/missing.wasm')).status,404);
  assert.equal((await fetch(origin+'/Artwin/')).status,200);
  console.log(`PASS: ${entries.length} built assets, ${references.length} HTML references and ${projectImages.length} project images served beneath /Artwin/. Unknown paths return 404.`);
} finally {await new Promise(resolve=>server.close(resolve));}
