import {routeHref} from './navigation.js';
import React,{lazy,Suspense,useEffect,useState} from 'react';
import {resolveRoute} from './projects.js';
import {useI18n} from './i18n.js';
import ProjectCollection,{CollectionHeader,CollectionFooter,ProjectPage} from './ui/ProjectCollection.jsx';
import ConsultationPage from './ui/ConsultationPage.jsx';
import WelcomeModal from './ui/WelcomeModal.jsx';
import ErrorBoundary from './ui/ErrorBoundary.jsx';
import WhatsAppContact from './ui/WhatsAppContact.jsx';
import {SalesProvider} from './ui/SalesProvider.jsx';
import {ApartmentFinder,SharedShortlist,SalesWorkspace} from './ui/BuyerPages.jsx';
import {track} from './sales.js';
import {safeRead,safeWrite} from './sales.js';
import {installNavigation,routeLocation,normalizeLegacyLocation} from './navigation.js';
import {pageMetadata} from './pageMetadata.js';
import './showroom.css';
import './projects.css';
import './experience.css';
const ApartmentExperience=lazy(()=>import('./ApartmentExperience.jsx'));
const Presentation=lazy(()=>import('./ui/Presentation.jsx'));
const positions=new Map();

export default function App(){
  const {t,language,number}=useI18n();
  const [hash,setHash]=useState(()=>{normalizeLegacyLocation();return routeLocation();}),[welcome,setWelcome]=useState(false);
  const route=resolveRoute(hash);
  useEffect(()=>installNavigation(setHash),[]);
  useEffect(()=>{
    if(!['projects','project'].includes(route.kind)||Date.now()-safeRead('artwin-welcome-dismissed',0)<7*86400000)return;
    let engaged=false;
    const scroll=()=>{if(window.scrollY>400)engaged=true;};
    window.addEventListener('scroll',scroll,{passive:true});
    const timer=setInterval(()=>{if(engaged&&!document.hidden&&!document.querySelector('dialog[open]')){setWelcome(true);clearInterval(timer);}},45000);
    return()=>{clearInterval(timer);window.removeEventListener('scroll',scroll);};
  },[hash]);
  useEffect(()=>{
    if(route.kind==='project')track('project_view',{projectId:route.project.id});
    if(route.kind==='apartment')track('plan_view',{projectId:route.project.id,planId:route.plan.id});
  },[hash]);
  useEffect(()=>{
    document.title=route.kind==='apartment'?`${route.project.name} · ${number(route.plan.area,2)} ${t('m²')} — Artwin`:route.kind==='project'?`${route.project.name} — Artwin`:route.kind==='consultations'?`${t('Consultations')} — Artwin`:`Artwin — ${t('Explore our projects')}`;
    const buyerTitle={finder:'Find a home that fits',shortlist:'Your family shortlist',workspace:'Sales workspace'}[route.kind];
    if(buyerTitle)document.title=`${t(buyerTitle)} — Artwin`;
    const meta=pageMetadata(route,language);
    document.title=meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content',meta.description);
    for(const [key,value] of Object.entries({'og:title':meta.title,'og:description':meta.description,'og:image':meta.image,'og:url':meta.url}))document.querySelector(`meta[property="${key}"]`)?.setAttribute('content',value);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href',meta.url);
    let robots=document.querySelector('meta[name="robots"]');
    if(meta.noindex){if(!robots){robots=document.createElement('meta');robots.name='robots';document.head.append(robots);}robots.content='noindex,follow';}else robots?.remove();
  },[hash,language]);
  useEffect(()=>{
    const y=positions.get(hash)||0;window.scrollTo(0,y);
    const frame=requestAnimationFrame(()=>{if(!document.querySelector('dialog[open]'))document.querySelector('[data-page-title]')?.focus({preventScroll:true});});
    const save=()=>positions.set(hash,window.scrollY);window.addEventListener('scroll',save,{passive:true});
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',save);};
  },[hash]);
  const content=route.kind==='apartment'?<ErrorBoundary><Suspense fallback={<div className="collection"><CollectionHeader/><main className="collection-loading" role="status">{t('Opening your apartment…')}</main></div>}><ApartmentExperience key={route.plan.id} project={route.project} plan={route.plan}/></Suspense></ErrorBoundary>:<div className="collection"><CollectionHeader/>
    {route.kind==='projects'?<ProjectCollection/>:route.kind==='finder'?<ApartmentFinder/>:route.kind==='shortlist'?<SharedShortlist key={hash} search={route.search}/>:route.kind==='presentation'?<Suspense fallback={<p role="status">{t('Preparing presentation…')}</p>}><Presentation key={hash} search={route.search}/></Suspense>:route.kind==='workspace'?<SalesWorkspace/>:route.kind==='project'?<ProjectPage key={route.project.id} project={route.project}/>:route.kind==='consultations'?<ConsultationPage key={route.project?.id||'all'} initialProject={route.project}/>:<main className="collection-missing"><span className="collection-kicker">{t('LET’S FIND YOUR WAY')}</span><h1 data-page-title tabIndex={-1}>{t('This space isn’t available.')}</h1><p>{t('Choose a project from the collection to continue exploring.')}</p><a className="collection-button" href={routeHref('/projects')}>{t('View all projects')}</a></main>}
    <CollectionFooter/><WhatsAppContact floating/>
  </div>;
  return <SalesProvider>{content}{welcome&&['projects','project'].includes(route.kind)&&<WelcomeModal onClose={()=>{safeWrite('artwin-welcome-dismissed',Date.now());setWelcome(false);}}/>}</SalesProvider>;
}
