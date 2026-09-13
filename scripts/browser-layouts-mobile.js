// Run in a Playwright CLI session opened with --mobile.
async(page)=>{
 const errors=[],failed=[],onError=e=>errors.push(String(e)),onConsole=m=>{if(m.type()==='error')errors.push(m.text());},onFailed=r=>failed.push(r.url());
 page.on('pageerror',onError);page.on('console',onConsole);page.on('requestfailed',onFailed);
 const check=(v,m)=>{if(!v)throw Error(m);},base='http://127.0.0.1:4173/Artwin/',results=[];
 try{
  for(const width of [320,390]){
   await page.setViewportSize({width,height:844});await page.goto(base+'#/projects/tokyo-city');await page.reload();await page.locator('.apartment-card').first().waitFor();
   check(await page.locator('.apartment-card').count()===6,'Missing mobile plans');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile collection overflow');
   await page.getByRole('button',{name:'3 bedrooms',exact:true}).click();check(await page.locator('.apartment-card').count()===1,'Mobile bedroom filter');
   await page.getByRole('button',{name:'All floor plans',exact:true}).click();
   await page.locator('.project-plans').screenshot({path:`output/playwright/plans-mobile-${width}.png`});
  }
  for(const [id,area] of [['two-room-euro-52','52.10'],['three-room-euro-82','82.30']]){
   await page.goto(base+'#/projects/tokyo-city/apartments/'+id);
   await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,{},{timeout:60000});
   await page.screenshot({path:`output/playwright/${id}-mobile-dollhouse.png`});
   await page.getByRole('button',{name:'Take a guided tour',exact:true}).click({noWaitAfter:true});await page.getByRole('button',{name:'Pause tour',exact:true}).click({noWaitAfter:true});
   const card=await page.locator('.tour-card').boundingBox();check(card.height<=100,'Tour card too tall');
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile viewer overflow');
   await page.getByRole('button',{name:'Next tour stop',exact:true}).click({noWaitAfter:true});
   await page.waitForFunction(()=>{const fade=document.querySelector('.tour-scene-fade');return fade&&Number(getComputedStyle(fade).opacity)<.01;});await page.screenshot({path:`output/playwright/${id}-mobile-tour.png`});
   await page.getByRole('button',{name:'Explore this room',exact:true}).click({noWaitAfter:true});await page.waitForTimeout(600);
   await page.getByRole('heading',{name:id==='two-room-euro-52'?'Bedroom':'Bedroom 01',exact:true}).waitFor();
   check(!await page.locator('.toast').count(),'Tour to room handoff obstructed');
   await page.locator('.plan-heading').click();await page.locator('.plan-player').waitFor();
   await page.locator('.floor-plan [role=button]').filter({has:page.locator('title')}).first().click();await page.waitForTimeout(600);
   check(await page.locator('.plan-heading').getAttribute('aria-expanded')==='false','Mobile plan should close after selecting room');
   await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Landscape overflow');
   await page.setViewportSize({width:390,height:844});
   await page.getByRole('link',{name:'Back to Tokyo City floor plans',exact:true}).click();await page.locator('.apartment-card').first().waitFor();check(!await page.locator('canvas').count(),'Viewer retained after exiting');
   results.push({area,tourCardHeight:card.height});
  }
  check(!errors.length&&!failed.length,JSON.stringify({errors,failed}));return {result:'PASS',results,errors,failed,device:'Chromium touchscreen emulation'};
 }finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('requestfailed',onFailed);}
}
