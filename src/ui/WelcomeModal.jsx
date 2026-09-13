import React,{useEffect,useState} from 'react';
import {projects,projectImage} from '../projects.js';
import {useI18n} from '../i18n.js';
import Modal from './Modal.jsx';
import LanguagePicker from './LanguagePicker.jsx';
import ConsultationLink from './ConsultationLink.jsx';
export default function WelcomeModal({onClose}){
  const {t}=useI18n(),[index,setIndex]=useState(0),[playing,setPlaying]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(()=>{if(!playing)return;const timer=setInterval(()=>setIndex(i=>(i+1)%projects.length),5000);return()=>clearInterval(timer);},[playing]);
  return <Modal onClose={onClose} labelledBy="welcome-title" className="welcome-dialog"><div className="welcome-slides" aria-hidden="true">{projects.map((project,i)=><img key={project.id} src={projectImage(project)} alt="" className={i===index?'active':''}/>)}</div><div className="welcome-shade"/><div className="welcome-language"><LanguagePicker/></div><div className="welcome-copy"><h2 id="welcome-title">{t('Would you like to book a consultation?')}</h2><p>{t('Our managers will help you find the best option and answer your questions.')}</p><ConsultationLink onClick={onClose}/></div><div className="welcome-slide-controls"><span>{projects[index].name}</span><div>{projects.map((p,i)=><button key={p.id} className={i===index?'active':''} aria-label={t('Show project {project}',{project:p.name})} aria-pressed={i===index} onClick={()=>setIndex(i)}/>)}</div><button className="slideshow-toggle" aria-label={t(playing?'Pause slideshow':'Play slideshow')} onClick={()=>setPlaying(v=>!v)}>{playing?'Ⅱ':'▶'}</button></div></Modal>;
}
