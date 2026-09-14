async(page)=>{
 const errors=[],sizes=[];
 const error=e=>errors.push(String(e)),message=m=>{if(m.type()==='error')errors.push(m.text());},response=r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);};
 const check=(v,m)=>{if(!v)throw Error(m);};
 page.on('pageerror',error);page.on('console',message);page.on('response',response);
 try{
  await page.goto('about:blank');await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city');
  await page.locator('.welcome-dialog .dialog-close').click();
  const cards=page.locator('.residence-card'),first=cards.first(),toggle=first.locator('.plan-details-toggle');
  for(const language of ['ru','ky','en-US','zh-CN']){
   await page.locator('.collection-header select').selectOption(language);
   for(const width of [320,390,600,760]){
    await page.setViewportSize({width,height:844});
    check(await cards.count()===6,'Six plans');
    for(const card of await cards.all()){
     check(!await card.locator('.residence-details').isVisible(),'Details start hidden');
     check(!await card.locator('.compare-choice').isVisible(),'Compare hidden until expanded');
     const b=await card.boundingBox();check(b.height<310,'Card too tall '+language+'/'+width+': '+b.height);
     check(await card.locator('.mobile-plan-area').isVisible(),'Area visible');
    }
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');
    const b=await toggle.boundingBox();check(b.height>=44&&b.width>=44,'Details touch target');
    sizes.push({language,width,height:Math.round((await first.boundingBox()).height)});
   }
   await page.setViewportSize({width:390,height:844});await first.scrollIntoViewIfNeeded();
   await page.screenshot({path:`output/playwright/compact-gallery-${language}.png`});
   await toggle.click();check(await first.locator('.residence-details').isVisible(),'Details open');
   check(!await cards.nth(1).locator('.residence-details').isVisible(),'Other cards stay closed');
   await first.locator('.compare-choice input').check();
   await toggle.click();check(!await first.locator('.residence-details').isVisible(),'Details collapse');
   await toggle.click();check(await first.locator('.compare-choice input').isChecked(),'Comparison preserved');
   await first.locator('.compare-choice input').uncheck();
   await page.screenshot({path:`output/playwright/expanded-gallery-${language}.png`});
   await toggle.click();
  }
  await first.locator('.preview-trigger').click();await page.locator('.preview-dialog').waitFor();
  await page.keyboard.press('Escape');check(await first.locator('.preview-trigger').evaluate(e=>document.activeElement===e),'Preview restores focus');
  await page.setViewportSize({width:1440,height:1000});
  check(await first.locator('.residence-details').isVisible(),'Desktop details visible');check(!await toggle.isVisible(),'Desktop toggle hidden');
  await page.setViewportSize({width:390,height:844});check(!await first.locator('.residence-details').isVisible(),'Mobile remains collapsed after resize');
  check(!errors.length,errors.join(';'));return {result:'PASS',sizes,errors};
 }finally{page.off('pageerror',error);page.off('console',message);page.off('response',response);}
}
