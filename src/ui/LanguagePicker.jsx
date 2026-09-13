import React from 'react';
import Icon from './Icon.jsx';
import {languages,useI18n} from '../i18n.js';
export default function LanguagePicker(){
  const {t,language,setLanguage}=useI18n();
  return <label className="language-picker" title={t('Choose language')}>
    <Icon name="globe" size={20}/><span aria-hidden="true">{languages.find(l=>l.id===language).short}</span>
    <select aria-label={t('Choose language')} value={language} onChange={e=>setLanguage(e.target.value)}>{languages.map(l=><option key={l.id} value={l.id} lang={l.id}>{l.label}</option>)}</select>
  </label>;
}
