async(page)=>{
 const errors=[],check=(v,m)=>{if(!v)throw Error(m);},base='http://127.0.0.1:4174/Artwin/';
 const onError=e=>errors.push(String(e));page.on('pageerror',onError);
 try{
  await page.goto(base+'projects/tokyo-city/');await page.locator('.presentation-project-link').click();
  await page.locator('.presentation-home').waitFor();
  check(await page.locator('.presentation-tabs>div').count()===3,'Three selected apartments');
  check(await page.locator('meta[name=robots]').getAttribute('content')==='noindex,follow','Presentation is not indexed');
  for(const language of ['ru','ky','en-US','zh-CN']){
   await page.locator('.language-picker select').selectOption(language);
   for(const width of [320,390,760,1440]){
    await page.setViewportSize({width,height:900});
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Presentation overflow '+language+'/'+width);
   }
  }
  await page.locator('.language-picker select').selectOption('en-US');
  await page.getByRole('button',{name:'Compare',exact:true}).click();
  check(await page.locator('.presentation-comparison .presentation-home').count()===3,'Three-way comparison');
  await page.screenshot({path:'output/playwright/showroom-presentation-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile comparison scroll stays inside page');
  await page.screenshot({path:'output/playwright/showroom-presentation-mobile.png'});
  await page.getByRole('button',{name:'Presentation',exact:true}).click();
  await page.locator('.presentation-tabs>div').nth(1).locator('button').first().click();
  check((await page.locator('.presentation-home h2').innerText()).includes('70.33'),'Selected apartment updates the slide');
  const share=await page.locator('.presentation-share input').inputValue();
  await page.reload();await page.locator('.presentation-home').waitFor();
  check(await page.locator('.presentation-share input').inputValue()===share,'Share link round trip');
  await page.waitForFunction(()=>document.querySelectorAll('.proposal-qr').length===3);
  check(await page.getByRole('button',{name:'Print or save proposal',exact:true}).isEnabled(),'QR links are ready before printing');
  await page.emulateMedia({media:'print'});
  await page.pdf({path:'output/playwright/artwin-proposal-check.pdf',format:'A4',printBackground:true});
  await page.emulateMedia({media:'print'});await page.setViewportSize({width:794,height:1123});
  await page.screenshot({path:'output/playwright/showroom-proposal-print.png'});
  await page.emulateMedia({media:'screen'});
  await page.locator('.presentation-tabs>div').last().locator('button').last().click();
  await page.locator('.presentation-chooser summary').click();
  await page.getByLabel('Project',{exact:true}).selectOption('wilton-park');
  await page.getByLabel('Apartment',{exact:true}).selectOption('wilton-two-room-82');
  await page.getByRole('button',{name:'Add to presentation +',exact:true}).click();
  check((await page.locator('.presentation-tabs').innerText()).includes('Wilton Park'),'Cross-project selection');
  check(await page.getByRole('button',{name:'Add to presentation +',exact:true}).isDisabled(),'Selection is limited to three');
  await page.locator('.buyer-nav a').first().click();await page.locator('.finder-form').waitFor();
  check(!await page.locator('meta[name=robots]').count(),'Indexable pages clear presentation robots metadata');
  check(!errors.length,errors.join(';'));return {result:'PASS',errors};
 }finally{page.off('pageerror',onError);await page.emulateMedia({media:'screen'});}
}
