async(page)=>{
 const errors=[],failed=[],onError=e=>errors.push(String(e)),onRequest=r=>failed.push(r.url());
 page.on('pageerror',onError);page.on('requestfailed',onRequest);
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 try{
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4174/Artwin/projects/tokyo-city/apartments/two-room-euro-52/');
  await page.locator('.loading-overlay').waitFor({state:'hidden',timeout:90000});
  await page.locator('.topbar select').selectOption('en-US');
  await page.locator('.tour-start').click();await page.locator('.tour-card').waitFor();
  await page.getByRole('button',{name:'Resume tour',exact:true}).waitFor();
  for(const [index,name] of ['living','bedroom','bathroom'].entries()){
   await page.getByRole('button',{name:new RegExp(`^Tour stop ${index+1}:`)}).click();
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await page.screenshot({path:`output/playwright/interior-after-${name}.png`});
  }
  await page.getByRole('button',{name:/^Tour stop 1:/}).click();
  await page.getByLabel('Lighting atmosphere').selectOption('evening');
  await page.screenshot({path:'output/playwright/interior-after-evening.png'});
  await page.getByLabel('Lighting atmosphere').selectOption('day');
  await page.getByRole('button',{name:'Explore this room',exact:true}).click();
  await page.locator('.transition-fade.active').waitFor({state:'hidden'});
  await page.getByRole('button',{name:'Dollhouse',exact:true}).click();
  await page.getByRole('button',{name:'Hide furniture',exact:true}).click();
  await page.getByRole('button',{name:'Show furniture',exact:true}).click();
  await page.setViewportSize({width:390,height:844});await page.getByLabel('Graphics quality').selectOption('low');
  await page.locator('.tour-start').click();await page.locator('.tour-card').waitFor();
  await page.screenshot({path:'output/playwright/interior-after-mobile.png'});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
  check(errors.length===0,errors.join(';'));
  check(!failed.some(url=>url.includes('/textures/interiors/')),'Texture request failed');
  return {result:'PASS',views:5,walkthrough:true,unfurnished:true,lightMode:true,errors,failed};
 }finally{page.off('pageerror',onError);page.off('requestfailed',onRequest);}
}
