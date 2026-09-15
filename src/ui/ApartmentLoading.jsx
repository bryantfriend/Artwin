import React from 'react';
import {useI18n} from '../i18n.js';
import {basePath} from '../navigation.js';
import './ApartmentLoading.css';

function BuildingFloor({level}){
  const y=174-level*44;
  return <g className={`apartment-build-floor apartment-build-floor--${level}`}>
    <path d={`M230 ${y} 268 ${y-22}V${y+22}L230 ${y+44}Z`} fill="#d8dacf"/>
    <path d={`M104 ${y}H230V${y+44}H104Z`} fill="#faf9f4" stroke="#3d493e" strokeWidth="1.4"/>
    <path d={`M230 ${y} 268 ${y-22}V${y+22}L230 ${y+44}`} fill="none" stroke="#3d493e" strokeWidth="1.4"/>
    <path d={`M211 ${y}H222V${y+44}H211Z`} fill="#ffd000"/>
    {(level===0?[117,184]:[117,150,184]).map(x=><g key={x}>
      <rect x={x} y={y+11} width="18" height="23" rx=".7" fill="#34473e"/>
      <rect className="apartment-build-window" x={x+2} y={y+13} width="14" height="19" fill="#ffe5a0"/>
      <path d={`M${x+9} ${y+11}v23M${x} ${y+35}h19`} stroke="#34473e" strokeWidth="1.5"/>
    </g>)}
    <path d={`M241 ${y+7} 257 ${y-2}v22l-16 9Z`} fill="#536153"/>
    <path d={`M249 ${y+3}v23`} stroke="#d8dacf" strokeWidth="1.3"/>
    {level===0&&<><path d="M151 218v-29h25v29" fill="#34473e"/><path d="M155 193h17v21h-17Z" fill="#748377"/><path d="M166 202v6" stroke="#ffd000" strokeWidth="2"/></>}
  </g>;
}

function BuildingIllustration(){
  return <svg className="apartment-build" viewBox="0 0 360 270" aria-hidden="true" focusable="false">
    <circle cx="281" cy="58" r="13" fill="#f4dfa0" opacity=".6"/>
    <g fill="none" stroke="#dadfd2" strokeWidth="1">
      <path d="m52 230 77-44h161M71 246l78-45h155M92 254l77-44M92 208l151 42M125 190l161 40"/>
      <path d="M104 217V86h126v131m0-131 38-22v132M104 86l38-22h126" strokeDasharray="3 5"/>
    </g>
    <path className="apartment-build-foundation" d="M89 222h144l49-28H267M89 222v5h144l49-28v-5M233 222v5" fill="#e3e5d9" stroke="#a3ae99" strokeWidth="1.2"/>
    <g className="apartment-build-assembly">
      {[0,1,2].map(level=><BuildingFloor key={level} level={level}/>)}
      <g className="apartment-build-roof">
        <path d="M98 84h132l44-25H142Z" fill="#4c5b4e"/>
        <path d="M98 84v7h132V84Zm132 0 44-25v7l-44 25Z" fill="#283b31"/>
        <path d="M142 59h132l-44 25H98" fill="none" stroke="#6c7c68" strokeWidth="1.2"/>
        <path d="M213 84h11l44-25h-11Z" fill="#ffd000"/>
      </g>
    </g>
    <g className="apartment-build-landscape" stroke="#73836a" strokeWidth="1.5" fill="none">
      <path d="M74 229v-27m0 13-9-8m9 2 8-8"/>
      <path d="M62 194c-3-16 19-23 25-9 12 18-8 34-22 21-4-3-5-8-3-12Z" fill="#dfe5d3"/>
      <path d="M74 222v-26m0 11 7-6"/>
      <path d="M285 220v-11m0 6-5-5m5 2 5-7"/>
    </g>
    <path className="apartment-build-line" d="M47 235h265" stroke="#a6b297" strokeWidth="1" pathLength="1"/>
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
