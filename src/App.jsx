import React,{lazy,Suspense,useEffect,useState} from 'react';
import {resolveRoute} from './projects.js';
import {useI18n} from './i18n.js';
import ProjectCollection,{CollectionHeader,CollectionFooter,ProjectPage} from './ui/ProjectCollection.jsx';
import ConsultationPage from './ui/ConsultationPage.jsx';
import WelcomeModal from './ui/WelcomeModal.jsx';
import ErrorBoundary from './ui/ErrorBoundary.jsx';
import WhatsAppContact from './ui/WhatsAppContact.jsx';
import './projects.css';
import './experience.css';
const ApartmentExperience=lazy(()=>import('./ApartmentExperience.jsx'));

export default function App(){
  const {t,language,number}=useI18n();
  const [hash,setHash]=useState(()=>window.location.hash),[welcome,setWelcome]=useState(true);
  const route=resolveRoute(hash);
  useEffect(()=>{const change=()=>setHash(window.location.hash);window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  useEffect(()=>{
    document.title=route.kind==='apartment'?`${route.project.name} · ${number(route.plan.area,2)} ${t('m²')} — Artwin`:route.kind==='project'?`${route.project.name} — Artwin`:route.kind==='consultations'?`${t('Consultations')} — Artwin`:`Artwin — ${t('Explore our projects')}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',t('Choose a project. Explore the possibilities.'));
  },[hash,language]);
  useEffect(()=>{
    window.scrollTo(0,0);
    const frame=requestAnimationFrame(()=>{if(!document.querySelector('dialog[open]'))document.querySelector('[data-page-title]')?.focus({preventScroll:true});});
    return()=>cancelAnimationFrame(frame);
  },[hash]);
  const content=route.kind==='apartment'?<ErrorBoundary><Suspense fallback={<div className="collection"><CollectionHeader/><main className="collection-loading" role="status">{t('Opening your apartment…')}</main></div>}><ApartmentExperience key={route.plan.id} project={route.project} plan={route.plan}/></Suspense></ErrorBoundary>:<div className="collection"><CollectionHeader/>
    {route.kind==='projects'?<ProjectCollection/>:route.kind==='project'?<ProjectPage key={route.project.id} project={route.project}/>:route.kind==='consultations'?<ConsultationPage key={route.project?.id||'all'} initialProject={route.project}/>:<main className="collection-missing"><span className="collection-kicker">{t('LET’S FIND YOUR WAY')}</span><h1 data-page-title tabIndex={-1}>{t('This space isn’t available.')}</h1><p>{t('Choose a project from the collection to continue exploring.')}</p><a className="collection-button" href="#/projects">{t('View all projects')}</a></main>}
    <CollectionFooter/><WhatsAppContact floating/>
  </div>;
  return <>{content}{welcome&&<WelcomeModal onClose={()=>setWelcome(false)}/>}</>;
}
