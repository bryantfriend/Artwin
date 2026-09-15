// No sensor access until start() is called by the user's motion-control button.
export function canOfferMotion(target) {
  return Boolean(target?.isSecureContext && target.DeviceOrientationEvent &&
    (target.navigator?.maxTouchPoints > 0 || target.matchMedia?.('(any-pointer: coarse)').matches));
}

export function validOrientation(event) {
  return [event.alpha,event.beta,event.gamma].every(Number.isFinite);
}

export function createOrientationSession(target,onStatus=()=>{},timeoutMs=6000) {
  const document=target.document;
  let status='off',sample=null,revision=0,attempt=0,timer=null,listening=false;
  const report=next=>{if(status!==next){status=next;onStatus(next);}};
  const clearTimer=()=>{if(timer!==null)target.clearTimeout(timer);timer=null;};
  const recenter=()=>{sample=null;revision++;};
  const screenAngle=()=>target.screen?.orientation?.angle ?? target.orientation ?? 0;
  function reading(event) {
    if(document.hidden || !validOrientation(event))return;
    sample={alpha:event.alpha,beta:event.beta,gamma:event.gamma,screenAngle:screenAngle(),revision};
    clearTimer();report('active');
  }
  function armTimeout() {
    clearTimer();
    if(!document.hidden)timer=target.setTimeout(()=>stop('unavailable'),timeoutMs);
  }
  function visibility() {
    recenter();clearTimer();
    // Stop sampling while the page is in the background.
    target.removeEventListener('deviceorientation',reading);
    if(!document.hidden){target.addEventListener('deviceorientation',reading);armTimeout();}
  }
  function stop(next='off') {
    attempt++;clearTimer();recenter();
    if(listening){
      target.removeEventListener('deviceorientation',reading);
      target.removeEventListener('orientationchange',recenter);
      target.screen?.orientation?.removeEventListener('change',recenter);
      document.removeEventListener('visibilitychange',visibility);
      listening=false;
    }
    report(next);
  }
  async function start() {
    stop();
    if(!target.isSecureContext || !target.DeviceOrientationEvent){report('unavailable');return;}
    const current=attempt;report('requesting');
    try {
      // Keep this call before any await: Safari requires the original button gesture.
      const permission=typeof target.DeviceOrientationEvent.requestPermission==='function'
        ? await target.DeviceOrientationEvent.requestPermission() : 'granted';
      if(current!==attempt)return;
      if(permission!=='granted'){stop('denied');return;}
      listening=true;
      target.addEventListener('orientationchange',recenter);
      target.screen?.orientation?.addEventListener('change',recenter);
      document.addEventListener('visibilitychange',visibility);
      visibility();
    }catch{if(current===attempt)stop('denied');}
  }
  return {start,stop,recenter,get sample(){return sample;},get status(){return status;}};
}
