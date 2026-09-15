export const basePath=import.meta.env?.BASE_URL||'/Artwin/';
export function routeHref(path='/projects'){
  const [pathname,search]=path.replace(/^#/, '').split('?');
  const segment=pathname.replace(/^\/+|\/+$/g,'');
  return `${basePath}${segment?segment+'/':''}${search?`?${search}`:''}`;
}
export function presentationHref(keys=[]){return routeHref(`/presentation?${new URLSearchParams({plans:[...new Set(keys)].slice(0,3).join(',')})}`);}
export function routeLocation(location=window.location){
  return location.hash.startsWith('#/')?location.hash:location.pathname.replace(new RegExp(`^${basePath}`),'/')+location.search;
}
export function normalizeLegacyLocation(){
  if(window.location.hash.startsWith('#/'))history.replaceState(history.state,'',routeHref(window.location.hash));
}
// Native links remain crawlable and work without JavaScript. Only ordinary in-app
// clicks use client navigation; downloads, fragments and new-tab gestures stay native.
export function installNavigation(onChange){
  normalizeLegacyLocation();
  const change=()=>{normalizeLegacyLocation();onChange(routeLocation());};
  const click=e=>{
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    const a=e.target.closest?.('a[href]');
    if(!a||a.target||a.hasAttribute('download'))return;
    const url=new URL(a.href,location.href);
    if(url.origin!==location.origin||!url.pathname.startsWith(basePath)||url.hash||/\.[a-z0-9]+$/i.test(url.pathname))return;
    e.preventDefault();
    if(url.href===location.href)return;
    history.pushState(null,'',url.pathname+url.search);change();
  };
  window.addEventListener('popstate',change);window.addEventListener('hashchange',change);document.addEventListener('click',click);
  return()=>{window.removeEventListener('popstate',change);window.removeEventListener('hashchange',change);document.removeEventListener('click',click);};
}
