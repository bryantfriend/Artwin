// Production collection navigation and apartment handoff. Use npm run serve:pages.
async(page)=>{
 const base='http://127.0.0.1:4173/Artwin/';
 const errors=[],failed=[],badResponses=[],requested=[];
 const error=e=>errors.push(String(e)),message=m=>{if(m.type()==='error')errors.push(m.text())},request=r=>requested.push(r.url()),failure=r=>failed.push(r.url()),response=r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)};
 page.on('pageerror',error);page.on('console',message);page.on('request',request);page.on('requestfailed',failure);page.on('response',response);
 const check=(v,msg)=>{if(!v)throw Error(msg)};
 const projects=['London Square','Wilton Park','Seoul','Urpaq Park','Hayat','Tokyo City','Esentai','Tokyo','French House','Boston Tower'];
 async function imageReady(){for(const img of await page.locator('.project-image img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}}
 async function ready(){await page.waitForFunction(()=>{const b=document.querySelector('.enter-button');return b&&!b.disabled;});}
 try{
  await page.setViewportSize({width:1440,height:960});await page.goto(base);await page.reload();await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();await page.getByRole('heading',{name:'Find your place. Imagine your life.'}).waitFor();
  check(await page.locator('.project-card').count()===10,'Missing project cards');
  await imageReady();await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'output/playwright/projects-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Osh 2',exact:true}).click();check(await page.locator('.project-card').count()===2,'Osh filter failed');
  await page.getByRole('button',{name:'Bishkek 8',exact:true}).click();check(await page.locator('.project-card').count()===8,'Bishkek filter failed');
  await page.getByRole('button',{name:'All projects 10',exact:true}).click();
  await page.getByRole('searchbox',{name:'Search projects'}).fill('tokyo');check(await page.locator('.project-card').count()===2,'Search merged Tokyo and Tokyo City');
  await page.getByRole('searchbox',{name:'Search projects'}).fill('no such project');await page.getByRole('heading',{name:'No projects found.',exact:true}).waitFor();await page.getByRole('button',{name:'Clear filters'}).click();
  for(const name of projects){
   await page.locator('.project-grid').getByRole('link',{name:`Explore ${name}`,exact:true}).click();await page.getByRole('heading',{name,exact:true,level:1}).waitFor();await imageReady();
   check(await page.locator('canvas').count()===0,'Viewer loaded on overview');
   check(await page.locator('.residence-card .collection-button').count()===(name==='Tokyo City'?6:0),'Incorrect plan availability for '+name);
   if(name==='Tokyo City')await page.screenshot({path:'output/playwright/tokyo-project-desktop.png',fullPage:true});
   await page.getByRole('link',{name:'All projects',exact:true}).click();
  }
  check(!requested.some(url=>/\/assets\/(Viewer|ApartmentExperience|three|physics)-/.test(url)),'3D engine downloaded before opening apartment');
  await page.getByRole('link',{name:'Explore Tokyo City',exact:true}).first().click();const projectUrl=page.url();await page.reload();await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();await page.getByRole('heading',{name:'Tokyo City',exact:true,level:1}).waitFor();
  await page.getByRole('link',{name:'Explore 134.68 m² in 3D',exact:true}).click();await ready();await page.getByRole('combobox',{name:'Graphics quality'}).selectOption('low');check(page.url().includes('#/projects/tokyo-city/apartments/four-room-134'),'Apartment route wrong');
  await page.getByRole('button',{name:'Take a guided tour',exact:true}).click({noWaitAfter:true});await page.getByRole('button',{name:'Pause tour',exact:true}).click();await page.getByRole('button',{name:'Next tour stop',exact:true}).click();await page.getByRole('button',{name:'Explore this room',exact:true}).click();await page.locator('.transition-fade.active').waitFor({state:'hidden'});await page.getByRole('heading',{name:'Kitchen & dining',exact:true}).waitFor();
  await page.getByRole('link',{name:'Back to Tokyo City floor plans',exact:true}).click();check(page.url()===projectUrl,'Back link wrong');await page.getByRole('heading',{name:'Tokyo City',exact:true,level:1}).waitFor();check(await page.locator('canvas').count()===0,'Canvas retained after exit');
  await page.goBack();await ready();await page.getByRole('button',{name:'Step inside',exact:true}).click();await page.locator('.transition-fade.active').waitFor({state:'hidden'});await page.getByRole('combobox',{name:'Select a room'}).selectOption('living');await page.locator('.transition-fade.active').waitFor({state:'hidden'});
  await page.goForward();await page.getByRole('heading',{name:'Tokyo City',exact:true,level:1}).waitFor();
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});await page.getByRole('link',{name:'All projects',exact:true}).click();await page.getByRole('heading',{name:'Find your place. Imagine your life.'}).waitFor();await imageReady();await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`output/playwright/projects-mobile-${width}.png`});
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Collection horizontal overflow');
   await page.getByRole('link',{name:'Explore Tokyo City',exact:true}).first().click();await page.getByRole('heading',{name:'Tokyo City',exact:true,level:1}).waitFor();await imageReady();await page.screenshot({path:`output/playwright/tokyo-project-mobile-${width}.png`,fullPage:true});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Project horizontal overflow');
  }
  await page.getByRole('link',{name:'Explore 134.68 m² in 3D',exact:true}).click();await ready();check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Apartment header overflow');await page.getByRole('button',{name:'Take a guided tour',exact:true}).click({noWaitAfter:true});await page.getByRole('button',{name:'Pause tour',exact:true}).click();await page.waitForTimeout(1000);await page.screenshot({path:'output/playwright/collection-mobile-tour.png'});check((await page.locator('.tour-card').boundingBox()).height<=100,'Compact mobile card regressed');
  await page.getByRole('link',{name:'Artwin home',exact:true}).click();await page.getByRole('heading',{name:'Find your place. Imagine your life.'}).waitFor();
  await page.goto(base+'#/projects/seoul/apartments/four-room-134');await page.getByRole('heading',{name:'This space isn’t available.'}).waitFor();check(await page.locator('canvas').count()===0,'Unknown plan incorrectly opened viewer');await page.getByRole('link',{name:'View all projects',exact:true}).click();
  check(!errors.length&&!failed.length&&!badResponses.length,JSON.stringify({errors,failed,badResponses}));
  return {result:'PASS',checks:['10 sourced projects and images','city filters and search','unavailable plans','lazy 3D loading','refreshable hash routes','apartment/tour handoff','viewer unmount/remount','browser back/forward','320 and 390 px layouts','compact mobile tour','invalid route recovery'],errors,failed,badResponses};
 }finally{page.off('pageerror',error);page.off('console',message);page.off('request',request);page.off('requestfailed',failure);page.off('response',response);}
}
