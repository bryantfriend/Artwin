import React,{lazy,Suspense,useEffect,useState} from 'react';
import {resolveRoute} from './projects.js';
import ProjectCollection,{CollectionHeader,CollectionFooter,ProjectPage} from './ui/ProjectCollection.jsx';
import ErrorBoundary from './ui/ErrorBoundary.jsx';
import './projects.css';
const ApartmentExperience=lazy(()=>import('./ApartmentExperience.jsx'));

export default function App(){
  const [hash,setHash]=useState(()=>window.location.hash);
  const route=resolveRoute(hash);
  useEffect(()=>{const change=()=>setHash(window.location.hash);window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  useEffect(()=>{
    document.title=route.kind==='apartment'?`${route.project.name} · ${route.plan.area} m² — Artwin`:route.kind==='project'?`${route.project.name} — Artwin`:'Artwin — Explore our projects';
    window.scrollTo(0,0);
    const frame=requestAnimationFrame(()=>document.querySelector('[data-page-title]')?.focus({preventScroll:true}));
    return()=>cancelAnimationFrame(frame);
  },[hash]);
  if(route.kind==='apartment')return <ErrorBoundary><Suspense fallback={<div className="collection"><CollectionHeader/><main className="collection-loading" role="status">Opening your apartment…</main></div>}><ApartmentExperience key={route.plan.id} project={route.project} plan={route.plan}/></Suspense></ErrorBoundary>;
  return <div className="collection"><CollectionHeader/>
    {route.kind==='projects'?<ProjectCollection/>:route.kind==='project'?<ProjectPage key={route.project.id} project={route.project}/>:<main className="collection-missing"><span className="collection-kicker">LET’S FIND YOUR WAY</span><h1 data-page-title tabIndex={-1}>This space isn’t available.</h1><p>Choose a project from the collection to continue exploring.</p><a className="collection-button" href="#/projects">View all projects</a></main>}
    <CollectionFooter/>
  </div>;
}
