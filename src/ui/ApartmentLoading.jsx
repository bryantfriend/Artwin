import React from 'react';
import {useI18n} from '../i18n.js';
import {basePath} from '../navigation.js';
import './ApartmentLoading.css';

function BuildingFloor({level}){
  const y=174-level*44;
  return <g className={`apartment-build-floor apartment-build-floor--${level}`}>
    <path d={`M230 ${y} 268 ${y-22}V${y+22}L230 ${y+44}Z`} fill="var(--artwin-border)"/>
    <path d={`M104 ${y}H230V${y+44}H104Z`} fill="var(--artwin-white)" stroke="var(--artwin-charcoal)" strokeWidth="1.4"/>
    <path d={`M230 ${y} 268 ${y-22}V${y+22}L230 ${y+44}`} fill="none" stroke="var(--artwin-charcoal)" strokeWidth="1.4"/>
    <path d={`M211 ${y}H222V${y+44}H211Z`} fill="var(--artwin-yellow)"/>
    {(level===0?[117,184]:[117,150,184]).map(x=><g key={x}>
      <rect x={x} y={y+11} width="18" height="23" rx=".7" fill="var(--artwin-charcoal)"/>
      <rect className="apartment-build-window" x={x+2} y={y+13} width="14" height="19" fill="var(--artwin-yellow-soft)"/>
      <path d={`M${x+9} ${y+11}v23M${x} ${y+35}h19`} stroke="var(--artwin-charcoal)" strokeWidth="1.5"/>
    </g>)}
    <path d={`M241 ${y+7} 257 ${y-2}v22l-16 9Z`} fill="var(--artwin-text)"/>
    <path d={`M249 ${y+3}v23`} stroke="var(--artwin-border)" strokeWidth="1.3"/>
    {level===0&&<><path d="M151 218v-29h25v29" fill="var(--artwin-charcoal)"/><path d="M155 193h17v21h-17Z" fill="var(--artwin-subtle)"/><path d="M166 202v6" stroke="var(--artwin-yellow)" strokeWidth="2"/></>}
  </g>;
}

function BuildingIllustration(){
  return <svg className="apartment-build" viewBox="0 0 360 270" aria-hidden="true" focusable="false">
    <circle cx="281" cy="58" r="13" fill="var(--artwin-yellow)" opacity=".6"/>
    <g fill="none" stroke="var(--artwin-border)" strokeWidth="1">
      <path d="m52 230 77-44h161M71 246l78-45h155M92 254l77-44M92 208l151 42M125 190l161 40"/>
      <path d="M104 217V86h126v131m0-131 38-22v132M104 86l38-22h126" strokeDasharray="3 5"/>
    </g>
    <path className="apartment-build-foundation" d="M89 222h144l49-28H267M89 222v5h144l49-28v-5M233 222v5" fill="var(--artwin-surface-deep)" stroke="var(--artwin-subtle)" strokeWidth="1.2"/>
    <g className="apartment-build-assembly">
      {[0,1,2].map(level=><BuildingFloor key={level} level={level}/>)}
      <g className="apartment-build-roof">
        <path d="M98 84h132l44-25H142Z" fill="var(--artwin-text)"/>
        <path d="M98 84v7h132V84Zm132 0 44-25v7l-44 25Z" fill="var(--artwin-charcoal)"/>
        <path d="M142 59h132l-44 25H98" fill="none" stroke="var(--artwin-muted)" strokeWidth="1.2"/>
        <path d="M213 84h11l44-25h-11Z" fill="var(--artwin-yellow)"/>
      </g>
    </g>
    <g className="apartment-build-landscape" stroke="var(--artwin-muted)" strokeWidth="1.5" fill="none">
      <path d="M74 229v-27m0 13-9-8m9 2 8-8"/>
      <path d="M62 194c-3-16 19-23 25-9 12 18-8 34-22 21-4-3-5-8-3-12Z" fill="var(--artwin-yellow-soft)"/>
      <path d="M74 222v-26m0 11 7-6"/>
      <path d="M285 220v-11m0 6-5-5m5 2 5-7"/>
    </g>
    <path className="apartment-build-line" d="M47 235h265" stroke="var(--artwin-subtle)" strokeWidth="1" pathLength="1"/>
  </svg>;
}

export default function ApartmentLoading({standalone=false,contextLost=false,selection=''}){
  const {t}=useI18n();
  return <div className={`loading-overlay apartment-loader${standalone?' apartment-loader--page':''}${contextLost?' apartment-loader--still':''}`}>
    <div className="apartment-loader-content">
      <img className="apartment-loader-brand" src={`${basePath}artwin-logo.png`} alt="ARTWIN" width="287" height="88"/>
      <BuildingIllustration/>
      <div className="apartment-loader-message" role="status" aria-live="polite" aria-atomic="true">
        <h2>{t(contextLost?'The graphics connection was lost.':'Making room for you.')}</h2>
        <p>{t(contextLost?'Reload to restore the apartment.':'Preparing your virtual tour…')}</p>
      </div>
      {selection&&<span className="apartment-loader-selection">{selection}</span>}
      {contextLost&&<button className="primary-button" onClick={()=>location.reload()}>{t('Reload viewer')}</button>}
    </div>
  </div>;
}
