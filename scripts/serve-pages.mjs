// Local verification only. This server is NOT part of the deployed application.
// Unlike an SPA dev server, unknown paths return 404: no URL rewrites to hide bugs.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('../dist',import.meta.url)));
const base='/Artwin/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.wasm':'application/wasm','.png':'image/png','.webp':'image/webp','.glb':'model/gltf-binary','.gltf':'model/gltf+json','.json':'application/json','.xml':'application/xml; charset=utf-8','.jpg':'image/jpeg'};
export function createPagesServer() {
  return createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      if(url.pathname==='/Artwin'){res.writeHead(301,{Location:base});res.end();return;}
      if(!url.pathname.startsWith(base)){res.writeHead(404);res.end('Not found');return;}
      const relative=decodeURIComponent(url.pathname.slice(base.length))||'index.html';
      let path=resolve(root,relative);
      if(!path.startsWith(root+sep)){res.writeHead(404);res.end('Not found');return;}
      if((await stat(path)).isDirectory()){
        if(!url.pathname.endsWith('/')){res.writeHead(301,{Location:url.pathname+'/'+url.search});res.end();return;}
        path=resolve(path,'index.html');
      }
      if(!(await stat(path)).isFile()){res.writeHead(404);res.end('Not found');return;}
      const data=await readFile(path);
      res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});
      res.end(data);
    } catch {res.writeHead(404);res.end('Not found');}
  });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const port=Number(process.env.PORT||4173);
  createPagesServer().listen(port,'127.0.0.1',()=>console.log(`Production Pages preview: http://127.0.0.1:${port}${base} (no SPA rewrites)`));
}
