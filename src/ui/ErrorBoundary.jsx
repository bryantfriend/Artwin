import React from 'react';

// Outside the lazy scene chunk so even a failed chunk download is recoverable.
export default class ErrorBoundary extends React.Component {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error){console.error('Apartment loading failed:',error);}
  render(){return this.state.failed?<div className="viewer-error" role="alert"><span className="eyebrow">PLEASE TRY AGAIN</span><h2>The apartment could not load.</h2><p>Check your connection and enable browser hardware acceleration, then reload the viewer.</p><button className="primary-button" onClick={()=>window.location.reload()}>Reload viewer</button></div>:this.props.children;}
}
