async(page)=>{
 const errors=[],check=(v,m)=>{if(!v)throw Error(m);};
 const onError=e=>errors.push(String(e)),onConsole=m=>{if(m.type()==='error')errors.push(m.text());};page.on('pageerror',onError);page.on('console',onConsole);
 const base='http://127.0.0.1:4173/Artwin/',dismiss=async()=>{const close=page.locator('.welcome-dialog .dialog-close');if(await close.count())await close.click();};
 try{
  await page.goto('about:blank');await page.goto(base+'#/sales-workspace');await page.locator('.collection-header select').selectOption('en-US');
  const optin=page.getByLabel('Record interactions on this browser only',{exact:true});if(await optin.isChecked())await optin.uncheck();await page.getByRole('button',{name:'Clear local interactions',exact:true}).click();await optin.check();
  await page.locator('input[type=file]').setInputFiles('tests/fixtures/sales-inventory.json');await page.getByText('Inventory imported for this browser only',{exact:true}).waitFor();
  await page.goto(base+'#/projects/tokyo-city');await dismiss();await page.locator('.project-detail>.buyer-tools').getByRole('button',{name:'Available apartments',exact:true}).click();const dialog=page.locator('.buyer-dialog');check(await dialog.locator('.unit-option').count()===2,'Only available units');
  check(await dialog.getByText('Local inventory preview. These records are not published or verified by Artwin.',{exact:true}).isVisible(),'Preview warning');
  await dialog.getByLabel('Building',{exact:true}).selectOption('TEST A');check(await dialog.locator('.unit-option').count()===1,'Building filter');await dialog.getByLabel('Floor',{exact:true}).selectOption('4');await dialog.locator('.unit-option').click();check(await dialog.getByText('South',{exact:true}).isVisible(),'Unit orientation');check(await dialog.locator('.buyer-selection').getByText('2026-09-14',{exact:true}).isVisible(),'Unit timestamp');
  const href=await dialog.locator('.buyer-selection .buyer-whatsapp').getAttribute('href');check(decodeURIComponent(href).includes('TEST-401'),'Unit-specific handoff');
  await dialog.getByLabel('Building',{exact:true}).selectOption('');await dialog.getByLabel('Available only',{exact:true}).uncheck();check(await dialog.locator('.unit-option').count()===4,'Reserved and sold visible on demand');
  await page.screenshot({path:'output/playwright/buyer-inventory-desktop.png'});await page.keyboard.press('Escape');
  await page.locator('.project-confidence summary').filter({hasText:'Construction and documents'}).click();check(await page.getByRole('link',{name:'2026-09-14 TEST RECORD ↗',exact:true}).count()===2,'Dated project records');
  await page.goto(base+'#/sales-workspace');check(Number(await page.locator('.dashboard-metrics').first().locator('strong').first().innerText())>=1,'Project views recorded after opt-in');
  check(await page.locator('.disconnected strong').first().innerText()==='—','No fabricated sales');
  await page.getByRole('button',{name:'Remove local preview',exact:true}).click();await page.getByLabel('Record interactions on this browser only',{exact:true}).uncheck();await page.getByRole('button',{name:'Clear local interactions',exact:true}).click();
  for(const lang of ['ru','ky','en-US','zh-CN']){await page.locator('.collection-header select').selectOption(lang);for(const width of [320,390,760,1440]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Workspace overflow '+lang+'/'+width);}}
  await page.locator('.collection-header select').selectOption('en-US');await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'output/playwright/buyer-workspace-desktop.png'});
  check(await page.evaluate(()=>JSON.parse(localStorage.getItem('artwin-inventory-preview'))===null),'Fixture removed');check(await page.evaluate(async()=>!(await (await fetch('./sales-data.json')).json()).units.length),'Published inventory remains empty');
  check(!errors.length,errors.join(';'));return {result:'PASS',errors};
 }finally{await page.evaluate(()=>{localStorage.removeItem('artwin-inventory-preview');localStorage.setItem('artwin-measurement','false');localStorage.removeItem('artwin-events');window.dispatchEvent(new Event('artwin-sales-change'));});page.off('pageerror',onError);page.off('console',onConsole);}
}
