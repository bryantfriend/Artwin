// Playwright CLI run-code against the strict production /Artwin/ server.
async (page) => {
 const errors=[],missing=[],results=[];
 const onError=e=>errors.push(String(e)),onConsole=m=>{if(m.type()==='error')errors.push(m.text());},onResponse=r=>{if(r.status()>=400)missing.push(`${r.status()} ${r.url()}`);};
 page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);
 const check=(condition,message)=>{if(!condition)throw Error(message);};
 try{
  await page.goto('about:blank');await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  for(const id of ['london-two-room-71','london-studio-100','london-three-room-110','london-four-room-131']){
   await page.goto(`http://127.0.0.1:4173/Artwin/#/projects/london-square/apartments/${id}`);await page.reload();
   await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();
   await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
   check(!(await page.locator('.floor-plan').textContent()).includes('NaN'),'Invalid area label');
   await page.locator('.tour-start').click();
   const stops=await page.locator('.tour-progress button').count();
   for(let i=0;i<stops;i++){
    await page.locator('.tour-progress button').nth(i).click();
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(i===0||i===stops-2)await page.screenshot({path:`output/playwright/${id}-tour-${i}.png`});
   }
   await page.getByRole('button',{name:'Exit guided tour',exact:true}).click();
   await page.locator('.enter-button').click();
   const rooms=await page.locator('.room-picker option').evaluateAll(options=>options.filter(o=>o.value).map(o=>({id:o.value,name:o.textContent})));
   for(const room of rooms){
    await page.locator('.room-picker select').selectOption(room.id);
    await page.waitForFunction(name=>document.querySelector('.scene-title h2')?.textContent===name&&!document.querySelector('.transition-fade.active'),room.name,{timeout:15000});
    check(!await page.locator('.toast').count(),`Room navigation reported an obstruction: ${id}/${room.id}`);
   }
   results.push({id,rooms:rooms.length,tourStops:stops});
  }
  await page.setViewportSize({width:390,height:844});
  await page.locator('.mobile-project-back').click();
  await page.locator('.residence-card').first().waitFor();
  check(await page.locator('.residence-card').count()===4,'London gallery does not show four plans');
  for(const locale of ['ru','ky','zh-CN','en-US']){
   await page.locator('.collection-header .language-picker select').selectOption(locale);
   check(await page.locator('.residence-card').count()===4,'Language switch lost plans');
  }
  const mobile=await page.locator('.residence-card').evaluateAll(cards=>cards.map(c=>({height:c.getBoundingClientRect().height,width:c.getBoundingClientRect().width})));
  check(mobile.every(c=>c.height<340),'Mobile cards are too tall');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');
  await page.locator('.residence-card').first().scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/london-gallery-mobile.png'});
  await page.locator('.residence-card').first().locator('.plan-details-toggle').click();
  check(await page.locator('.residence-card').first().locator('.plan-details-toggle').getAttribute('aria-expanded')==='true','Details did not open');
  await page.locator('.residence-card').first().locator('.residence-actions a').click();
  await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
  const back=await page.locator('.mobile-project-back').boundingBox();check(back&&back.y>=0&&back.x>=0&&back.x+back.width<=390,'Mobile back link is not visible');
  await page.locator('.tour-start').click();
  const tour=await page.locator('.tour-card').boundingBox();check(tour.height<130,'Mobile tour card obscures the scene');
  await page.screenshot({path:'output/playwright/london-tour-mobile.png'});
  check(!errors.length,`Browser errors: ${errors.join('\n')}`);check(!missing.length,`Missing assets: ${missing.join('\n')}`);
  return {results,mobile,tourHeight:tour.height,errors,missing};
 }finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);}
}
