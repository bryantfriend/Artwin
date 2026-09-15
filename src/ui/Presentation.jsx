import React,{useCallback,useEffect,useRef,useState} from 'react';
import QRCode from 'qrcode';
import {useI18n} from '../i18n.js';
import {projects,apartmentHref} from '../projects.js';
import {planKey,resolvePlan,sharedPlans,savedKeys,copyText,contextMessage,whatsappHref} from '../sales.js';
import {presentationHref,basePath} from '../navigation.js';
import FloorPlan from './FloorPlan.jsx';
import {getLayout} from '../layouts/index.js';
import {planPreview} from './PlanGallery.jsx';

function QR({url,onReady}){
 const {t}=useI18n(),[src,setSrc]=useState('');
 useEffect(()=>{let current=true;QRCode.toDataURL(url,{width:240,margin:4,errorCorrectionLevel:'M'}).then(s=>{if(current){setSrc(s);onReady(url);}}).catch(()=>{if(current)onReady(url);});return()=>{current=false;};},[url,onReady]);
 return src?<img className="proposal-qr" src={src} alt={t('Scan to open this apartment')}/>:<a href={url}>{t('Open apartment')}</a>;
}
export default function Presentation({search=''}){
 const {t,number}=useI18n(),[keys,setKeys]=useState(()=>{const incoming=sharedPlans(search);return(incoming.length?incoming:savedKeys()).slice(0,3);}),[projectId,setProjectId]=useState('tokyo-city'),[planId,setPlanId]=useState(''),[index,setIndex]=useState(0),[status,setStatus]=useState(''),[view,setView]=useState('present'),[printing,setPrinting]=useState(false);
 const [qrReady,setQrReady]=useState({}),markQrReady=useCallback(url=>setQrReady(prev=>({...prev,[url]:true})),[]);
 const container=useRef(),records=keys.map(resolvePlan).filter(Boolean),active=records[Math.min(index,records.length-1)],options=projects.find(p=>p.id===projectId)?.plans||[];
 const proposalReady=records.every(({project,plan})=>qrReady[new URL(apartmentHref(project,plan),location.origin).href]);
 const share=new URL(presentationHref(keys),location.origin).href;
 const update=next=>{setKeys(next);setIndex(0);setStatus('');history.replaceState(history.state,'',presentationHref(next));};
 useEffect(()=>{const fn=e=>{if(e.target.matches('input,select,textarea')||records.length<2)return;if(e.key==='ArrowRight')setIndex(i=>(i+1)%records.length);if(e.key==='ArrowLeft')setIndex(i=>(i+records.length-1)%records.length);};window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[records.length]);
 async function printProposal(){
  setPrinting(true);
  try{
   await document.fonts.ready;
   await Promise.all([...container.current.querySelectorAll('.proposal-print img')].map(img=>img.decode().catch(()=>{})));
   window.print();
  }finally{setPrinting(false);}
 }
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await container.current.requestFullscreen();}catch{setStatus('Full screen is unavailable on this device');}}
 return <main className="presentation-page" ref={container}><div className="presentation-toolbar"><div><span className="collection-kicker">ARTWIN / {t('SALES SHOWROOM')}</span><h1 data-page-title tabIndex={-1}>{t('Your apartment presentation')}</h1></div><div className="buyer-actions"><button className="buyer-secondary" onClick={()=>setView(v=>v==='present'?'compare':'present')}>{t(view==='present'?'Compare':'Presentation')}</button><button className="buyer-secondary" onClick={fullscreen}>{t('Fullscreen')}</button><button className="buyer-secondary" disabled={!keys.length} onClick={async()=>setStatus(await copyText(share)?'Share link copied':'Copy unavailable. Select the link below.')}>{t('Copy share link')}</button><button className="buyer-primary" disabled={!keys.length||printing||!proposalReady} onClick={printProposal}>{t('Print or save proposal')}</button></div></div>
 <details className="presentation-chooser" open={!records.length}><summary>{t('Choose up to three apartments')}</summary><div className="buyer-fields"><label>{t('Project')}<select aria-label={t('Project')} value={projectId} onChange={e=>{setProjectId(e.target.value);setPlanId('');}}>{projects.filter(p=>p.plans.length).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>{t('Apartment')}<select aria-label={t('Apartment')} value={planId} onChange={e=>setPlanId(e.target.value)}><option value="">{t('Choose a floor plan')}</option>{options.map(p=><option key={p.id} value={p.id}>{number(p.area,2)} {t('m²')} · {t(p.name)}</option>)}</select></label><button className="buyer-primary" disabled={!planId||keys.length===3||keys.includes(`${projectId}:${planId}`)} onClick={()=>update([...keys,`${projectId}:${planId}`])}>{t('Add to presentation')} +</button></div></details>
 {records.length>0&&<><nav className="presentation-tabs" aria-label={t('Selected apartments')}>{records.map(({project,plan},i)=><div key={plan.id}><button aria-pressed={index===i} onClick={()=>setIndex(i)}>{project.name} · {number(plan.area,2)} {t('m²')}</button><button aria-label={t('Remove {area} m²',{area:number(plan.area,2)})} onClick={()=>update(keys.filter(k=>k!==planKey(project,plan)))}>×</button></div>)}</nav><section className={`presentation-stage ${view==='compare'?'presentation-comparison':''}`}>{(view==='compare'?records:[active]).map(({project,plan})=><article className="presentation-home" key={plan.id}><div className="presentation-images"><img src={planPreview(plan)} alt={t('Furnished 3D view')}/><div><FloorPlan layout={getLayout(plan.id)} interactive={false}/><span>{t('2D floor plan')}</span></div></div><div className="presentation-home-copy"><span className="collection-kicker">{project.name}</span><h2>{number(plan.area,2)} <small>{t('m²')}</small></h2><p>{t(plan.description)}</p><dl className="buyer-facts"><div><dt>{t('Bedrooms')}</dt><dd>{plan.bedrooms||t('One-room home')}</dd></div><div><dt>{t('Bathrooms')}</dt><dd>{plan.bathrooms}</dd></div></dl><a className="buyer-primary" href={apartmentHref(project,plan)}>{t('Open the walkthrough')} →</a><p className="buyer-muted">{t('Ask Artwin for current availability')}</p></div></article>)}</section><div className="presentation-share"><label>{t('Share this selection')}<input readOnly value={share} onFocus={e=>e.target.select()}/></label><a className="buyer-secondary" href={whatsappHref(contextMessage({keys},t))} target="_blank" rel="noopener noreferrer">{t('Discuss this selection')} ↗</a></div></>}
 <p role="status">{status&&t(status)}</p><p className="presentation-note">{t('Approximate furnished visualization based on the supplied floor plan.')} {t('No price or availability is implied by this presentation.')}</p>
 <div className="proposal-print">{records.map(({project,plan})=>{const url=new URL(apartmentHref(project,plan),location.origin).href;return <article className="proposal-sheet" key={plan.id}><header><img src={`${basePath}artwin-logo.png`} alt="ARTWIN"/><span>{t('YOUR HOME SELECTION')}</span></header><h1>{project.name} <span>{number(plan.area,2)} {t('m²')}</span></h1><p>{t(plan.name)} · {t('Bedrooms')}: {number(plan.bedrooms)} · {t('Bathrooms')}: {number(plan.bathrooms)}</p><img className="proposal-model" src={planPreview(plan)} alt={t('Furnished 3D view')}/><div className="proposal-bottom"><FloorPlan layout={getLayout(plan.id)} interactive={false}/><div><p>{t(plan.description)}</p><p>{t('Ask Artwin for current availability')}</p><QR url={url} onReady={markQrReady}/><small>{t('Scan to open this apartment')}</small></div></div><footer><p>{t('Approximate furnished visualization based on the supplied floor plan.')}</p><p>WhatsApp: +996 228 88 00 00 · artwin.kg/schedule-call</p><a href={url}>{url}</a></footer></article>;})}</div>
 </main>;
}
