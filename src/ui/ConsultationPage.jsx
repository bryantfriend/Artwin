import React,{useState} from 'react';
import {projects,projectImage,projectHref} from '../projects.js';
import consultants from '../consultants.json';
import {useI18n} from '../i18n.js';
import {bookingUrl} from './ConsultationLink.jsx';
import {whatsAppContactUrl} from './WhatsAppContact.jsx';
import Icon from './Icon.jsx';

export default function ConsultationPage({initialProject}){
  const {t,language}=useI18n(),[selected,setSelected]=useState(initialProject?.id||'tokyo-city');
  const project=projects.find(p=>p.id===selected);
  return <main className="consultation-page"><nav className="collection-breadcrumb" aria-label={t('Breadcrumb')}><a href="#/projects">{t('All projects')}</a><Icon name="chevron" size={13}/><span>{t('Consultations')}</span></nav>
    <section className="consultation-intro"><span className="collection-kicker">{t('MEET THE ARTWIN TEAM')}</span><h1 data-page-title tabIndex={-1}>{t('A real conversation. Your next home.')}</h1><p>{t('Choose your project and arrange a consultation with the Artwin team.')}</p></section>
    <section className="consultation-selector" aria-labelledby="consult-project-title"><div><h2 id="consult-project-title">{t('Choose your project')}</h2><div className="consult-projects">{projects.map(p=><button key={p.id} aria-pressed={selected===p.id} onClick={()=>setSelected(p.id)}><img src={projectImage(p)} alt=""/><span>{p.name}<small>{t(p.city)}</small></span><Icon name="chevron" size={16}/></button>)}</div></div><article className="consult-selected"><img src={projectImage(project)} alt={t('{project} — Artwin project view',{project:project.name})}/><div><span className="collection-kicker">{t(project.city)}</span><h2>{project.name}</h2><p>{t(project.address)}</p><p>{t('The Artwin team will connect you with the right consultant.')}</p><a className="collection-button" href={project.city==='Osh'?whatsAppContactUrl:bookingUrl} target="_blank" rel="noopener noreferrer">{t(project.city==='Osh'?'Contact Artwin on WhatsApp':'Choose a time on Artwin')}<Icon name="arrow" size={18}/></a><a className="consult-secondary" href={projectHref(project)}>{t('Explore {project}',{project:project.name})} ↗</a></div></article></section>
    <section className="consultant-team" aria-labelledby="team-title"><div className="project-browser-heading"><div><span className="collection-kicker">{t('MEET THE ARTWIN TEAM')}</span><h2 id="team-title">{t('Artwin sales team')}</h2></div><a href={bookingUrl} target="_blank" rel="noopener noreferrer">{t('Official booking page')} ↗</a></div><div className="consultant-grid">{consultants.map(person=><article className="consultant-card" key={person.id}><img src={`${import.meta.env.BASE_URL}${person.photo}`} alt={language==='ru'||language==='ky'?person.name:person.nameLatin} loading="lazy"/><div><h3>{language==='ru'||language==='ky'?person.name:person.nameLatin}</h3><p>{t('Project consultant')}</p></div></article>)}</div></section>
  </main>;
}
