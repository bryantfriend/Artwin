// Run prepare-interior-previews.mjs, then each generated batch with playwright-cli.
async(page)=>{
 const plans=__PLANS__,errors=[],results=[];
 const error=e=>errors.push(String(e));page.on('pageerror',error);
 try{
  await page.goto('about:blank');await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1580,height:1050});
  for(const plan of plans){
   await page.goto(`http://127.0.0.1:4174/Artwin/projects/${plan.project}/apartments/${plan.id}/`,{waitUntil:'domcontentloaded'});
   await page.locator('.loading-overlay').waitFor({state:'hidden',timeout:90000});
   await page.locator('.enter-button:not([disabled])').waitFor({timeout:90000});
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const canvas=page.locator('.experience canvas'),box=await canvas.boundingBox();
   await page.screenshot({path:`public/plans/${plan.id}.png`,style:'.compass,.scene-label,.showroom-view-controls,.mode-switch,.viewer-tools,.scene-bottom{visibility:hidden!important}',clip:{x:box.x,y:box.y+box.height*.13,width:box.width,height:box.height*.72}});
   if(plan.inspect){
    await page.locator('.topbar select').selectOption('en-US');await page.locator('.tour-start').click();
    await page.locator('.tour-card').waitFor();
    for(const i of [0,Math.min(1,await page.locator('.tour-progress button').count()-1)]){
     await page.locator('.tour-progress button').nth(i).click();
     await page.screenshot({path:`output/playwright/interior-${plan.id}-tour-${i}.png`});
    }
   }
   results.push(plan.id);
  }
  if(errors.length)throw Error(errors.join('\n'));
  return {result:'PASS',previews:results,errors};
 }finally{page.off('pageerror',error);}
}
