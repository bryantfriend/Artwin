import React,{useState} from 'react';
import {useI18n} from '../i18n.js';
import {projects,projectHref,projectImage} from '../projects.js';
import {routeHref} from '../navigation.js';
import {bedroomChoices,homeStories} from '../homepage.js';
import {track} from '../sales.js';
import Icon from './Icon.jsx';
import ConsultationLink from './ConsultationLink.jsx';
import './HomePage.css';

export default function HomePage(){
 const {t,number}=useI18n(),[city,setCity]=useState('All'),[bedrooms,setBedrooms]=useState('');
 const homes=projects.filter(p=>p.type==='Residential'),plans=homes.flatMap(p=>p.plans);
 const matches=homes.filter(p=>city==='All'||p.city===city).flatMap(p=>p.plans).filter(p=>bedrooms===''||p.bedrooms===Number(bedrooms));
 const project=id=>projects.find(p=>p.id===id);
 return <main className="home-page">
  <section className="home-hero" aria-labelledby="home-title">
   <div className="home-hero-copy">
    <span className="collection-kicker home-kicker"><i aria-hidden="true"/>{t('ARTWIN · HOMES & BUSINESS SPACES')}</span>
    <h1 id="home-title" data-page-title tabIndex={-1}>{t('Your next chapter starts here.')}</h1>
    <p className="home-intro">{t('Homes in Bishkek and Osh. Explore the neighbourhoods, compare layouts and look inside before your visit.')}</p>
    <form className="home-search" action={routeHref('/finder')} method="get" onSubmit={()=>track('home_search_started')} aria-labelledby="home-search-title">
     <h2 id="home-search-title">{t('What feels like home to you?')}</h2>
     <div className="home-search-fields">
      <label>{t('City')}<select name="city" value={city} onChange={e=>setCity(e.target.value)}>{['All','Bishkek','Osh'].map(c=><option value={c} key={c}>{t(c==='All'?'Both cities':c)}</option>)}</select></label>
      <label>{t('Bedrooms')}<select name="bedrooms" value={bedrooms} onChange={e=>setBedrooms(e.target.value)}><option value="">{t('Any')}</option>{bedroomChoices.map(n=><option value={n} key={n}>{n===0?t('One-room homes'):number(n)}</option>)}</select></label>
     </div>
     <button className="home-search-submit" type="submit">{t('Find my apartment')}<Icon name="arrow"/></button>
     <p className="home-search-count" role="status">{t('Layouts to explore: {count}',{count:number(matches.length)})} <span>· {t('No registration needed')}</span></p>
    </form>
    <div className="home-hero-links"><a href={routeHref('/projects')}>{t('Browse all projects')} <Icon name="arrow" size={16}/></a><a href={projectHref(project('seoul'))}>{t('Looking for an office?')} Seoul ↗</a></div>
   </div>
   <div className="home-hero-visual" aria-label={t('Life in ARTWIN projects')}>
    <figure className="home-hero-main"><img src={`${import.meta.env.BASE_URL}gallery/london-square-4-6.webp`} alt={t('Landscaped courtyard at London Square')} width="1440" height="864" fetchPriority="high"/><figcaption><span>London Square</span>{t('Project visualization · ARTWIN')}</figcaption></figure>
    <figure className="home-hero-inset"><img src={`${import.meta.env.BASE_URL}gallery/wilton-park-5-0.webp`} alt={t('Pedestrian courtyard at Wilton Park')} width="1200" height="675" decoding="async"/><figcaption>Wilton Park <span>{t('Project visualization · ARTWIN')}</span></figcaption></figure>
    <span className="home-visual-accent" aria-hidden="true"/>
   </div>
  </section>
  <div className="home-proof" aria-label={t('Explore the ARTWIN collection')}>
   <div><strong>{number(homes.length)}</strong><span>{t('residential projects in the collection')}</span></div>
   <div><strong>{number(plans.length)}</strong><span>{t('layouts to explore in 3D')}</span></div>
   <div><strong>{number(new Set(homes.map(p=>p.city)).size)}</strong><span>{t('cities. Different ways to live.')}</span></div>
   <a href="https://artwin.kg/page35634666.html" target="_blank" rel="noopener noreferrer">{t('Meet ARTWIN')} <Icon name="external" size={17}/></a>
  </div>
  <section className="home-discover" aria-labelledby="home-discover-title">
   <div className="home-section-heading"><div><span className="collection-kicker">{t('START WITH A PLACE')}</span><h2 id="home-discover-title">{t('Your city. Your kind of space.')}</h2></div><a className="home-text-link" href={routeHref('/projects')}>{t('All projects')} <Icon name="arrow" size={18}/></a></div>
   <div className="home-destinations">
    {[
     {id:'bishkek',image:'urpaq-park',title:'Homes in Bishkek',copy:'From lively city streets to the mountain foothills.',href:routeHref('/projects?city=Bishkek&type=Residential'),count:homes.filter(p=>p.city==='Bishkek').length},
     {id:'osh',image:'boston-tower',title:'Homes in Osh',copy:'Discover ARTWIN addresses in the southern capital.',href:routeHref('/projects?city=Osh&type=Residential'),count:homes.filter(p=>p.city==='Osh').length},
     {id:'business',image:'seoul',title:'Space for your business',copy:'Explore the Seoul business centre and its commercial floor plans.',href:projectHref(project('seoul'))},
    ].map(item=><a className="home-destination" key={item.id} href={item.href}>
     <img src={projectImage(project(item.image))} alt={t('{project} — Artwin project view',{project:project(item.image).name})} loading="lazy" width="900" height="650"/>
     <div className="home-destination-copy"><span className="home-destination-eyebrow">{item.count?t('{count} residential projects',{count:number(item.count)}):t('Business centre')} <span>{project(item.image).name} · {t('Visualization')}</span></span><h3>{t(item.title)}</h3><p>{t(item.copy)}</p><span className="home-destination-arrow" aria-hidden="true"><Icon name="arrow"/></span></div>
    </a>)}
   </div>
  </section>
  <section className="home-journey" aria-labelledby="home-journey-title">
   <div className="home-section-heading"><div><span className="collection-kicker">{t('A CLEARER WAY TO CHOOSE')}</span><h2 id="home-journey-title">{t('Get to know your home before you visit.')}</h2></div><p>{t('Take your time. Compare what matters. Then talk to a person who can help.')}</p></div>
   <div className="home-steps">
    {[
     {icon:'pin',title:'Find your setting',copy:'Choose a city and explore the project, its surroundings and everyday spaces.',href:routeHref('/projects'),action:'Explore the projects'},
     {icon:'cube',title:'Look beyond the floor plan',copy:'Walk through furnished 3D previews. Save the layouts you like and compare them with your family.',href:routeHref('/finder'),action:'Explore the layouts'},
     {icon:'calendar',title:'Make your next move',copy:'Share your shortlist with an ARTWIN consultant to discuss current prices, availability and a visit.',href:'https://artwin.kg/schedule-call',action:'Talk to a consultant'},
    ].map((step,i)=><article key={step.title}><div className="home-step-number"><Icon name={step.icon}/><span>0{i+1}</span></div><h3>{t(step.title)}</h3><p>{t(step.copy)}</p><a href={step.href} onClick={()=>{if(i===2)track('booking_opened');}}>{t(step.action)} <Icon name="arrow" size={18}/></a></article>)}
   </div>
   <p className="home-preview-note">{t('3D interiors are illustrative previews. Confirm the available apartment, measurements and finishes with ARTWIN.')}</p>
  </section>
  <section className="home-life" aria-labelledby="home-life-title">
   <div className="home-section-heading"><div><span className="collection-kicker">{t('MORE THAN AN ADDRESS')}</span><h2 id="home-life-title">{t('Imagine the everyday.')}</h2></div><p>{t('A closer look at the spaces that make each project different.')}</p></div>
   <div className="home-stories">{homeStories.map(story=><a href={projectHref(project(story.projectId))} key={story.projectId}><div className="home-story-image"><img src={`${import.meta.env.BASE_URL}${story.file}`} alt={t(story.description)} loading="lazy" width="900" height="650"/><span>{project(story.projectId).name} · {t('Visualization')}</span></div><h3>{t(story.title)}</h3><p>{t(story.description)}</p><span className="home-text-link">{t('Discover the project')} <Icon name="arrow" size={18}/></span></a>)}</div>
  </section>
  <section className="home-consult" aria-labelledby="home-consult-title"><div><span className="collection-kicker">{t('LET’S TALK ABOUT YOUR PLANS')}</span><h2 id="home-consult-title">{t('A home is a personal choice. Let’s find yours.')}</h2><p>{t('Bring your questions or your shortlist. ARTWIN’s consultants can help with the next step.')}</p></div><ConsultationLink/></section>
 </main>;
}
