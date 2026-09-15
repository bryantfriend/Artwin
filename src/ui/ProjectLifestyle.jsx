import React,{useEffect,useId,useRef,useState} from 'react';
import {useI18n} from '../i18n.js';
import {projectLifestyle} from '../projectLifestyle.js';
import {projectDetails} from '../projectDetails.js';
import {basePath} from '../navigation.js';
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import './ProjectLifestyle.css';

export default function ProjectLifestyle({project}){
 const {t}=useI18n(),id=useId(),track=useRef(),[selected,setSelected]=useState(null),[paging,setPaging]=useState({previous:false,next:false});
 const images=projectLifestyle[project.id]||[],info=projectDetails[project.id];
 const remaining=(info?.features||[]).filter(feature=>!images.some(image=>image.features.includes(feature)));
 const pictureLabel=image=>t(image.kind==='illustration'?'Illustrative image · ARTWIN':'Project rendering · ARTWIN');
 const move=direction=>{
  const node=track.current,card=node?.querySelector('article');
  if(node&&card)node.scrollBy({left:direction*(card.getBoundingClientRect().width+20),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 };
 useEffect(()=>{
  const node=track.current;if(!node)return;
  const update=()=>setPaging(current=>{
   const previous=node.scrollLeft>2,next=node.scrollLeft+node.clientWidth<node.scrollWidth-3;
   return current.previous===previous&&current.next===next?current:{previous,next};
  });
  const observer=new ResizeObserver(update);observer.observe(node);node.addEventListener('scroll',update,{passive:true});update();
  return()=>{observer.disconnect();node.removeEventListener('scroll',update);};
 },[project.id]);
 if(!images.length)return null;
 const active=selected===null?null:images[selected];
 return <section className="project-lifestyle" aria-labelledby={`${id}-heading`}>
  <div className="lifestyle-heading">
   <div><span className="collection-kicker">{t('SPACES FOR YOUR EVERYDAY')}</span><h3 id={`${id}-heading`}>{t(project.id==='seoul'?'Working life in this project':'Life in this project')}</h3><p>{t('Explore the spaces that make this address special.')}</p></div>
   {images.length>1&&<div className="lifestyle-controls"><button onClick={()=>move(-1)} disabled={!paging.previous} aria-label={t('Previous spaces')} aria-controls={`${id}-track`}>←</button><button onClick={()=>move(1)} disabled={!paging.next} aria-label={t('Next spaces')} aria-controls={`${id}-track`}>→</button></div>}
  </div>
  <div className={`lifestyle-track${images.length===1?' lifestyle-track--single':''}`} id={`${id}-track`} ref={track} tabIndex={0} role="region" aria-label={t('Project spaces')} onKeyDown={event=>{
   if(event.target===event.currentTarget&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}
  }}>
   {images.map((image,index)=><article className="lifestyle-card" key={image.file}>
    <button className="lifestyle-image" onClick={()=>setSelected(index)} aria-label={t('Enlarge {space}',{space:t(image.title)})}>
     <img src={`${basePath}${image.file}`} alt={`${project.name} · ${t(image.title)}`} loading="lazy" decoding="async" width="900" height="675"/>
     <span className="lifestyle-image-label">{pictureLabel(image)}</span><span className="lifestyle-enlarge" aria-hidden="true"><Icon name="expand" size={18}/></span>
    </button>
    <div className="lifestyle-caption"><span className="lifestyle-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><h4>{t(image.title)}</h4><p>{t(image.description)}</p></div></div>
   </article>)}
  </div>
  <div className="lifestyle-footer"><p>{t('Tap a picture to explore. Swipe for more spaces.')}</p><a className="buyer-link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('About the project on Artwin')} ↗</a></div>
  {remaining.length>0&&<details className="lifestyle-more"><summary>{t('More project details')}</summary><div className="lifestyle-facts">{remaining.map(feature=><span key={feature}>{t(feature)}</span>)}</div></details>}
  {active&&<Modal className="lifestyle-dialog" labelledBy={`${id}-dialog-heading`} onClose={()=>setSelected(null)}>
   <span className="collection-kicker">{project.name}</span><h2 id={`${id}-dialog-heading`}>{t(active.title)}</h2>
   <img className="lifestyle-full-image" src={`${basePath}${active.file}`} alt={`${project.name} · ${t(active.title)}`}/>
   <div className="lifestyle-modal-caption"><div><p>{t(active.description)}</p><small>{pictureLabel(active)}</small></div>{images.length>1&&<div className="lifestyle-controls"><button aria-label={t('Previous image')} onClick={()=>setSelected((selected+images.length-1)%images.length)}>←</button><span aria-live="polite">{selected+1} / {images.length}</span><button aria-label={t('Next image')} onClick={()=>setSelected((selected+1)%images.length)}>→</button></div>}</div>
   <p className="buyer-muted">{t('Imagery from Artwin’s presentation. Renderings and illustrative photos show the concept, not the current construction status.')}</p>
   <a className="buyer-link" href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('View the official project presentation')} ↗</a>
  </Modal>}
 </section>;
}
