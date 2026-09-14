// Production browser verification; fixtures are viewed using public room controls.
async(page)=>{
 const base='http://127.0.0.1:4173/Artwin/',booking='https://artwin.kg/schedule-call',errors=[],failed=[],bathrooms=[];
 const error=e=>errors.push(String(e)),message=m=>{if(m.type()==='error')errors.push(m.text());},failure=r=>{if(!r.failure()?.errorText.includes('ERR_ABORTED'))failed.push(r.url());},response=r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);};
 page.on('pageerror',error);page.on('console',message);page.on('requestfailed',failure);page.on('response',response);
 const check=(v,m)=>{if(!v)throw Error(m);};let pitch=0;
 async function aim(x,y,z){
  const p=(await page.locator('.plan-player').getAttribute('transform')).match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number),dx=x-p[0],dz=z-p[1],next=Math.atan2(y-1.645,Math.hypot(dx,dz));
  let yaw=Math.atan2(-dx,-dz)+p[2]*Math.PI/180;while(yaw>Math.PI)yaw-=2*Math.PI;while(yaw<-Math.PI)yaw+=2*Math.PI;
  const mx=-yaw/.003,my=-(next-pitch)/.003,b=await page.locator('canvas').boundingBox(),x0=b.x+b.width*.6,y0=b.y+b.height*.42,n=Math.ceil(Math.max(Math.abs(mx),Math.abs(my))/160)||1;
  for(let i=0;i<n;i++){await page.mouse.move(x0,y0);await page.mouse.down();await page.mouse.move(x0+mx/n,y0+my/n,{steps:6});await page.mouse.up();}
  pitch=next;await page.waitForTimeout(250);
 }
 async function select(room){pitch=0;await page.locator('.room-picker select').selectOption(room);await page.locator('.transition-fade.active').waitFor({state:'hidden'});await page.waitForTimeout(250);check(!await page.locator('.toast').count(),'Blocked destination '+room);}
 async function open(id){
  await page.goto(base+'#/projects/tokyo-city/apartments/'+id);
  await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
 }
 try{
  await page.goto('about:blank');await page.setViewportSize({width:1440,height:960});await page.goto(base);
  await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');
  check(await page.locator('.welcome-copy .consultation-link').getAttribute('href')===booking,'Welcome booking destination');
  // Intercept only the official destination to test navigation without submitting or loading third-party trackers.
  await page.route(booking,route=>route.fulfill({status:200,contentType:'text/html',body:'<title>Official Artwin booking destination</title>'}));
  await page.locator('.welcome-copy .consultation-link').click();await page.waitForURL(booking);
  await page.goto(base+'#/projects/tokyo-city');await page.locator('.welcome-dialog .dialog-close').click();
  for(const link of await page.locator('.consultation-link').all())check(await link.getAttribute('href')===booking,'Project consultation destination');
  for(const hash of ['#/consultations','#/consultations/tokyo-city','#/consultations/french-house']){await page.goto(base+hash);await page.waitForURL(booking);}
  await page.goto(base+'#/projects/tokyo-city');await page.locator('.welcome-dialog .dialog-close').click();
  const plans=[['two-room-euro-52',[['bath1',7.98,1.55]]],['three-room-euro-70',[['bath1',4.27,1.65],['bath2',7.98,5.62]]],['two-room-78',[['bath1',6.7,1.1],['bath2',9.18,1.47]]],['three-room-euro-82',[['bath1',4.43,1.42],['bath2',1.22,5.12]]],['three-room-106',[['bath1',6.28,7.24],['bath2',.42,9.78]]],['four-room-134',[['bath1',1.5,4.03],['bath2',1.3,7.11],['bath3',1.5,9]]]];
  for(const [id,rooms] of plans){
   await open(id);await page.getByRole('button',{name:'Step inside',exact:true}).click({noWaitAfter:true});await page.locator('.plan-player').waitFor();
   for(const [room,x,z] of rooms){await select(room);await aim(x,.5,z);await page.screenshot({path:`output/playwright/toilet-${id}-${room}.png`});bathrooms.push(`${id}/${room}`);}
   if(id==='three-room-euro-82'){
    await select('bath2');await aim(1.65,1.05,4.6);
    await page.getByRole('button',{name:'E Open En suite door',exact:true}).waitFor();await page.keyboard.press('e');await page.waitForTimeout(800);
    await aim(2.35,1.645,4.55);await page.keyboard.down('w');
    try{await page.waitForFunction(()=>Number(document.querySelector('.plan-player')?.getAttribute('transform').match(/-?\d+(?:\.\d+)?/g)[0])>2.05,null,{timeout:5000});}finally{await page.keyboard.up('w');}
    await page.screenshot({path:'output/playwright/82-ensuite-exit.png'});
   }
  }
  // Revisit the same route from each mode using a real, visible back link.
  for(const [mode,width,height] of [['dollhouse',320,740],['walkthrough',390,844],['tour',844,390]]){
   await page.setViewportSize({width,height});await open('two-room-euro-52');
   if(mode==='walkthrough'){await page.getByRole('button',{name:'Step inside',exact:true}).click({noWaitAfter:true});await page.locator('.app.mode-walkthrough').waitFor();}
   if(mode==='tour'){await page.locator('.tour-start').click({noWaitAfter:true});await page.locator('.tour-play').click({noWaitAfter:true});}
   const visibleBack=width<=760?page.locator('.mobile-project-back'):page.locator('.apartment-project-back');
   await visibleBack.waitFor({state:'visible'});
   check(await visibleBack.getAttribute('href')==='#/projects/tokyo-city','Back target');
   const box=await visibleBack.boundingBox();check(box.width>=44&&box.height>=44,'Back touch target');
   for(const language of ['ru','ky','en-US','zh-CN']){
    await page.locator('.topbar .language-picker select').selectOption(language);
    check(await visibleBack.getAttribute('aria-label')!=='','Missing translated back label');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Header overflow '+language+'/'+width);
   }
   await page.locator('.topbar .language-picker select').selectOption('en-US');
   check(await page.locator('.topbar .consultation-link').getAttribute('href')===booking,'Apartment consultation destination');
   await page.screenshot({path:`output/playwright/mobile-back-${mode}.png`});
   await visibleBack.click();await page.locator('.residence-card').first().waitFor();check(!await page.locator('canvas').count(),'Viewer retained after back');
  }
  check(!errors.length,errors.join(';'));check(!failed.length,failed.join(';'));
  return {result:'PASS',bathrooms,backModes:['dollhouse 320px','walkthrough 390px','tour landscape 844px'],consultations:'Direct official links and legacy redirects',errors,failed};
 }finally{await page.unroute(booking);page.off('pageerror',error);page.off('console',message);page.off('requestfailed',failure);page.off('response',response);}
}
