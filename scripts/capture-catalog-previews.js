// Expand with node scripts/prepare-catalog-qa.mjs, then use playwright-cli run-code.
async (page)=>{
 const plans=__PLANS__,results=[],errors=[];
 const onError=e=>errors.push(String(e));page.on('pageerror',onError);
 try{
  await page.goto('about:blank');await page.setViewportSize({width:1580,height:1050});await page.emulateMedia({reducedMotion:'reduce'});
  for(const plan of plans){
   await page.goto(`http://127.0.0.1:4173/Artwin/#/projects/${plan.project}/apartments/${plan.id}`);
   if(plan===plans[0]){await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();}
   await page.waitForFunction(area=>document.title.includes(area),plan.area.toFixed(2));
   await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
   await page.locator('.quality-picker select').selectOption('high');
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const box=await page.locator('.experience canvas').boundingBox();
   await page.screenshot({path:`public/plans/${plan.id}.png`,style:'.compass{visibility:hidden!important}',clip:{x:box.x,y:box.y+box.height*.13,width:box.width,height:box.height*.72}});
   await page.locator('.tour-start').click();
   const stops=await page.locator('.tour-progress button').count();
   for(let i=0;i<stops;i++){
    await page.locator('.tour-progress button').nth(i).click();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(i===0||i===stops-1)await page.screenshot({path:`output/playwright/${plan.id}-tour-${i}.png`});
   }
   results.push({id:plan.id,stops});
  }
  if(errors.length)throw Error(errors.join('\n'));
  return {results,errors};
 }finally{page.off('pageerror',onError);}
}
