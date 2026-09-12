async (page) => {
  const errors=[],failed=[],warnings=[];
  const consoleMessage=m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());};
  const error=e=>errors.push(String(e)),request=r=>failed.push(r.url());
  page.on('console',consoleMessage);page.on('pageerror',error);page.on('requestfailed',request);
  const check=(v,msg)=>{if(!v)throw Error(msg);};
  try{
    await page.setViewportSize({width:1440,height:960});
    await page.goto('http://127.0.0.1:4173/Artwin/');
    await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);
    await page.getByRole('button',{name:'Take a guided tour',exact:true}).click();
    await page.getByRole('button',{name:'Pause tour',exact:true}).click();
    const stops=['Space to come together','Everyday rituals','A quieter retreat','Light, texture, calm','A richer palette','Considered details'];
    for(let i=0;i<stops.length;i++){
      await page.getByRole('button',{name:`Tour stop ${i+1}: ${stops[i]}`,exact:true}).click();
      await page.getByRole('heading',{name:stops[i],exact:true}).waitFor();
      await page.waitForTimeout(900);
      await page.screenshot({path:`output/playwright/tour-${i+1}.png`});
    }
    await page.getByRole('button',{name:'Tour stop 1: Space to come together',exact:true}).click();
    await page.getByRole('button',{name:'Resume tour',exact:true}).click();
    await page.getByRole('heading',{name:'Everyday rituals',exact:true}).waitFor({timeout:12000});
    await page.getByRole('button',{name:'Pause tour',exact:true}).click();
    await page.waitForTimeout(8800);
    check(await page.getByRole('heading',{name:'Everyday rituals',exact:true}).isVisible(),'Paused tour advanced');
    await page.getByRole('button',{name:'Explore this room',exact:true}).click();
    await page.locator('.transition-fade.active').waitFor({state:'hidden'});
    await page.getByRole('heading',{name:'Kitchen & dining',exact:true}).waitFor();
    check(await page.locator('.plan-player').count()===1,'Tour did not hand over to walkthrough');
    await page.getByRole('button',{name:'Dollhouse',exact:true}).click();
    await page.getByRole('button',{name:'Take a guided tour',exact:true}).click();
    await page.getByRole('button',{name:'Tour stop 6: Considered details',exact:true}).click();
    await page.getByRole('button',{name:'Replay tour',exact:true}).waitFor({timeout:12000});
    await page.getByRole('button',{name:'Replay tour',exact:true}).click();
    await page.getByRole('heading',{name:stops[0],exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Resume tour',exact:true}).waitFor();
    await page.setViewportSize({width:390,height:844});
    await page.waitForTimeout(500);
    await page.screenshot({path:'output/playwright/tour-mobile.png'});
    check(await page.getByRole('button',{name:'Explore this room',exact:true}).isVisible(),'Mobile tour actions missing');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile horizontal overflow');
    await page.getByRole('button',{name:'Exit guided tour',exact:true}).click();
    await page.getByRole('button',{name:'Step inside',exact:true}).waitFor();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.reload();await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);
    await page.getByRole('button',{name:'Take a guided tour',exact:true}).click();
    await page.getByRole('button',{name:'Resume tour',exact:true}).waitFor();
    check(errors.length===0&&failed.length===0,JSON.stringify({errors,failed}));
    return {result:'PASS',checks:['six composed views','automatic advance','pause','completion and replay','Escape','walkthrough handoff','mobile controls','exit','reduced motion'],errors,failed,warnings:[...new Set(warnings)]};
  }finally{await page.emulateMedia({reducedMotion:'no-preference'});page.off('console',consoleMessage);page.off('pageerror',error);page.off('requestfailed',request);}
}
