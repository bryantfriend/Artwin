async(page)=>{
 const errors=[],checks=[],check=(value,message)=>{if(!value)throw Error(message);checks.push(message);},base='http://127.0.0.1:4174/Artwin/';
 const onError=e=>errors.push(String(e));page.on('pageerror',onError);
 try{
  await page.goto(base+'?v=old#/projects/tokyo-city');
  await page.locator('.residence-card').first().waitFor();
  check(page.url()===base+'projects/tokyo-city/','Old hash links upgrade to clean project URLs');
  await page.setViewportSize({width:390,height:844});
  await page.locator('.language-picker select').selectOption('en-US');
  check(!await page.locator('dialog[open]').count(),'No interrupting welcome popup on arrival');
  check((await page.locator('.project-start').boundingBox()).y<740,'Floorplan shortcut appears in the first mobile screen');
  await page.locator('.project-start a').click();
  await page.locator('.more-plan-filters').click();
  await page.locator('.showcase-selects select').first().selectOption('small');
  check(await page.locator('.residence-card').count()===3,'Mobile area filter works');
  for(const lang of ['ru','ky','en-US','zh-CN']){
   await page.locator('.language-picker select').selectOption(lang);
   for(const width of [320,390,760,1440]){
    await page.setViewportSize({width,height:900});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Project layout fits '+lang+'/'+width);
   }
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.language-picker select').selectOption('en-US');
  await page.locator('.residence-card').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/showroom-compact-plans.png'});
  const before=await page.evaluate(()=>scrollY);
  await page.locator('.buyer-nav a').first().click();
  await page.locator('.finder-form').waitFor();
  await page.getByLabel('City',{exact:true}).selectOption('Osh');
  await page.goBack();await page.locator('.residence-card').first().waitFor();
  check(await page.locator('.residence-card').count()===3,'Project filters survive returning from another page');
  await page.waitForFunction(y=>Math.abs(scrollY-y)<100,before,{timeout:4000});
  check(true,'Returning to the gallery restores scroll position');
  await page.locator('.buyer-nav a').first().click();await page.locator('.finder-form').waitFor();
  check(await page.getByLabel('City',{exact:true}).inputValue()==='Osh','Finder preferences persist');
  await page.getByLabel('City',{exact:true}).selectOption('All');
  for(const id of ['tokyo-city','london-square','wilton-park','seoul','urpaq-park','hayat','esentai','tokyo','boston-tower','french-house']){
   await page.goto(base+'projects/'+id+'/');await page.locator('.gallery-open').click();
   const dialog=page.locator('.project-gallery-dialog');await dialog.waitFor();
   await page.waitForFunction(()=>{const i=document.querySelector('.gallery-main-image');return i?.complete&&i.naturalWidth>100;});
   const beforeSrc=await dialog.locator('.gallery-main-image').getAttribute('src');
   await dialog.getByRole('button',{name:'Next image',exact:true}).click();
   await page.waitForFunction(()=>{const i=document.querySelector('.gallery-main-image');return i?.complete&&i.naturalWidth>100;});
   if(id!=='french-house')check(await dialog.locator('.gallery-main-image').getAttribute('src')!==beforeSrc,id+' gallery changes slides');
   await page.keyboard.press('Escape');check(await page.locator('.gallery-open').evaluate(e=>e===document.activeElement),id+' gallery restores focus');
   if(id==='seoul'){
    check(!await page.locator('.residence-card').count(),'Seoul has no apartment cards');
    check(decodeURIComponent(await page.locator('.project-mobile-nav a').last().getAttribute('href')).includes('commercial'),'Seoul contact asks about commercial space');
   }
  }
  await page.goto(base+'projects/wilton-park/');await page.setViewportSize({width:1440,height:1000});await page.locator('.project-story').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/showroom-project-story.png'});
  check(errors.length===0,'No browser errors');return {result:'PASS',checks:checks.length,errors};
 }finally{page.off('pageerror',onError);}
}
