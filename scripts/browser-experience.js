async (page) => {
  const base='http://127.0.0.1:4173/Artwin/';
  const errors=[],requests=[];
  const onError=e=>errors.push(String(e));
  const onConsole=m=>{if(m.type()==='error')errors.push(m.text());};
  const onResponse=r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);};
  const onFailed=r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))errors.push(`${r.url()} ${r.failure()?.errorText}`);};
  const onRequest=r=>requests.push(r.url());
  page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);page.on('requestfailed',onFailed);page.on('request',onRequest);
  const check=(value,message)=>{if(!value)throw Error(message);};
  const closeWelcome=async()=>{if(await page.locator('.welcome-dialog').count())await page.locator('.welcome-dialog .dialog-close').click();};
  const bounds=async context=>{
    const result=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,bad:[...document.querySelectorAll('.collection-header a,.collection-header .language-picker,.residence-actions a,.residence-actions label')].filter(e=>{const b=e.getBoundingClientRect();return b.width>0&&(b.left<-.5||b.right>innerWidth+.5);}).map(e=>e.textContent)}));
    check(result.scroll<=result.width+1&&!result.bad.length,`${context}: overflow ${JSON.stringify(result)}`);
  };
  try{
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(base);await page.evaluate(()=>{localStorage.removeItem('artwin-language');localStorage.removeItem('artwin-saved-plans');});await page.reload();
    await page.locator('.welcome-dialog').waitFor();
    check(await page.locator('html').getAttribute('lang')==='ru','Default must be Russian');
    check((await page.locator('#welcome-title').innerText()).includes('консультацию'),'Russian welcome heading');
    check(await page.locator('.welcome-slides img').count()===10,'All ten projects in slideshow');
    await page.waitForFunction(()=>[...document.querySelectorAll('.welcome-slides img')].every(i=>i.complete&&i.naturalWidth>0));
    await page.waitForFunction(()=>document.querySelector('.welcome-slide-controls>div button:nth-child(2)')?.getAttribute('aria-pressed')==='true',{},{timeout:7500});
    await page.locator('.slideshow-toggle').click();
    await page.locator('.welcome-slide-controls>div button').nth(7).click();
    check(await page.locator('.welcome-slide-controls>div button').nth(7).getAttribute('aria-pressed')==='true','Direct slide navigation');
    const welcomeTitles=[];
    for(const locale of ['ru','ky','en-US','zh-CN']){
      await page.locator('.welcome-language select').selectOption(locale);
      check(await page.locator('html').getAttribute('lang')===locale,'Modal language switch');
      welcomeTitles.push(await page.locator('#welcome-title').innerText());
      await page.setViewportSize({width:320,height:740});
      check(await page.locator('.welcome-dialog').evaluate(e=>e.scrollHeight<=e.clientHeight+1),'Welcome must fit 320px');
      if(locale==='ky')await page.screenshot({path:'output/playwright/welcome-mobile-ky.png'});
    }
    check(new Set(welcomeTitles).size===4,'All four welcome translations differ');
    await page.locator('.welcome-language select').selectOption('ru');
    check(await page.locator('.welcome-copy .consultation-link').getAttribute('href')==='https://artwin.kg/schedule-call','Welcome links straight to official booking');
    await closeWelcome();
    for(const link of await page.locator('.consultation-link').all())check(await link.getAttribute('href')==='https://artwin.kg/schedule-call','Direct official consultation link');
    const social=await page.locator('.social-group a').evaluateAll(links=>links.map(a=>a.href));
    check(social.join('|')==='https://instagram.com/artwin.kg|https://www.facebook.com/artwin.kg|https://youtube.com/@artwin_kg|https://instagram.com/artwin.osh|https://www.facebook.com/artwin.osh|https://youtube.com/@artwin_kg','Exact official social links');
    await bounds('Collection 320');
    await page.goto(base+'#/projects/tokyo-city');await page.locator('.residence-card').first().waitFor();
    check(await page.locator('.residence-card').count()===6,'Six residence cards');
    const paths=[];
    for(const img of await page.locator('.preview-model img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());paths.push(await img.getAttribute('src'));}
    check(new Set(paths).size===6&&paths.every(s=>s.startsWith('/Artwin/plans/')),'Six unique local 3D images');
    await page.locator('.bedroom-filters button').nth(2).click();check(await page.locator('.residence-card').count()===3,'Two-bedroom filter');
    await page.locator('.showcase-selects select').first().selectOption('medium');check(await page.locator('.residence-card').count()===2,'Combined area filter');
    await page.locator('.showcase-sort select').selectOption('descending');
    check(await page.locator('.residence-card').first().getAttribute('data-plan-id')==='three-room-106','Descending sort');
    await page.locator('.bedroom-filters button').nth(3).click();await page.locator('.gallery-empty').waitFor();
    await page.locator('.gallery-empty button').click();check(await page.locator('.residence-card').count()===6,'Reset empty filters');
    await page.locator('.showcase-sort select').selectOption('ascending');
    await page.locator('.save-plan').first().click();await page.locator('.saved-filter').click();
    check(await page.locator('.residence-card').count()===1,'Saved-only filter');
    await page.reload();await closeWelcome();
    check(await page.locator('.save-plan.saved').count()===1,'Favorite persists after reload');
    await page.locator('.saved-filter').click();await page.locator('.save-plan.saved').click();await page.locator('.gallery-empty').waitFor();await page.locator('.gallery-empty button').click();
    for(let i=0;i<3;i++){const toggle=page.locator('.plan-details-toggle').nth(i);if(await toggle.isVisible()&&await toggle.getAttribute('aria-expanded')==='false')await toggle.click();}
    await page.locator('.compare-choice input').nth(0).check();check(await page.locator('.compare-launch').isDisabled(),'Comparison requires two plans');
    await page.locator('.compare-choice input').nth(1).check();await page.locator('.compare-choice input').nth(2).check();
    check(await page.locator('.compare-choice input:disabled').count()===3,'Maximum three selected plans');
    await page.locator('.compare-launch').click();await page.locator('.comparison-dialog').waitFor();
    check(await page.locator('.comparison-dialog thead th').count()===4,'Three plans in comparison');
    check(await page.locator('.comparison-dialog .collection-button').first().evaluate(e=>getComputedStyle(e).backgroundColor)==='rgb(255, 208, 0)','Dialog action retains Artwin yellow');
    await page.screenshot({path:'output/playwright/comparison-mobile.png'});
    await page.keyboard.press('Escape');check(await page.locator('.compare-launch').evaluate(e=>e===document.activeElement),'Dialog restores focus');
    await page.locator('.compare-clear').click();check(!await page.locator('.compare-tray').count(),'Clear comparison');
    await page.locator('.preview-trigger').first().click();await page.locator('.preview-dialog').waitFor();
    check(await page.locator('.preview-dialog .floor-plan').count()===1&&await page.locator('.preview-dialog img').count()===1,'Enlarged paired previews');
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:'output/playwright/preview-enlarged.png'});
    await page.keyboard.press('Tab');check(await page.evaluate(()=>document.activeElement.closest('dialog')!==null),'Dialog keeps keyboard focus inside');
    await page.keyboard.press('Escape');check(await page.locator('.preview-trigger').first().evaluate(e=>e===document.activeElement),'Preview returns focus');
    const headings=[];
    for(const locale of ['ru','ky','en-US','zh-CN']){
      await page.locator('.collection-header select').selectOption(locale);headings.push(await page.locator('#floor-plans-title').innerText());
      for(const width of [320,390,768,1051,1201,1440]){await page.setViewportSize({width,height:900});await bounds(`${locale} ${width}`);}
      await page.setViewportSize({width:390,height:844});await page.locator('.residence-card').first().scrollIntoViewIfNeeded();
      await page.screenshot({path:`output/playwright/gallery-mobile-${locale}.png`});
    }
    check(new Set(headings).size===4,'Gallery headings translated');
    await page.reload();await page.locator('.welcome-dialog').waitFor();
    check(await page.locator('html').getAttribute('lang')==='zh-CN','Language preference survives reload');
    await page.keyboard.press('Escape');check(!await page.locator('.welcome-dialog').count(),'Escape closes popup');
    await page.locator('.collection-header select').selectOption('ru');await page.setViewportSize({width:1440,height:1000});
    await page.locator('.plan-showcase').scrollIntoViewIfNeeded();await page.waitForTimeout(250);await page.screenshot({path:'output/playwright/gallery-final-desktop.png'});
    check(!requests.some(url=>/\/assets\/(?:Viewer-|ApartmentExperience-|three-|physics-)/.test(url)),'Browsing collection must not load 3D runtime');
    check(!errors.length,errors.join('\n'));
    return {passed:true,locales:4,plans:6,consultations:"official Artwin",projects:10,errors};
  }finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);page.off('requestfailed',onFailed);page.off('request',onRequest);}
}
