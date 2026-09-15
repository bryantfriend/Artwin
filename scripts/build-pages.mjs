import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {projects,resolveRoute,projectHref,apartmentHref} from '../src/projects.js';
import {pageMetadata} from '../src/pageMetadata.js';
import {translate as t,formatNumber} from '../src/i18n.js';
const base='/Artwin/',root=new URL('../dist/',import.meta.url),template=await readFile(new URL('index.html',root),'utf8');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths=['/projects','/finder','/shortlist','/presentation','/sales-workspace','/consultations',...projects.flatMap(p=>[`/projects/${p.id}`,`/consultations/${p.id}`,...p.plans.map(a=>`/projects/${p.id}/apartments/${a.id}`)])];
const sitemap=[];
for(const path of ['',...paths]){
  const route=resolveRoute(path),meta=pageMetadata(route),{project,plan}=route;
  const links=plan?`<li><a href="${projectHref(project)}">${escape(project.name)}</a></li>`:project?project.plans.map(a=>`<li><a href="${apartmentHref(project,a)}">${escape(t(a.name))} · ${formatNumber(a.area,2)} м²</a></li>`).join(''):projects.map(p=>`<li><a href="${projectHref(p)}">${escape(p.name)} — ${escape(t(p.city))}</a></li>`).join('');
  const head=`<link rel="canonical" href="${escape(meta.url)}"/><meta property="og:type" content="website"/><meta property="og:title" content="${escape(meta.title)}"/><meta property="og:description" content="${escape(meta.description)}"/><meta property="og:url" content="${escape(meta.url)}"/><meta property="og:image" content="${escape(meta.image)}"/><meta name="twitter:card" content="summary_large_image"/>${meta.noindex?'<meta name="robots" content="noindex,follow"/>':''}`;
  const body=`<main style="max-width:1000px;margin:4rem auto;padding:1rem;font:18px/1.5 system-ui"><a href="${base}projects/">ARTWIN</a><h1>${escape(meta.title)}</h1><p>${escape(meta.description)}</p>${project?`<img style="max-width:100%" src="${escape(meta.image)}" alt="${escape(project.name)}"/>`:''}<ul>${links}</ul><p>${escape(t('Approximate furnished visualization based on the supplied floor plan.'))}</p><a href="https://artwin.kg/schedule-call">${escape(t('Schedule a consultation'))}</a></main>`;
  const html=template.replace(/<title>.*?<\/title>/s,`<title>${escape(meta.title)}</title>`).replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${escape(meta.description)}"/>`).replace('</head>',head+'</head>').replace('<div id="root"></div>',`<div id="root">${body}</div>`);
  const directory=new URL(path.replace(/^\//,'')+(path?'/':''),root);await mkdir(directory,{recursive:true});await writeFile(new URL('index.html',directory),html);
  if(path&&!meta.noindex&&!path.startsWith('/consultations'))sitemap.push(meta.url);
}
await writeFile(new URL('sitemap.xml',root),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(sitemap)].map(url=>`<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${paths.length+1} static entry pages with metadata and ${new Set(sitemap).size} sitemap URLs.`);
