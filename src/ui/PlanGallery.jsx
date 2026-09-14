import React,{useEffect,useState} from 'react';
import {filterPlans} from '../planFilters.js';
import {getLayout} from '../layouts/index.js';
import {apartmentHref} from '../projects.js';
import {useI18n} from '../i18n.js';
import FloorPlan from './FloorPlan.jsx';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';
import {consultationHref} from './ConsultationLink.jsx';
import './PlanGallery.css';
import {BuyerTools} from './BuyerTools.jsx';
import {safeWrite,track} from '../sales.js';

export const planPreview=plan=>`${import.meta.env.BASE_URL}plans/${plan.id}.png`;
function Previews({plan}){
  const {t,number}=useI18n();
  return <div className="paired-previews"><div className="preview-plan"><span>{t('2D floor plan')}</span><FloorPlan layout={getLayout(plan.id)} interactive={false}/></div><div className="preview-model"><span>{t('Furnished 3D view')}</span><img src={planPreview(plan)} alt={`${t('Furnished 3D view')} · ${number(plan.area,2)} ${t('m²')}`} loading="lazy" width="1220" height="647"/></div></div>;
}
function Metrics({plan}){
  const {t,number}=useI18n();
  return <dl className="residence-metrics"><div><dt>{t('Advertised area')}</dt><dd>{number(plan.area,2)} <small>{t('m²')}</small></dd></div><div><dt>{t('Bedrooms')}</dt><dd>{number(plan.bedrooms)}</dd></div><div><dt>{t('Bathrooms')}</dt><dd>{number(plan.bathrooms)}</dd></div></dl>;
}
export default function PlanGallery({project}){
  const {t,number}=useI18n();
  const [bedrooms,setBedrooms]=useState('All'),[area,setArea]=useState('all'),[sort,setSort]=useState('ascending'),[savedOnly,setSavedOnly]=useState(false);
  const [saved,setSaved]=useState(()=>{try{const ids=JSON.parse(localStorage.getItem('artwin-saved-plans')||'[]');return Array.isArray(ids)?ids.filter(id=>typeof id==='string'):[];}catch{return [];}});
  const [expanded,setExpanded]=useState([]);
  const [compare,setCompare]=useState([]),[enlarged,setEnlarged]=useState(null),[comparisonOpen,setComparisonOpen]=useState(false);
  useEffect(()=>{safeWrite('artwin-saved-plans',saved);},[saved]);
  const visible=filterPlans(project.plans,{bedrooms,area,sort,savedOnly,saved});
  const selected=project.plans.filter(p=>compare.includes(p.id));
  const toggleSaved=id=>{if(!saved.includes(id))track('shortlist_saved',{projectId:project.id,planId:id});setSaved(ids=>ids.includes(id)?ids.filter(value=>value!==id):[...ids,id]);};
  const toggleCompare=id=>setCompare(ids=>ids.includes(id)?ids.filter(value=>value!==id):ids.length<3?[...ids,id]:ids);
  const clearFilters=()=>{setBedrooms('All');setArea('all');setSavedOnly(false);};
  return <section className="plan-showcase" aria-labelledby="floor-plans-title">
    <div className="showcase-heading"><div><span className="collection-kicker">{t('PICTURE YOUR EVERYDAY')}</span><h2 id="floor-plans-title">{t('A plan for your life.')}</h2><p>{t('See the layout. Picture the furniture. Step inside.')}</p></div><div className="showcase-range"><strong>52—135 <small>{t('m²')}</small></strong><span>{t('Six ways to feel at home.')}</span></div></div>
    <div className="showcase-filters"><div className="bedroom-filters" role="group" aria-label={t('Filter apartments by bedrooms')}>{['All',1,2,3].map(n=><button key={n} aria-pressed={bedrooms===n} onClick={()=>setBedrooms(n)}>{n==='All'?t('All floor plans'):t(n===1?'1 bedroom':'{count} bedrooms',{count:number(n)})}</button>)}</div><div className="showcase-selects"><label>{t('Area')}<select value={area} onChange={e=>setArea(e.target.value)}>{[['all','Any area'],['small','Under 80 m²'],['medium','80–110 m²'],['large','Over 110 m²']].map(([value,label])=><option key={value} value={value}>{t(label)}</option>)}</select></label><label className="showcase-sort"><span>{t('Sort floor plans')}</span><select aria-label={t('Sort floor plans')} value={sort} onChange={e=>setSort(e.target.value)}><option value="ascending">{t('Area: small to large')}</option><option value="descending">{t('Area: large to small')}</option></select></label></div></div>
    <div className="showcase-results"><span role="status">{t('Floor plans: {count}',{count:number(visible.length)})}</span><button className="saved-filter" aria-label={t('Show saved plans only')} aria-pressed={savedOnly} onClick={()=>setSavedOnly(v=>!v)}><Icon name="heart" size={17}/>{t('Saved plans')} <span>{saved.filter(id=>project.plans.some(p=>p.id===id)).length}</span></button></div>
    <div className="residence-list">{visible.map(plan=><article className={`residence-card${expanded.includes(plan.id)?' details-open':''}`} key={plan.id} data-plan-id={plan.id}>
      <button className="preview-trigger" aria-label={`${t('Enlarge previews')} · ${number(plan.area,2)} ${t('m²')}`} onClick={()=>setEnlarged(plan)}><Previews plan={plan}/><span className="preview-expand"><Icon name="expand" size={17}/>{t('Enlarge previews')}</span></button>
      <div className="residence-copy"><div className="residence-topline"><span className="collection-kicker">{t('APARTMENT {number}',{number:String(project.plans.indexOf(plan)+1).padStart(2,'0')})}</span><button className={`save-plan ${saved.includes(plan.id)?'saved':''}`} aria-label={`${t(saved.includes(plan.id)?'Remove from saved plans':'Save this plan')} · ${number(plan.area,2)}`} aria-pressed={saved.includes(plan.id)} onClick={()=>toggleSaved(plan.id)}><Icon name="heart"/></button></div><div className="residence-title"><h3>{t(plan.name)}</h3><span className="mobile-plan-area">{number(plan.area,2)} <small>{t('m²')}</small></span></div><div className="residence-details" id={`plan-details-${plan.id}`}><Metrics plan={plan}/><div className="plan-highlights"><span>{t(plan.id.includes('euro')?'Open living':'Separate kitchen')}</span><span>{t(plan.bedrooms>1?'Family space':'Private loggia')}</span></div><p className="residence-description">{t(plan.description)}</p><BuyerTools project={project} plan={plan} compact/></div><div className="residence-actions"><a className="collection-button" href={apartmentHref(project,plan)} aria-label={t('Explore {area} m² in 3D',{area:number(plan.area,2)})}>{t('Explore in 3D')}<Icon name="arrow"/></a><button className="plan-details-toggle" aria-expanded={expanded.includes(plan.id)} aria-controls={`plan-details-${plan.id} plan-compare-${plan.id}`} onClick={()=>setExpanded(ids=>ids.includes(plan.id)?ids.filter(id=>id!==plan.id):[...ids,plan.id])}>{t(expanded.includes(plan.id)?'Hide details':'Plan details')}<Icon name="chevron" size={14}/></button><label id={`plan-compare-${plan.id}`} className="compare-choice" title={t('Compare up to 3 plans')}><input type="checkbox" checked={compare.includes(plan.id)} disabled={compare.length===3&&!compare.includes(plan.id)} onChange={()=>toggleCompare(plan.id)}/>{t('Compare')}</label></div></div>
    </article>)}</div>
    {!visible.length&&<div className="gallery-empty"><Icon name="plan" size={35}/><h3>{t('No matching plans.')}</h3><p>{t('Adjust your filters or save a plan using the heart icon.')}</p><button onClick={clearFilters}>{t('Clear filters')}</button></div>}
    <p className="showcase-note">{t('Approximate furnished visualization based on the supplied floor plan.')}</p>
    {selected.length>0&&<aside className="compare-tray" aria-label={t('Compare selected plans')}><span>{t('Selected: {count} / 3',{count:selected.length})}</span><button className="compare-launch" disabled={selected.length<2} onClick={()=>setComparisonOpen(true)}><Icon name="compare" size={18}/>{t('Compare')}</button><button className="compare-clear" aria-label={t('Clear selection')} onClick={()=>{setCompare([]);setComparisonOpen(false);}}><Icon name="close" size={18}/></button></aside>}
    {enlarged&&<Modal onClose={()=>setEnlarged(null)} labelledBy="preview-title" className="preview-dialog"><span className="collection-kicker">{project.name}</span><h2 id="preview-title">{number(enlarged.area,2)} {t('m²')} · {t(enlarged.name)}</h2><Previews plan={enlarged}/><div className="preview-dialog-footer"><p>{t('Approximate furnished visualization based on the supplied floor plan.')}</p><a className="collection-button" href={apartmentHref(project,enlarged)}>{t('Explore in 3D')}<Icon name="arrow"/></a></div></Modal>}
    {comparisonOpen&&<Modal onClose={()=>setComparisonOpen(false)} labelledBy="comparison-title" className="comparison-dialog"><span className="collection-kicker">{project.name}</span><h2 id="comparison-title">{t('Compare these spaces')}</h2><p className="comparison-hint">↔ {t('Swipe sideways to see all plans.')}</p><div className="comparison-scroll" tabIndex={0} role="region" aria-label={t('Compare selected plans')}><table><thead><tr><th scope="col">{t('Floor plans')}</th>{selected.map(p=><th scope="col" key={p.id}>{number(p.area,2)} {t('m²')}</th>)}</tr></thead><tbody><tr><th scope="row">{t('Furnished 3D view')}</th>{selected.map(p=><td key={p.id}><img src={planPreview(p)} alt={t(p.name)}/></td>)}</tr><tr><th scope="row">{t('2D floor plan')}</th>{selected.map(p=><td key={p.id}><FloorPlan layout={getLayout(p.id)} interactive={false}/></td>)}</tr>{[['Area',p=>`${number(p.area,2)} ${t('m²')}`],['Bedrooms',p=>number(p.bedrooms)],['Bathrooms',p=>number(p.bathrooms)]].map(([label,value])=><tr key={label}><th scope="row">{t(label)}</th>{selected.map(p=><td key={p.id}>{value(p)}</td>)}</tr>)}<tr><th scope="row">{t('Explore')}</th>{selected.map(p=><td key={p.id}><a className="collection-button" href={apartmentHref(project,p)}>{t('Explore in 3D')}</a></td>)}</tr></tbody></table></div><a className="comparison-consult" href={consultationHref(project.id)}>{t('Ask about this plan')} ↗</a></Modal>}
  </section>;
}
