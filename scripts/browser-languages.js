async (page) => {
  const errors=[],failed=[];
  const onError=e=>errors.push(String(e)),onConsole=m=>{if(m.type()==='error')errors.push(m.text());},onResponse=r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);},onFailed=r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))failed.push(r.url());};
  page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);page.on('requestfailed',onFailed);
  const check=(v,m)=>{if(!v)throw Error(m);},results=[];
  const choose=async locale=>page.locator('.topbar .language-picker select').selectOption(locale);
  const tourSettled=async()=>page.waitForFunction(()=>{const fade=document.querySelector('.tour-scene-fade');return fade&&Number(getComputedStyle(fade).opacity)<.01;});
  try{
    for(const id of ['two-room-euro-52','four-room-134']){
      await page.setViewportSize({width:1440,height:1000});
      await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city/apartments/'+id);await page.reload();
      await page.locator('.welcome-dialog .dialog-close').click();
      await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,{},{timeout:60000});
      await page.locator('.quality-picker select').selectOption('low');
      const titles=[],roomOptions=[],tourTitles=[],helpTitles=[];
      for(const locale of ['ru','ky','en-US','zh-CN']){
        await choose(locale);titles.push(await page.locator('.intro h1').innerText());
        roomOptions.push(await page.locator('.room-picker select').innerText());
        check(await page.locator('html').getAttribute('lang')===locale,'Viewer language switched');
        const canvas=await page.locator('canvas').getAttribute('aria-label');check(canvas&&canvas.length>15,'Translated canvas label');
        await page.locator('.plan-panel .floor-plan [role=button]').first().click();
        check((await page.locator('.scene-title h2').innerText()).length>0,'Room selection remains functional');
        await page.locator('.help-button').click();helpTitles.push(await page.locator('#help-title').innerText());
        await page.keyboard.press('Escape');check(!await page.locator('.help-dialog').count(),'Help closes with Escape');
        await page.locator('.tour-start').click({noWaitAfter:true});await page.locator('.tour-play').click({noWaitAfter:true});await tourSettled();
        tourTitles.push(await page.locator('.tour-copy h2').innerText());
        for(const size of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
          await page.setViewportSize(size);
          const layout=await page.evaluate(()=>({height:document.querySelector('.tour-card').getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,buttons:[...document.querySelectorAll('.tour-actions button')].map(b=>{const r=b.getBoundingClientRect();return [r.width,r.height];})}));
          check(layout.height<=100&&!layout.overflow&&layout.buttons.every(([w,h])=>w>=44&&h>=44),`${id} ${locale} ${size.width}: ${JSON.stringify(layout)}`);
        }
        await page.setViewportSize({width:390,height:844});await tourSettled();
        if(id==='four-room-134')await page.screenshot({path:`output/playwright/tour-mobile-${locale}.png`});
        await page.locator('.tour-actions button').nth(2).click({noWaitAfter:true});
        await page.waitForFunction(()=>document.querySelector('.tour-mobile-count')?.textContent.startsWith('2 /'));
        await page.locator('.tour-explore').click({noWaitAfter:true});
        await page.locator('.transition-fade.active').waitFor({state:'hidden'});
        check(await page.locator('.mode-walkthrough').count()===1,'Tour room handoff');
        check(!await page.locator('.toast').count(),'Tour room is accessible');
        const nextLocale=locale==='ru'?'ky':'ru';await choose(nextLocale);
        check(await page.locator('.mode-walkthrough').count()===1,'Changing language preserves walkthrough mode');
        await page.locator('.mode-switch button').first().click();await page.setViewportSize({width:1440,height:1000});
        if(await page.locator('.plan-heading').getAttribute('aria-expanded')==='false')await page.locator('.plan-heading').click();
      }
      for(const [label,values] of Object.entries({titles,roomOptions,tourTitles,helpTitles}))check(new Set(values).size===4,`${id} ${label}: translations must differ`);
      results.push({id,locales:4,mobileTourHeight:88});
    }
    await choose('ru');
    await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city');await page.locator('.residence-card').first().waitFor();
    check(!await page.locator('canvas').count(),'Leaving apartment disposes viewer');
    await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
    await page.locator('.welcome-dialog').waitFor();
    check(await page.locator('.slideshow-toggle').getAttribute('aria-label')==='Продолжить слайд-шоу','Reduced motion pauses slideshow');
    await page.locator('.welcome-dialog .dialog-close').click();
    check(!errors.length&&!failed.length,JSON.stringify({errors,failed}));
    return {passed:true,results,errors,failed};
  }finally{await page.emulateMedia({reducedMotion:'no-preference'});page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);page.off('requestfailed',onFailed);}
}
