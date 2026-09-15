async(page)=>{
 const base='http://127.0.0.1:4174/Artwin/',errors=[];
 const projects=['tokyo-city','london-square','wilton-park','seoul','urpaq-park','hayat','esentai','tokyo','boston-tower','french-house'];
 const check=(ok,message)=>{if(!ok)throw Error(message);},onError=e=>errors.push(String(e));
 const loaded=async()=>{
 await page.waitForFunction(()=>{
  const track=document.querySelector('.lifestyle-track'),bounds=track?.getBoundingClientRect();
  if(!bounds)return false;
  return [...track.querySelectorAll('img')].filter(img=>{const r=img.getBoundingClientRect();return r.right>bounds.left&&r.left<bounds.right;}).every(img=>img.complete&&img.naturalWidth>0);
 });
 await page.locator('.lifestyle-track').evaluate(async track=>{
  const bounds=track.getBoundingClientRect();
  await Promise.all([...track.querySelectorAll('img')].filter(img=>{const r=img.getBoundingClientRect();return r.right>bounds.left&&r.left<bounds.right;}).map(img=>img.decode()));
 });
 };
 page.on('pageerror',onError);
 try{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base+'projects/tokyo-city/');
  await page.locator('.collection-header select').selectOption('en-US');
  for(const project of projects){
   await page.goto(base+'projects/'+project+'/');
   await page.locator('.project-lifestyle').scrollIntoViewIfNeeded();await loaded();
   check(await page.locator('.lifestyle-card').count()>0,'Picture cards for '+project);
   check(await page.locator('.project-feature-list').count()===0,'Old bullet list removed');
   if(project==='seoul')check((await page.locator('.lifestyle-heading h3').textContent()).includes('Working life'),'Seoul stays commercial');
   await page.locator('.lifestyle-image').first().click();
   await page.locator('.lifestyle-dialog').waitFor();
   check((await page.locator('.lifestyle-dialog .buyer-link').getAttribute('href')).startsWith('https://artwin.kg/'),'Official source link');
   await page.keyboard.press('Escape');
   check(await page.locator('.lifestyle-image').first().evaluate(e=>e===document.activeElement),'Focus returns to photo');
  }
  await page.goto(base+'projects/tokyo-city/');
  await page.locator('.project-lifestyle').scrollIntoViewIfNeeded();await loaded();
  await page.locator('.project-lifestyle').screenshot({path:'output/playwright/lifestyle-desktop.png'});
  const track=page.locator('.lifestyle-track');
  const start=await track.evaluate(e=>e.scrollLeft);
  await page.getByRole('button',{name:'Next spaces',exact:true}).click();
  await page.waitForFunction(start=>document.querySelector('.lifestyle-track').scrollLeft>start,start);
  await track.focus();await page.keyboard.press('ArrowRight');
  await page.getByRole('button',{name:'Previous spaces',exact:true}).click();
  await page.locator('.lifestyle-image').first().click();
  const title=await page.locator('.lifestyle-dialog h2').textContent();
  await page.locator('.lifestyle-dialog').getByRole('button',{name:'Next image',exact:true}).click();
  check((await page.locator('.lifestyle-dialog h2').textContent())!==title,'Enlarged viewer changes photo and caption');
  await page.keyboard.press('Escape');
  for(const language of ['ru','ky','en-US','zh-CN']){
   await page.locator('.collection-header select').selectOption(language);
   for(const width of [320,390,760,1440]){
    await page.setViewportSize({width,height:900});
    await page.locator('.project-lifestyle').scrollIntoViewIfNeeded();
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No page overflow '+language+'/'+width);
    check(await track.evaluate(e=>e.scrollWidth>e.clientWidth),'Native swipe track '+width);
   }
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.collection-header select').selectOption('ru');
  await track.evaluate(e=>e.scrollTo({left:0,behavior:'instant'}));await page.locator('.project-lifestyle').scrollIntoViewIfNeeded();await loaded();
  await page.locator('.project-lifestyle').screenshot({path:'output/playwright/lifestyle-mobile.png'});
  await page.locator('.lifestyle-image').first().click();
  await page.locator('.lifestyle-dialog').screenshot({path:'output/playwright/lifestyle-mobile-dialog.png'});
  check(await page.locator('.lifestyle-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),'Mobile modal fits');
  await page.keyboard.press('Escape');
  await page.goto(base+'projects/wilton-park/');await page.setViewportSize({width:1440,height:1000});
  await page.locator('.project-lifestyle').scrollIntoViewIfNeeded();await loaded();
  await page.locator('.project-lifestyle').screenshot({path:'output/playwright/lifestyle-wilton.png'});
  check(errors.length===0,errors.join(';'));
  return {result:'PASS',projects:projects.length,languages:4,widths:[320,390,760,1440],errors};
 }finally{page.off('pageerror',onError);await page.emulateMedia({reducedMotion:'no-preference'});}
}
