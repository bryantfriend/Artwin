async (page)=>{
 const errors=[],missing=[],results=[];
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 const onError=e=>errors.push(String(e)),onResponse=r=>{if(r.status()>=400)missing.push(`${r.status()} ${r.url()}`);};
 page.on('pageerror',onError);page.on('response',onResponse);
 try{
  await page.goto('about:blank');await page.setViewportSize({width:390,height:844});
  for(const [id,count] of [['urpaq-park',9],['hayat',5],['esentai',10],['tokyo',7],['boston-tower',11]]){
   await page.goto(`http://127.0.0.1:4173/Artwin/#/projects/${id}`);await page.reload();
   await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();
   check(await page.locator('.residence-card').count()===count,`${id}: incorrect card count`);
   for(const locale of ['ru','ky','zh-CN','en-US']){
    await page.locator('.collection-header .language-picker select').selectOption(locale);
    const heights=await page.locator('.residence-card').evaluateAll(cards=>cards.map(c=>c.getBoundingClientRect().height));
    check(heights.every(h=>h<340),`${id}/${locale}: mobile cards too tall`);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${id}/${locale}: horizontal overflow`);
   }
   await page.locator('.residence-card').first().scrollIntoViewIfNeeded();await page.screenshot({path:`output/playwright/${id}-mobile-gallery.png`});
   const first=page.locator('.residence-card').first();
   await first.locator('.preview-trigger').click();
   await page.locator('.source-reference summary').click();
   await page.locator('.source-reference img').evaluate(img=>img.decode());
   check(await page.locator('.source-reference img').evaluate(img=>img.naturalWidth>500),'Reference image failed');
   await page.keyboard.press('Escape');
   await first.locator('.plan-details-toggle').click();
   check(await first.locator('.plan-details-toggle').getAttribute('aria-expanded')==='true','Details did not expand');
   await first.locator('.residence-actions a').click();
   await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
   const back=await page.locator('.mobile-project-back').boundingBox();check(back&&back.x>=0&&back.x+back.width<=390,'Mobile back button hidden');
   await page.locator('.tour-start').click();check((await page.locator('.tour-card').boundingBox()).height<130,'Tour obscures mobile scene');
   await page.screenshot({path:`output/playwright/${id}-mobile-tour.png`});
   await page.getByRole('button',{name:'Exit guided tour',exact:true}).click();
   await page.locator('.enter-button').click();
   const rooms=await page.locator('.room-picker option').evaluateAll(options=>options.filter(o=>o.value).map(o=>({id:o.value,name:o.textContent})));
   for(const room of rooms){await page.locator('.room-picker select').selectOption(room.id);await page.waitForFunction(name=>document.querySelector('.scene-title h2')?.textContent===name&&!document.querySelector('.transition-fade.active'),room.name,{timeout:15000});check(!await page.locator('.toast').count(),`${id}: room navigation obstructed`);}
   await page.locator('.mobile-project-back').click();results.push({id,count,walkthroughRooms:rooms.length});
  }
  await page.goto('http://127.0.0.1:4173/Artwin/#/projects/seoul');
  check(await page.locator('.commercial-browser nav button').count()===12,'Seoul must have 12 floors');
  for(let i=0;i<12;i++){await page.locator('.commercial-floor-select select').selectOption(String(i+1));await page.locator('.commercial-image img').evaluate(img=>img.decode());check(await page.locator('.commercial-image img').evaluate(img=>img.naturalWidth>800),'Seoul floor image missing');}
  await page.locator('.commercial-plans').scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/seoul-mobile.png'});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Seoul mobile overflow');
  await page.locator('.commercial-image').click();check(await page.locator('.official-plan-dialog').count()===1,'Seoul enlargement failed');await page.keyboard.press('Escape');
  await page.goto('http://127.0.0.1:4173/Artwin/#/projects/french-house');
  check(await page.locator('.requested-plans .consultation-link').getAttribute('href')==='https://artwin.kg/schedule-call','French House consultation target incorrect');
  check(await page.locator('.residence-card').count()===0,'French House must not invent layouts');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'French House mobile overflow');
  await page.goto('http://127.0.0.1:4173/Artwin/#/finder');
  await page.getByRole('combobox',{name:'Bedrooms',exact:true}).selectOption('0');
  check(await page.locator('.finder-result').count()===8,'One-room finder filter incorrect');
  await page.getByRole('combobox',{name:'Bedrooms',exact:true}).selectOption('4');check(await page.locator('.finder-result').count()===1,'Four-bedroom filter incorrect');
  check(!errors.length,errors.join('\n'));check(!missing.length,missing.join('\n'));
  return {results,seoulFloors:12,languages:4,errors,missing};
 }finally{page.off('pageerror',onError);page.off('response',onResponse);}
}
