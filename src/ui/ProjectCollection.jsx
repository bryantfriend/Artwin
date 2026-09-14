import React,{useState} from 'react';
import {projects,projectSource,projectHref,projectImage} from '../projects.js';
import {useI18n} from '../i18n.js';
import Icon from './Icon.jsx';
import ConsultationLink,{ConsultationBanner,ProjectConsultation} from './ConsultationLink.jsx';
import LanguagePicker from './LanguagePicker.jsx';
import SocialLinks from './SocialLinks.jsx';
import PlanGallery from './PlanGallery.jsx';
import {BuyerTools} from './BuyerTools.jsx';
import ProjectConfidence from './ProjectConfidence.jsx';

export function CollectionHeader(){
  const {t}=useI18n();
  return <><header className="collection-header"><a href="#/projects" aria-label={t('Artwin home')}><img src={`${import.meta.env.BASE_URL}artwin-logo.png`} width="287" height="88" alt="ARTWIN"/></a><span className="collection-header-caption">{t('A NEW PERSPECTIVE ON HOME')}</span><a className="collection-nav" href="#/projects" onClick={e=>{const heading=document.getElementById('project-list-title');if(heading){e.preventDefault();heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});heading.focus({preventScroll:true});}}}>{t('Our projects')} <Icon name="arrow" size={17}/></a><LanguagePicker/><ConsultationLink compact/></header><nav className="buyer-nav" aria-label={t('Buyer tools')}><a href="#/finder">{t('Help me choose')} →</a><a href="#/shortlist">♡ {t('My shortlist')}</a></nav></>;
}
export function CollectionFooter(){const {t}=useI18n();return <footer className="collection-footer"><div className="footer-identity"><span>ARTWIN <span className="footer-divider">/</span> {t('Spaces for living')}</span><p>{t('Project imagery & information from')} <a href={projectSource} target="_blank" rel="noopener noreferrer">{t('Artwin’s official collection')} ↗</a></p><a className="workspace-link" href="#/sales-workspace">{t('Sales workspace')} ↗</a></div><SocialLinks/></footer>;}
export function ProjectImage({project,eager=false,className=''}){
  const {t}=useI18n(),[failed,setFailed]=useState(false);
  return <div className={`project-image ${className}`}>{failed?<div className="project-image-fallback"><span>{project.name}</span><small>{t('Project image unavailable')}</small></div>:<img src={projectImage(project)} alt={t('{project} — Artwin project view',{project:project.name})} loading={eager?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>}</div>;
}
function Availability({project}){const {t,number}=useI18n();return <span className={`project-availability ${project.plans.length?'available':''}`}><span/>{project.plans.length?t('Interactive apartments: {count}',{count:number(project.plans.length)}):t('Floor plans coming soon')}</span>;}
export default function ProjectCollection(){
  const {t,number}=useI18n(),[city,setCity]=useState('All'),[query,setQuery]=useState('');
  const featured=projects.find(p=>p.id==='tokyo-city');
  const filtered=projects.filter(p=>(city==='All'||p.city===city)&&`${p.name} ${p.nativeName||''} ${p.city} ${t(p.city)} ${p.address} ${t(p.address)}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <main className="collection-main">
    <section className="collection-intro"><div><span className="collection-kicker">{t('THE ARTWIN COLLECTION')}</span><h1 data-page-title tabIndex={-1}>{t('Find your place.')}<br/><em>{t('Imagine your life.')}</em></h1></div><div className="collection-intro-copy"><p>{t('Every home begins with a place.')}<br/>{t('Choose a project. Explore the possibilities.')}</p><div><span>{t('Projects: {count}',{count:number(projects.length)})}</span><i/><span>{t('2 cities')}</span><i/><span>{t('One new perspective')}</span></div></div></section>
    <section className="collection-featured" aria-labelledby="featured-title"><ProjectImage project={featured} eager/><div className="featured-copy"><span className="collection-kicker">{t('YOUR FIRST LOOK INSIDE')}</span><h2 id="featured-title">Tokyo City</h2><p>{t('A place to slow down.')}<br/>{t('A home to make your own.')}</p><span className="featured-location">{t(featured.city)} · {t(featured.address)}</span><a className="collection-button" href={projectHref(featured)}>{t('Explore {project}',{project:featured.name})} <Icon name="arrow"/></a><span className="featured-note">{t('Six floor plans · 52.10–134.68 m² · Explore in 3D')}</span></div></section>
    <section className="project-browser" aria-labelledby="project-list-title"><div className="project-browser-heading"><div><span className="collection-kicker">{t('DISCOVER THE COLLECTION')}</span><h2 id="project-list-title" tabIndex={-1}>{t('Choose your project')}</h2></div><p>{t('One collection. Different ways to live.')}</p></div>
      <div className="project-filters"><div className="city-filters" role="group" aria-label={t('Filter projects by city')}>{['All','Bishkek','Osh'].map(c=><button key={c} aria-pressed={city===c} onClick={()=>setCity(c)}>{c==='All'?t('All projects'):t(c)}<span>{c==='All'?number(projects.length):number(projects.filter(p=>p.city===c).length)}</span></button>)}</div><label className="project-search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input type="search" aria-label={t('Search projects')} placeholder={t('Find a project')} value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
      <p className="project-result-count" role="status">{t('Projects: {count}',{count:number(filtered.length)})}{city!=='All'?` · ${t(city)}`:''}</p>
      <div className="project-grid">{filtered.map(p=><a key={p.id} className="project-card" href={projectHref(p)} aria-label={t('Explore {project}',{project:p.name})}><div className="project-card-visual"><ProjectImage project={p}/><span className="project-city">{t(p.city)}</span><span className="project-card-arrow"><Icon name="arrow"/></span></div><div className="project-card-copy"><div className="project-card-heading"><h3>{p.name}</h3><span>{t(p.type)}</span></div><p>{t(p.address)}</p><Availability project={p}/></div></a>)}</div>
      {!filtered.length&&<div className="project-empty-search"><h3>{t('No projects found.')}</h3><p>{t('Try a different name or city.')}</p><button onClick={()=>{setCity('All');setQuery('');}}>{t('Clear filters')} <Icon name="reset" size={16}/></button></div>}
    </section><ConsultationBanner/>
  </main>;
}
export function ProjectPage({project}){
  const {t}=useI18n();
  return <main className="project-detail"><nav className="collection-breadcrumb" aria-label={t('Breadcrumb')}><a href="#/projects">{t('All projects')}</a><Icon name="chevron" size={13}/><span aria-current="page">{project.name}</span></nav>
    <section className="project-overview"><div className="project-overview-copy"><span className="collection-kicker">{t(project.city)} <span>/</span> {t(project.type)}</span><h1 data-page-title tabIndex={-1}>{project.name}</h1><p>{t(project.description)}</p><div className="project-address">{t(project.address)}</div><Availability project={project}/><a className="project-source" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('About the project on Artwin')} ↗</a><ProjectConsultation project={project}/></div><ProjectImage project={project} eager/></section>
    <BuyerTools project={project}/>
    {project.plans.length?<PlanGallery project={project}/>:<section className="project-plans"><div className="project-coming-soon"><div className="coming-soon-mark"><Icon name="plan" size={34}/></div><div><span className="collection-kicker">{t('COMING TO THE COLLECTION')}</span><h2>{t(project.type==='Business centre'?'Space previews are on the way.':'Floor plans are on the way.')}</h2><p>{t('Interactive spaces for {project} are not available yet.',{project:project.name})}<br/>{t('For now, step inside our first residence at Tokyo City.')}</p><a href="#/projects/tokyo-city">{t('Explore {project}',{project:'Tokyo City'})} <Icon name="arrow" size={18}/></a></div></div></section>}
    <ProjectConfidence project={project}/>
  </main>;
}
