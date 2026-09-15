import React from 'react';
import {useI18n} from '../i18n.js';
import {neighbourhoodCategories,nearbyMapHref,projectMapHref} from '../projectMaps.js';
import Icon from './Icon.jsx';
import './ProjectNeighbourhood.css';

export default function ProjectNeighbourhood({project}){
 const {t}=useI18n();
 return <details className="neighbourhood-panel neighbourhood-2gis">
  <summary>{t('Neighbourhood and travel')}</summary>
  <div className="neighbourhood-content">
   <div className="neighbourhood-address">
    <span className="neighbourhood-pin"><Icon name="pin" size={25}/></span>
    <div><span className="neighbourhood-city">{t(project.city)}, {t('Kyrgyzstan')}</span><h3>{project.name}</h3><p>{t(project.address)}</p></div>
    <span className="neighbourhood-provider" aria-hidden="true">2GIS</span>
   </div>
   <a className="neighbourhood-open" href={projectMapHref(project)} target="_blank" rel="noopener noreferrer"><span>{t('Open project in 2GIS')}</span><Icon name="external" size={19}/></a>
   <p className="neighbourhood-route-hint">{t('Choose your starting point and transport in 2GIS.')}</p>
   <div className="neighbourhood-nearby">
    <h4>{t('Explore nearby')}</h4>
    <nav className="neighbourhood-links" aria-label={t('Search the area in 2GIS')}>
     {neighbourhoodCategories.map(category=><a key={category.id} href={nearbyMapHref(project,category.id)} target="_blank" rel="noopener noreferrer"><Icon name={category.icon} size={19}/><span>{t(category.label)}</span><Icon name="external" size={13}/></a>)}
    </nav>
    <p className="neighbourhood-search-hint">{t('2GIS searches use the published address. Confirm your destination there.')}</p>
   </div>
  </div>
 </details>;
}
