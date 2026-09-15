async(page)=>{
 const errors=[],check=(v,m)=>{if(!v)throw Error(m);},base='http://127.0.0.1:4174/Artwin/';
 const onError=e=>errors.push(String(e));page.on('pageerror',onError);
 try{
  await page.goto(base+'sales-workspace/');await page.locator('.language-picker select').selectOption('en-US');
  if(await page.getByRole('button',{name:'Remove local preview',exact:true}).isEnabled())await page.getByRole('button',{name:'Remove local preview',exact:true}).click();
  const editor=page.locator('.workspace-editor');
  await editor.getByLabel('Record ID',{exact:true}).fill('QA-NOT-PUBLISHED');
  await editor.getByLabel('Building',{exact:true}).fill('QA TEST');
  await editor.getByLabel('Apartment number',{exact:true}).fill('QA-401');
  await editor.getByLabel('Floor',{exact:true}).fill('4');
  await editor.getByLabel('Price',{exact:true}).fill('7000000');
  await editor.getByLabel('Floor plans',{exact:true}).selectOption('two-room-euro-52');
  await editor.getByRole('button',{name:'Add draft record',exact:true}).click();
  check(await editor.locator('.editor-list>div').count()===1,'Unit added to draft');
  await editor.getByRole('button',{name:'Edit',exact:true}).click();
  await editor.getByLabel('Apartment number',{exact:true}).fill('QA-402');
  await editor.getByRole('button',{name:'Save draft record',exact:true}).click();
  check((await editor.locator('.editor-list').innerText()).includes('QA-402'),'Draft editing works');
  await editor.getByRole('button',{name:'Project documents (0)',exact:true}).click();
  await editor.getByLabel('Official source URL',{exact:true}).fill('https://artwin.kg/tokyo_city');
  for(const language of ['ru','ky','en-US','zh-CN'])await editor.getByLabel('Record title · '+language,{exact:true}).fill('QA TEST '+language);
  await editor.getByRole('button',{name:'Add draft record',exact:true}).click();
  check(await editor.locator('.editor-list>div').count()===1,'Translated document added to draft');
  const download=page.waitForEvent('download');await editor.getByRole('button',{name:'Download draft',exact:true}).click();
  await (await download).saveAs('output/playwright/showroom-inventory-draft.json');
  await editor.getByRole('button',{name:'Preview on this device',exact:true}).click();
  check(await page.evaluate(()=>JSON.parse(localStorage.getItem('artwin-inventory-preview')).units[0].number==='QA-402'),'Preview stores the validated draft locally');
  await page.reload();await editor.waitFor();
  check(await page.evaluate(()=>JSON.parse(localStorage.getItem('artwin-inventory-preview')).documents.length===1),'Preview persists after refresh');
  for(const lang of ['ru','ky','en-US','zh-CN']){
   await page.locator('.language-picker select').selectOption(lang);
   for(const width of [320,390,760,1440]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Workspace overflow '+lang+'/'+width);}
  }
  await page.locator('.language-picker select').selectOption('en-US');
  await editor.scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/showroom-editor-desktop.png'});
  await page.locator('.pilot-steps input').first().check();
  const pilot=page.waitForEvent('download');await page.getByRole('button',{name:'Download pilot plan',exact:true}).click();await(await pilot).saveAs('output/playwright/showroom-pilot-plan.json');
  await page.getByRole('button',{name:'Remove local preview',exact:true}).click();
  check(await page.evaluate(async()=>!(await(await fetch('/Artwin/sales-data.json')).json()).units.length),'Published inventory stays empty');
  check(!errors.length,errors.join(';'));return {result:'PASS',errors};
 }finally{await page.evaluate(()=>{localStorage.removeItem('artwin-inventory-preview');localStorage.removeItem('artwin-pilot-checklist');window.dispatchEvent(new Event('artwin-sales-change'));});page.off('pageerror',onError);}
}
