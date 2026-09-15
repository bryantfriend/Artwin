async(page)=>{
 const errors=[],responses=[],check=(value,message)=>{if(!value)throw Error(message);};
 const onError=e=>errors.push(String(e)),onConsole=m=>{if(m.type()==='error')errors.push(m.text());},onResponse=r=>{if(r.status()>=400&&r.url().includes('/Artwin/'))responses.push(`${r.status()} ${r.url()}`);};
 page.on('pageerror',onError);page.on('console',onConsole);page.on('response',onResponse);
 const base='http://127.0.0.1:4173/Artwin/';
 const dismiss=async()=>{const close=page.locator('.welcome-dialog .dialog-close');if(await close.count())await close.click();};
 try{
  await page.goto('about:blank');await page.setViewportSize({width:390,height:844});await page.goto(base+'#/projects/tokyo-city');await dismiss();await page.locator('.collection-header select').selectOption('en-US');
  const first=page.locator('.residence-card').first();check((await first.boundingBox()).height<310,'Compact card regression');
  await first.locator('.plan-details-toggle').click();await first.getByRole('button',{name:'Plan payments',exact:true}).click();
  const dialog=page.locator('.buyer-dialog');await dialog.getByLabel('Apartment price or budget',{exact:true}).fill('120000');await dialog.getByLabel('Down payment',{exact:true}).fill('36000');await dialog.getByLabel('Months',{exact:true}).fill('24');await dialog.getByLabel('Payment schedule',{exact:true}).selectOption('1');
  check((await dialog.locator('.payment-result').innerText()).includes('3,500.00'),'Monthly calculation');
  await dialog.getByLabel('Payment schedule',{exact:true}).selectOption('3');check((await dialog.locator('.payment-result').innerText()).includes('10,500.00'),'Quarterly calculation');
  await dialog.getByRole('button',{name:'Save my scenario',exact:true}).click();check(await dialog.getByText('Scenario saved on this device',{exact:true}).isVisible(),'Scenario persistence feedback');
  const href=await dialog.getByRole('link',{name:'Discuss this estimate'}).getAttribute('href');const message=await page.evaluate(h=>new URL(h).searchParams.get('text'),href);check(message.includes('52.10')&&message.includes('120000')&&message.includes('36000'),'Payment handoff includes selected plan and values');
  await page.screenshot({path:'output/playwright/buyer-payment-mobile.png'});
  await dialog.getByLabel('Down payment',{exact:true}).fill('130000');check(!await dialog.locator('.payment-result').count(),'Invalid deposit rejected');await page.keyboard.press('Escape');
  await first.getByRole('button',{name:'Furniture planner',exact:true}).click();await dialog.getByLabel('Room',{exact:true}).selectOption('primary');check(await dialog.locator('.furniture-sketch').isVisible(),'Furniture sketch');await dialog.getByLabel('Furniture width (m)',{exact:true}).fill('9');check((await dialog.getByRole('status').innerText()).includes('crosses'),'Oversized furniture rejected');await dialog.getByRole('button',{name:'Bed',exact:true}).click();await dialog.getByRole('button',{name:'Rotate furniture',exact:true}).click();await page.screenshot({path:'output/playwright/buyer-furniture-mobile.png'});await page.keyboard.press('Escape');
  await page.locator('.project-detail>.buyer-tools').getByRole('button',{name:'Available apartments',exact:true}).click();check(await dialog.getByText('Choose a layout. Confirm a home.',{exact:true}).isVisible(),'Honest empty inventory');check(!await dialog.locator('.unit-option').count(),'No invented units');await page.keyboard.press('Escape');
  for(const card of [first,page.locator('.residence-card').nth(1)])if(await card.locator('.save-plan').getAttribute('aria-pressed')!=='true')await card.locator('.save-plan').click();
  await page.locator('.buyer-nav a[href="#/shortlist"]').click();check(await page.locator('.shortlist-card').count()>=2,'Existing saves used by shortlist');await page.getByRole('button',{name:'Copy share link',exact:true}).click();const url=await page.getByLabel('Share link',{exact:true}).inputValue();check(url.includes('/Artwin/#/shortlist?plans=')&&!url.includes('note='),'Hash-only share URL');await page.locator('.shortlist-card textarea').first().fill('PRIVATE TEST NOTE');check(!url.includes('PRIVATE'),'Private note excluded');await page.screenshot({path:'output/playwright/buyer-shortlist-mobile.png'});
  await page.goto(url);await dismiss();check(await page.locator('.shortlist-card').count()>=2,'Shared link reload');
  await page.locator('.buyer-nav a[href="#/finder"]').click();await page.getByLabel('Bedrooms',{exact:true}).selectOption('1');check(await page.locator('.finder-result').count()===2,'Bedroom matches');await page.getByRole('button',{name:'Add my budget'}).click();await page.getByLabel('Maximum total price',{exact:true}).fill('6000000');await page.getByRole('button',{name:'Show my matches',exact:true}).click();check(await page.getByText('These layouts match your space preferences. Prices are missing, so affordability and availability are unconfirmed.',{exact:true}).isVisible(),'Unpriced results explicitly unknown');
  await page.screenshot({path:'output/playwright/buyer-finder-mobile.png'});
  await page.getByRole('button',{name:'1. Your home',exact:true}).click();await page.getByLabel('City',{exact:true}).selectOption('Osh');check(await page.locator('.finder-result').count()===0,'No fake Osh models');
  for(const lang of ['ru','ky','en-US','zh-CN']){
   await page.locator('.collection-header select').selectOption(lang);for(const width of [320,390,760,1440]){await page.setViewportSize({width,height:900});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Finder overflow '+lang+'/'+width);}
  }
  await page.locator('.collection-header select').selectOption('en-US');await page.setViewportSize({width:1440,height:1000});await page.goto(base+'#/projects/tokyo-city');await dismiss();await page.locator('.project-lifestyle').scrollIntoViewIfNeeded();await page.screenshot({path:'output/playwright/buyer-project-desktop.png'});
  check(!errors.length,errors.join(';'));check(!responses.length,responses.join(';'));return {result:'PASS',errors,responses,shareUrl:url};
 }finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('response',onResponse);}
}
