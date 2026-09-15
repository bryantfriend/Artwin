import React from 'react';
import {translate as t,useI18n} from '../i18n.js';
import Icon from './Icon.jsx';
import './MotionControls.css';

export default function MotionControls({motion}) {
  useI18n();
  if(!motion.available)return null;
  const active=motion.status==='active',waiting=motion.status==='requesting';
  return <div className="motion-controls" role="group" aria-label={t('Phone motion controls')}>
    <button className="motion-toggle" aria-pressed={active} aria-label={t(waiting?'Cancel motion connection':active?'Disable motion look':'Enable motion look')} onClick={motion.toggle}>
      <Icon name="motion" size={19}/><span>{t(waiting?'Connecting…':active?'Motion on':'Motion look')}</span>
    </button>
    {active&&<button className="motion-recenter" onClick={motion.recenter} aria-label={t('Recenter motion')} title={t('Recenter motion')}><Icon name="center" size={20}/></button>}
  </div>;
}
