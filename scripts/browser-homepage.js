async(page)=>{
 const base='http://127.0.0.1:4174/Artwin/',errors=[],heavy=[];
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 const onError=e=>errors.push(String(e)),onRequest=r=>{if(/assets\/(Viewer|physics|three|ApartmentExperience)-/.test(r.url()))heavy.push(r.url());};
 page.on('pageerror',onError);page.on('request',onRequest);
 try{
  await page.setViewportSize({width:1440,height:1000});await page.goto(base);
  await page.locator('.home-page').waitFor();
  check(await page.locator('h1').count()===1,'One homepage heading');
  check(!page.url().includes('tokyo'),'Homepage does not redirect into a project');
  check(await page.locator('.home-destination').count()===3,'Two cities and commercial entry point');
  for(const language of ['ru','ky','en-US','zh-CN']){
   await page.locator('.collection-header select').selectOption(language);
   for(const width of [320,390,760,1440]){
    await page.setViewportSize({width,height:900});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+language+'/'+width);
    const button=await page.locator('.home-search-submit').boundingBox();
    check(button.width>=44&&button.height>=44,'Search touch target');
    if(width<=390)check(button.y+button.height<900,'Apartment search visible in first mobile screen '+language+'/'+width);
   }
  }
  await page.locator('.collection-header select').selectOption('ru');
  await page.setViewportSize({width:1440,height:1000});await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.home-hero img')].map(i=>i.decode()));});
  await page.screenshot({path:'output/playwright/homepage-desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/playwright/homepage-mobile.png'});
  await page.locator('.home-discover').screenshot({path:'output/playwright/homepage-destinations-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});await page.locator('.home-journey').screenshot({path:'output/playwright/homepage-journey.png'});
  check(!heavy.length,'Homepage does not load the 3D engine');
  await page.locator('.collection-header select').selectOption('en-US');
  await page.locator('.home-search select[name=city]').selectOption('Osh');
  await page.locator('.home-search select[name=bedrooms]').selectOption('2');
  const homeCount=Number((await page.locator('.home-search-count').innerText()).match(/\d+/)[0]);
  await Promise.all([page.waitForURL('**/finder/?city=Osh&bedrooms=2'),page.locator('.home-search-submit').click()]);
  await page.locator('.finder-result').first().waitFor();
  check(await page.getByLabel('City',{exact:true}).inputValue()==='Osh','City passed to finder');
  check(await page.getByLabel('Bedrooms',{exact:true}).inputValue()==='2','Bedrooms passed to finder');
  check(await page.locator('.finder-result').count()===homeCount,'Homepage and finder counts agree');
  check(!(await page.locator('.finder-results').innerText()).includes('Tokyo City'),'No Tokyo results in Osh search');
  await page.reload();check(await page.getByLabel('City',{exact:true}).inputValue()==='Osh','Search survives refresh');
  await page.locator('.collection-header a').first().click();await page.locator('.home-page').waitFor();
  await page.locator('.home-destination').first().click();await page.locator('.project-grid').waitFor();
  check(await page.locator('.project-card').count()===7,'Bishkek residential collection excludes Seoul');
  check(await page.locator('.collection-featured').count()===0,'No default Tokyo feature on collection page');
  await page.locator('.property-filters button').last().click();check(await page.locator('.project-card').count()===1,'Commercial filter works');
  await page.locator('.project-card').click();await page.locator('.commercial-browser').waitFor();
  check(page.url().includes('/seoul/'),'Commercial journey opens Seoul');
  await page.locator('.collection-header a').first().click();await page.locator('.home-page').waitFor();
  await page.locator('.home-search select[name=bedrooms]').focus();await page.keyboard.press('Tab');check(await page.locator('.home-search-submit').evaluate(el=>el===document.activeElement&&getComputedStyle(el).outlineStyle==='solid'),'Keyboard focus');
  await page.emulateMedia({reducedMotion:'reduce'});check(await page.locator('.home-stories img').first().evaluate(el=>getComputedStyle(el).transitionDuration==='0s'),'Reduced motion');await page.emulateMedia({reducedMotion:'no-preference'});
  check(errors.length===0,errors.join(';'));
  return {result:'PASS',languages:4,widths:[320,390,760,1440],searchMatches:homeCount,commercial:true,heavyHomepageRequests:heavy.length,errors};
 }finally{page.off('pageerror',onError);page.off('request',onRequest);}
}
