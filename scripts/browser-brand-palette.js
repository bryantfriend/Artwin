async (page) => {
  const base = 'http://127.0.0.1:4174/Artwin/';
  const errors = [], results = [];
  const onError = error => errors.push(String(error));
  const check = (ok, message) => { if (!ok) throw Error(message); };
  const dismiss = async () => { const close=page.locator('.welcome-dialog .dialog-close');if(await close.isVisible())await close.click(); };
  const audit = async () => page.evaluate(() => {
    const rgb = value => (value.match(/[\d.]+/g)||[]).map(Number);
    const luminance = c => c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const failures=[], green=[];
    for(const el of document.querySelectorAll('body *')) {
      const s=getComputedStyle(el), r=el.getBoundingClientRect();
      if(!r.width||!r.height||s.visibility==='hidden'||s.display==='none'||el.closest('svg,script,style,[hidden],dialog:not([open])'))continue;
      const fg=rgb(s.color),bg=rgb(s.backgroundColor);
      if(!el.closest('.whatsapp-contact,.buyer-whatsapp')&&[fg,bg].some(c=>c[1]>c[0]+8&&c[1]>c[2]+8&&(c[3]??1)>0))green.push(el.className);
      if(![...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||el.closest('button:disabled,input:disabled'))continue;
      const layers=[];let photographic=false;
      // Image overlays are reviewed in screenshots; computed ancestor backgrounds
      // cannot represent their photo pixels or the ::after gradient.
      for(let p=el;p;p=p.parentElement){const css=getComputedStyle(p);if(css.backgroundImage!=='none'||p.matches('.welcome-copy,.scene-bottom,.story-mosaic span,.lifestyle-image')){photographic=true;break;}layers.push(rgb(css.backgroundColor));}
      if(photographic||fg.length<3)continue;
      let surface=[255,255,255];for(const layer of layers.reverse()){const a=layer[3]??1;surface=surface.map((v,i)=>v*(1-a)+(layer[i]||0)*a);}
      const ink=fg.slice(0,3).map((v,i)=>v*(fg[3]??1)+surface[i]*(1-(fg[3]??1)));
      const l1=luminance(ink),l2=luminance(surface),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
      const large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&parseFloat(s.fontWeight)>=700);
      if(ratio<(large?3:4.5))failures.push({class:el.className,text:el.textContent.trim().slice(0,65),ratio:Number(ratio.toFixed(2)),color:s.color,bg:surface});
    }
    return {overflow:document.documentElement.scrollWidth>innerWidth,green:[...new Set(green)],contrast:failures.slice(0,30)};
  });
  page.on('pageerror', onError);
  try {
    for(const route of ['projects/','projects/tokyo-city/','projects/seoul/','finder/','shortlist/','presentation/','sales-workspace/']) {
      await page.setViewportSize({width:1440,height:1000});
      await page.goto(base+route);await dismiss();
      await page.locator('main').first().waitFor();
      for(const width of [1440,390,320]) {
        await page.setViewportSize({width,height:900});
        const result=await audit();results.push({route,width,...result});
        check(!result.overflow,`Horizontal overflow at ${route} ${width}`);
        check(!result.green.length,`Green interface colors at ${route}: ${result.green.join(', ')}`);
        check(!result.contrast.length,`Text contrast at ${route}: ${JSON.stringify(result.contrast)}`);
      }
      if(route==='projects/'||route==='finder/'){
        await page.setViewportSize({width:1440,height:1000});
        await page.evaluate(async()=>{await Promise.all([...document.images].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.decode().catch(()=>{})));});
        await page.screenshot({path:`output/playwright/brand-${route.split('/')[0]}-desktop.png`});
      }
      if(route==='projects/tokyo-city/'){
        await page.setViewportSize({width:1440,height:1000});
        await page.locator('.plan-showcase').scrollIntoViewIfNeeded();
        await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('.residence-card img')].map(i=>i.decode().catch(()=>{})));});
        await page.screenshot({path:'output/playwright/brand-floorplans-desktop.png'});
        await page.locator('.bedroom-filters button').nth(1).click();
        check(await page.locator('.bedroom-filters button').nth(1).getAttribute('aria-pressed')==='true','Filter selected');
        check(await page.locator('.residence-card').count()>0,'Filtered cards remain visible');
        if(await page.locator('.save-plan').first().getAttribute('aria-pressed')!=='true')await page.locator('.save-plan').first().click();
        await page.locator('.preview-trigger').first().click();
        await page.locator('.preview-dialog[open]').waitFor();
        results.push({route:'preview dialog',...(await audit())});
        await page.locator('.preview-dialog .dialog-close').click();
        await page.setViewportSize({width:390,height:844});
        await page.locator('.plan-showcase').scrollIntoViewIfNeeded();
        await page.screenshot({path:'output/playwright/brand-floorplans-mobile.png'});
      }
    }
    check(errors.length===0,errors.join('; '));
    return {result:'PASS',pages:7,widths:[1440,390,320],errors,contrastFailures:results.flatMap(r=>r.contrast)};
  } finally { page.off('pageerror',onError); }
}
