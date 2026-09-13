import {useI18n} from '../i18n.js';
import React from 'react';

function LoadingFailure(){
  const {t}=useI18n();
  return <div className="viewer-error" role="alert"><span className="eyebrow">{t('PLEASE TRY AGAIN')}</span><h2>{t('The apartment could not load.')}</h2><p>{t('Check your connection and enable browser hardware acceleration, then reload the viewer.')}</p><button className="primary-button" onClick={()=>window.location.reload()}>{t('Reload viewer')}</button></div>;
}

// Outside the lazy scene chunk so even a failed chunk download is recoverable.
export default class ErrorBoundary extends React.Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.error('Apartment loading failed:',error);}
  render(){return this.state.failed?<LoadingFailure/>:this.props.children;}
}
