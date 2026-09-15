async(page)=>{
 const errors=[],check=(v,m)=>{if(!v)throw Error(m);},base='http://127.0.0.1:4174/Artwin/';
 const onError=e=>errors.push(String(e));page.on('pageerror',onError);
 try{
  await page.setViewportSize({width:1440,height:1000});
  for(const [project,plan] of [['tokyo-city','two-room-euro-52'],['tokyo-city','four-room-134'],['london-square','london-four-room-131'],['wilton-park','wilton-three-room-92']]){
   await page.goto(base+`projects/${project}/apartments/${plan}/`);
   await page.locator('.loading-overlay').waitFor({state:'hidden',timeout:60000});
   await page.locator('.topbar select').selectOption('en-US');
   await page.getByRole('button',{name:'Hide furniture',exact:true}).click();
   check(await page.getByRole('button',{name:'Show furniture',exact:true}).getAttribute('aria-pressed')==='true',plan+' furniture hidden');
   check((await page.locator('.reference-note').innerText()).includes('Fixtures and finishes remain illustrative'),plan+' fixed finish context');
   if(plan==='two-room-euro-52')await page.screenshot({path:'output/playwright/showroom-unfurnished.png'});
   await page.getByRole('button',{name:'Show furniture',exact:true}).click();
   await page.getByLabel('Lighting atmosphere',{exact:true}).selectOption('evening');
   await page.getByRole('button',{name:'Take a guided tour',exact:true}).click();
   await page.locator('.tour-card').waitFor();
   await page.getByRole('button',{name:'Pause tour',exact:true}).click();
   await page.locator('.tour-progress button').nth(1).click();
   await page.waitForTimeout(800);
   if(plan==='two-room-euro-52')await page.screenshot({path:'output/playwright/showroom-evening-tour.png'});
   await page.getByLabel('Lighting atmosphere',{exact:true}).selectOption('day');
   if(plan==='two-room-euro-52'){
    await page.screenshot({path:'output/playwright/showroom-day-tour.png'});
    for(const lang of ['ru','ky','en-US','zh-CN']){
     await page.locator('.topbar select').selectOption(lang);
     for(const width of [320,390]){
      await page.setViewportSize({width,height:844});
      check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Viewer overflow '+lang+'/'+width);
      check(await page.locator('.mobile-project-back').isVisible(),'Mobile back retained');
      const controls=await page.locator('.showroom-view-controls').boundingBox(),mode=await page.locator('.mode-switch').boundingBox();
      check(controls.y>=mode.y+mode.height-1,'Viewer controls do not cover the mode switch');
     }
    }
    await page.locator('.topbar select').selectOption('en-US');await page.screenshot({path:'output/playwright/showroom-tour-mobile.png'});await page.setViewportSize({width:1440,height:1000});
   }
   await page.getByRole('button',{name:'Exit guided tour',exact:true}).click();
   await page.getByRole('button',{name:'Walkthrough',exact:true}).click();
   await page.getByRole('button',{name:'Hide furniture',exact:true}).click();
   await page.waitForTimeout(400);
   check(!await page.locator('.viewer-error').count(),plan+' walkthrough remains available');
  }
  check(!errors.length,errors.join(';'));return {result:'PASS',layouts:4,errors};
 }finally{page.off('pageerror',onError);}
}
