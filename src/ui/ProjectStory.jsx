import React,{useState} from 'react';
import {useI18n} from '../i18n.js';
import {projectDetails} from '../projectDetails.js';
import {projectMedia} from '../projectMedia.js';
import {basePath} from '../navigation.js';
import Modal from './Modal.jsx';

export function ProjectGallery({project,compact=false}){
 const {t}=useI18n(),[open,setOpen]=useState(false),[index,setIndex]=useState(0);
 const images=projectMedia[project.id]||[];
 if(!images.length)return null;
 const selected=images[index];
 return <><button className={compact?'gallery-open':'story-gallery-open'} onClick={()=>setOpen(true)}>{t('Explore the project gallery')} <span>{images.length} ↗</span></button>{!compact&&<div className="story-mosaic">{images.slice(0,3).map((item,i)=><button key={item.file} onClick={()=>{setIndex(i);setOpen(true);}} aria-label={t('View image {number}',{number:i+1})}><img src={`${basePath}gallery/${item.file}`} loading="lazy" alt={t(item.label)}/><span>{t(item.label)}</span></button>)}</div>}{open&&<Modal className="project-gallery-dialog" labelledBy="project-gallery-title" onClose={()=>setOpen(false)}><span className="collection-kicker">{project.name}</span><h2 id="project-gallery-title">{t(selected.label)}</h2><img className="gallery-main-image" src={`${basePath}gallery/${selected.file}`} alt={`${project.name} · ${t(selected.label)}`}/><div className="gallery-paging"><button className="buyer-secondary" aria-label={t('Previous image')} onClick={()=>setIndex((index+images.length-1)%images.length)}>←</button><span aria-live="polite">{index+1} / {images.length}</span><button className="buyer-secondary" aria-label={t('Next image')} onClick={()=>setIndex((index+1)%images.length)}>→</button></div><div className="gallery-thumbnails">{images.map((item,i)=><button aria-label={t('View image {number}',{number:i+1})} aria-pressed={i===index} key={item.file} onClick={()=>setIndex(i)}><img loading="lazy" src={`${basePath}gallery/${item.file}`} alt=""/></button>)}</div><p className="buyer-muted">{t('Official project imagery. Renderings illustrate the design and do not confirm construction progress.')}</p><a className="buyer-link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('View the official project presentation')} ↗</a></Modal>}</>;
}
export default function ProjectStory({project}){
 const {t}=useI18n(),features=projectDetails[project.id]?.features||[];
 return <section className="project-story" id="project-story"><div className="story-heading"><span className="collection-kicker">{t('A PLACE TO BELONG')}</span><h2>{t(project.id==='seoul'?'A setting for your business':'More than your apartment')}</h2><p>{t(project.description)}</p></div><div className="story-features">{features.slice(0,3).map((feature,i)=><article key={feature}><span>0{i+1}</span><h3>{t(feature)}</h3></article>)}</div><ProjectGallery project={project}/></section>;
}
