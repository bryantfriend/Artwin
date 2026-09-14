import React from 'react';
import Icon from './Icon.jsx';
import {whatsAppContactUrl} from './WhatsAppContact.jsx';
import {useI18n} from '../i18n.js';
import './ConsultationLink.css';

export const bookingUrl='https://artwin.kg/schedule-call';
export const consultationHref=()=>bookingUrl;
export default function ConsultationLink({compact=false,projectName,projectId,onClick}) {
  const {t}=useI18n();
  const label=projectName?t('Schedule a consultation about {project}',{project:projectName}):t('Schedule a consultation');
  return <a
    className={`consultation-link${compact?' consultation-link--compact':''}`}
    href={consultationHref(projectId)}
    onClick={onClick}
    aria-label={label}
    title={label}
  >
    <Icon name="calendar"/>
    <span>{t('Schedule a consultation')}</span>
  </a>;
}

export function ProjectConsultation({project}) {
  const {t}=useI18n();
  return <div className="project-consultation">
    <ConsultationLink projectName={project.name} projectId={project.id}/>
    <p>{t('Prefer to chat?')} <a href={whatsAppContactUrl} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a></p>
  </div>;
}

export function ConsultationBanner(){
  const {t}=useI18n();
  return <section className="consultation-banner" aria-labelledby="consultation-title">
    <div><span className="collection-kicker">{t('LET’S TALK ABOUT YOUR PLANS')}</span><h2 id="consultation-title">{t('Find the space that’s right for you.')}</h2><p>{t('Choose your project and arrange a consultation with the Artwin team.')}</p></div>
    <ConsultationLink/>
  </section>;
}
