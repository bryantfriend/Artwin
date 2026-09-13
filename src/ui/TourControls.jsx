import {translate as t,useI18n} from '../i18n.js';
import React from 'react';
import { tourStops as defaultTourStops } from '../tourConfig.js';
export default function TourControls({tourStops=defaultTourStops,index,playing,complete,onToggle,onStep,onStop,onExplore}) {
  useI18n();
  const stop=tourStops[index];
  const playLabel=t(complete?'Replay tour':playing?'Pause tour':'Resume tour');
  return <section className="tour-card" aria-label={t("Guided apartment tour")}>
    <div className="tour-copy" aria-live="polite"><span className="eyebrow">{complete?t('TOUR COMPLETE'):`${t('GUIDED TOUR')} · ${String(index+1).padStart(2,'0')} / ${String(tourStops.length).padStart(2,'0')}`}</span><h2>{t(stop.title)}</h2><span className="tour-mobile-count">{index+1} / {tourStops.length}</span><p>{t(stop.description)}</p></div>
    <div className="tour-progress" aria-label={t("Tour stops")}>{tourStops.map((s,i)=><button key={s.room} aria-label={t('Tour stop {number}: {title}',{number:i+1,title:t(s.title)})} aria-current={i===index?'step':undefined} onClick={()=>onStep(i)}><span/></button>)}</div>
    <div className="tour-actions"><button aria-label={t("Previous tour stop")} disabled={index===0} onClick={()=>onStep(index-1)}>←</button><button className="tour-play" aria-label={playLabel} onClick={onToggle}><span className="tour-full-label">{playLabel}</span><span className="tour-mobile-label" aria-hidden="true">{complete?'↺':playing?'Ⅱ':'▶'}</span></button><button aria-label={t("Next tour stop")} disabled={index===tourStops.length-1} onClick={()=>onStep(index+1)}>→</button><button className="tour-explore" aria-label={t("Explore this room")} onClick={onExplore}><span className="tour-full-label">{t("Explore this room")}</span><span className="tour-mobile-label" aria-hidden="true">{t("Explore")}</span></button><button className="tour-close" onClick={onStop} aria-label={t("Exit guided tour")}>×</button></div>
  </section>;
}
