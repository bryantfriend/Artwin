import React,{useState} from 'react';
import {useI18n} from '../i18n.js';
import Modal from './Modal.jsx';
import {ProjectConsultation} from './ConsultationLink.jsx';
import './OfficialPlans.css';
import {seoulFloors} from '../commercialPlans.js';

export const referenceImage=filename=>`${import.meta.env.BASE_URL}references/${filename.replace(/\.[^.]+$/,'.webp')}`;
export function SourceReference({plan,project}){
 const {t}=useI18n();
 return <details className="source-reference"><summary>{t('View Artwin’s original presentation')}</summary><p>{t('Original reference published by Artwin. Labels in the source image are preserved.')}</p><a href={referenceImage(plan.reference)} target="_blank" rel="noopener noreferrer"><img src={referenceImage(plan.reference)} alt={`${project.name} · ${t('Official reference')}`} loading="lazy"/></a><a className="buyer-link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('About the project on Artwin')} ↗</a></details>;
}
export function CommercialPlans({project}){
 const {t,number}=useI18n(),[floor,setFloor]=useState(1),[zoom,setZoom]=useState(false);
 const selected=seoulFloors.find(f=>f.floor===floor),label=t('Floor {number}',{number:number(floor)});
 return <section className="commercial-plans" aria-labelledby="commercial-title"><div className="showcase-heading"><div><span className="collection-kicker">{t('ROOM FOR YOUR BUSINESS')}</span><h2 id="commercial-title">{t('Choose your business floor')}</h2><p>{t('Explore the 12 published floor plans, from office spaces to the top-floor terrace.')}</p></div><span className="commercial-class">{t('Class A business centre')}</span></div><div className="commercial-browser"><label className="commercial-floor-select">{t('Choose a floor')}<select value={floor} onChange={e=>setFloor(Number(e.target.value))}>{seoulFloors.map(f=><option key={f.floor} value={f.floor}>{t('Floor {number}',{number:number(f.floor)})}</option>)}</select></label><nav aria-label={t('Choose a floor')}>{seoulFloors.map(f=><button key={f.floor} aria-pressed={floor===f.floor} onClick={()=>setFloor(f.floor)}>{t('Floor {number}',{number:number(f.floor)})}</button>)}</nav><div className="commercial-preview"><div className="commercial-preview-heading"><h3 aria-live="polite">{label}</h3><button onClick={()=>setZoom(true)}>{t('Enlarge previews')} ↗</button></div><button className="commercial-image" onClick={()=>setZoom(true)} aria-label={`${t('Enlarge previews')} · ${label}`}><img key={selected.reference} src={referenceImage(selected.reference)} alt={`${project.name} · ${label} · ${t('Official reference')}`}/></button><p>{t('Original reference published by Artwin. Labels in the source image are preserved.')}</p><ProjectConsultation project={project}/></div></div><details className="source-reference"><summary>{t('Office interior inspiration')}</summary><img src={referenceImage('seoul-2.jpg')} alt={t('Office interior inspiration')} loading="lazy"/></details>{zoom&&<Modal onClose={()=>setZoom(false)} labelledBy="commercial-zoom-title" className="official-plan-dialog"><h2 id="commercial-zoom-title">Seoul · {label}</h2><a href={referenceImage(selected.reference)} target="_blank" rel="noopener noreferrer"><img src={referenceImage(selected.reference)} alt={label}/>{t('Open original image')} ↗</a><p>{t('Original reference published by Artwin. Labels in the source image are preserved.')}</p></Modal>}</section>;
}
export function RequestedPlans({project}){
 const {t}=useI18n();
 return <section className="requested-plans"><span className="collection-kicker">{t('YOUR NEXT STEP')}</span><h2>{t('Find the right home at French House')}</h2><p>{t('Artwin’s current presentation does not include apartment drawings. Ask the team for the available layouts and arrange a personal consultation.')}</p><ProjectConsultation project={project}/><a className="buyer-link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('About the project on Artwin')} ↗</a></section>;
}
