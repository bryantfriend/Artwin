async(page)=>{
 const base='http://127.0.0.1:4174/Artwin/',errors=[],mapRequests=[];
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 const onError=error=>errors.push(String(error)),onRequest=request=>{if(/maps\.google|google\.com\/maps|2gis\./.test(request.url()))mapRequests.push(request.url());};
 const dismiss=async()=>{const close=page.locator('.welcome-dialog .dialog-close');if(await close.isVisible())await close.click();};
 page.on('pageerror',onError);page.on('request',onRequest);
 try{
  await page.setViewportSize({width:1440,height:1000});
  const projects=['tokyo-city','london-square','wilton-park','urpaq-park','hayat','esentai','tokyo','seoul','french-house','boston-tower'];
  for(const project of projects){
   await page.goto(base+'projects/'+project+'/');await dismiss();
   await page.locator('.neighbourhood-panel summary').click();
   const panel=page.locator('.neighbourhood-panel');
   const links=await panel.locator('a').evaluateAll(nodes=>nodes.map(a=>({href:a.href,target:a.target,rel:a.rel})));
   check(links.length===6,'Project and five area shortcuts');
   for(const link of links){
    check(link.href.startsWith(`https://2gis.kg/${['french-house','boston-tower'].includes(project)?'osh':'bishkek'}/search/`),'Correct 2GIS city for '+project);
    check(link.target==='_blank'&&link.rel.includes('noopener'),'External navigation keeps apartment open');
   }
   check(await panel.locator('iframe,input').count()===0,'Compact panel without embedded map or route form');
  }
  await page.goto(base+'projects/tokyo-city/');await dismiss();await page.locator('.neighbourhood-panel summary').click();
  const panel=page.locator('.neighbourhood-panel'),mapHref=await panel.locator('.neighbourhood-open').getAttribute('href');
  for(const language of ['ru','ky','en-US','zh-CN']){
   await page.locator('.collection-header select').selectOption(language);
   for(const width of [320,390,760,1440]){
    await page.setViewportSize({width,height:900});
    await panel.scrollIntoViewIfNeeded();
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow '+language+'/'+width);
    check((await panel.boundingBox()).height<640,'Compact height '+language+'/'+width);
    check(await panel.locator('.neighbourhood-open').getAttribute('href')===mapHref,'Stable destination across languages');
   }
  }
  await page.locator('.collection-header select').selectOption('en-US');await panel.screenshot({path:'output/playwright/neighbourhood-2gis-desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.locator('.collection-header select').selectOption('ru');await panel.scrollIntoViewIfNeeded();await dismiss();
  await panel.screenshot({path:'output/playwright/neighbourhood-2gis-mobile.png'});
  await panel.locator('.neighbourhood-open').focus();
  check(await panel.locator('.neighbourhood-open').evaluate(a=>a===document.activeElement),'Main action supports keyboard focus');
  check(mapRequests.length===0,'Opening the panel does not request external maps');
  check(errors.length===0,errors.join(';'));
  return {result:'PASS',projects:10,languages:4,widths:[320,390,760,1440],mapRequests,errors};
 }finally{page.off('pageerror',onError);page.off('request',onRequest);}
}
