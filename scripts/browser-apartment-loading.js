async(page)=>{
 const base='http://127.0.0.1:4174/Artwin/',errors=[];
 const check=(v,m)=>{if(!v)throw Error(m);},onError=e=>errors.push(String(e));
 let releaseModule,releaseViewer;
 const moduleGate=new Promise(r=>releaseModule=r),viewerGate=new Promise(r=>releaseViewer=r);
 const moduleRoute=async r=>{await moduleGate;await r.continue();},viewerRoute=async r=>{await viewerGate;await r.continue();};
 const seek=async time=>page.locator('.apartment-build').evaluate((svg,time)=>{for(const animation of svg.getAnimations({subtree:true})){animation.pause();animation.currentTime=time;}},time);
 page.on('pageerror',onError);
 await page.route('**/assets/ApartmentExperience-*.js',moduleRoute);
 await page.route('**/assets/Viewer-*.js',viewerRoute);
 try{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'projects/tokyo-city/');
  await page.locator('.language-picker select').selectOption('en-US');
  await page.locator('[data-plan-id="two-room-euro-52"] .collection-button').click();
  await page.locator('.apartment-loader--page').waitFor();
  check(await page.locator('.collection-header').evaluate(e=>{const r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+10,r.y+10)?.closest('.collection-header');}),'Navigation remains visible during the first loading phase');
  await seek(1400);
  const partial=await page.locator('.apartment-build-floor').evaluateAll(nodes=>nodes.map(n=>Number(getComputedStyle(n).opacity)));
  check(partial[0]===1&&partial[2]===0,'Lower floors appear before upper floors');
  check(await page.locator('.apartment-loader-brand').evaluate(e=>getComputedStyle(e).opacity==='1'&&e.getAnimations().length===0),'ARTWIN logo stays steady');
  await page.screenshot({path:'output/playwright/apartment-loading-foundation.png'});
  await seek(4400);await page.screenshot({path:'output/playwright/apartment-loading-complete.png'});
  releaseModule();await page.locator('.experience .apartment-loader').waitFor();
  check(await page.locator('.apartment-loader').count()===1,'One loader during the viewer loading phase');
  await seek(4400);await page.screenshot({path:'output/playwright/apartment-loading-desktop.png'});
  for(const language of ['ru','ky','en-US','zh-CN']){
   await page.locator('.topbar select').selectOption(language);
   for(const width of [320,390,760,1440]){
    await page.setViewportSize({width,height:844});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow '+language+'/'+width);
    const loader=await page.locator('.apartment-loader').boundingBox(),content=await page.locator('.apartment-loader-content').boundingBox();
    check(content.y>=loader.y&&content.y+content.height<=loader.y+loader.height+1,'Loading content fits '+language+'/'+width);
    check(await page.locator('.apartment-build').evaluate(e=>{const r=e.getBoundingClientRect();return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.apartment-loader');}),'Animation is not covered by the floorplan drawer');
   }
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.topbar select').selectOption('ru');await seek(4400);
  await page.screenshot({path:'output/playwright/apartment-loading-mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  check(await page.locator('.apartment-build').evaluate(e=>e.getAnimations({subtree:true}).length===0),'Reduced motion stops the assembly loop');
  check(await page.locator('.apartment-build-floor').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).opacity==='1')),'Reduced motion shows a complete building');
  releaseViewer();await page.locator('.loading-overlay').waitFor({state:'hidden',timeout:60000});
  check(await page.locator('.viewer canvas').isVisible(),'Actual ready signal reveals the apartment');
  check(!errors.length,errors.join(';'));return {result:'PASS',phases:2,languages:4,widths:[320,390,760,1440],errors};
 }finally{
  releaseModule();releaseViewer();await page.unroute('**/assets/ApartmentExperience-*.js',moduleRoute);await page.unroute('**/assets/Viewer-*.js',viewerRoute);
  page.off('pageerror',onError);await page.emulateMedia({reducedMotion:'no-preference'});
 }
}
