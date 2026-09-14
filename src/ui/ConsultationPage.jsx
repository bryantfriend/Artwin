import React,{useEffect} from 'react';
import {useI18n} from '../i18n.js';
import {bookingUrl} from './ConsultationLink.jsx';

// Keep previously shared hash links working without duplicating Artwin's booking flow.
export default function ConsultationPage(){
  const {t}=useI18n();
  useEffect(()=>{window.location.replace(bookingUrl);},[]);
  return <main className="collection-missing"><h1>{t('Consultations')}</h1><a className="collection-button" href={bookingUrl}>{t('Official booking page')} ↗</a></main>;
}
