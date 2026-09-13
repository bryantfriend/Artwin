// Use a Playwright CLI Chromium session opened with --mobile.
async (page) => {
  const errors=[],failed=[];
  const onError=e=>errors.push(String(e)),onFailed=r=>failed.push(r.url());
  page.on('pageerror',onError);page.on('requestfailed',onFailed);
  const cdp=await page.context().newCDPSession(page);
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  let touching=false;
  async function touch(type,points){await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points});touching=type!=='touchEnd'&&type!=='touchCancel';}
  async function pos(){
    const t=await page.locator('.plan-player').getAttribute('transform');
    const n=t.match(/-?\d+(?:\.\d+)?/g).map(Number);return {x:n[0],z:n[1],angle:n[2]};
  }
  try {
    await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city/apartments/four-room-134');await page.reload();await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();
    await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);
    await page.waitForTimeout(500);
    check(await page.evaluate(()=>matchMedia('(pointer:coarse)').matches),'Session is not a touchscreen');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow on mobile');
    await page.screenshot({path:'output/playwright/mobile-dollhouse.png',scale:'css'});
    await page.getByRole('button',{name:'Step inside',exact:true}).click();
    await page.locator('.transition-fade.active').waitFor({state:'hidden'});
    await page.locator('.plan-heading').click();
    await page.locator('.plan-player').waitFor();await page.waitForTimeout(300);
    const before=await pos();
    await page.locator('.plan-heading').click();
    const j=await page.getByRole('group',{name:'Touch movement joystick'}).boundingBox(),canvas=await page.locator('canvas').boundingBox();
    const a={id:1,x:j.x+j.width/2,y:j.y+j.height/2},b={id:2,x:canvas.x+canvas.width*.77,y:canvas.y+canvas.height*.48};
    await touch('touchStart',[a]);
    const moving={...a,y:a.y-28};await touch('touchMove',[moving]);
    await touch('touchStart',[moving,b]);
    await touch('touchMove',[moving,{...b,x:b.x-55}]);await page.waitForTimeout(650);
    await touch('touchEnd',[]);await page.waitForTimeout(250);
    await page.locator('.plan-heading').click();const released=await pos();
    check(Math.hypot(released.x-before.x,released.z-before.z)>.25,'Joystick did not move the player');
    check(Math.abs(released.angle-before.angle)>4,'Second touch did not look while moving');
    await page.waitForTimeout(400);const still=await pos();
    check(Math.hypot(still.x-released.x,still.z-released.z)<.06,'Movement stuck after touch release');
    await page.locator('.plan-heading').click();
    await touch('touchStart',[a]);await touch('touchMove',[moving]);await page.waitForTimeout(180);
    await touch('touchCancel',[]);await page.waitForTimeout(250);
    await page.locator('.plan-heading').click();const cancelled=await pos();
    await page.waitForTimeout(400);const afterCancel=await pos();
    check(Math.hypot(cancelled.x-afterCancel.x,cancelled.z-afterCancel.z)<.06,'Movement stuck after touch cancellation');
    await page.getByRole('combobox',{name:'Select a room'}).selectOption('primary');
    await page.locator('.transition-fade.active').waitFor({state:'hidden'});
    await page.getByRole('heading',{name:'Primary bedroom',exact:true}).waitFor();
    await page.screenshot({path:'output/playwright/mobile-walkthrough.png',scale:'css'});
    await page.setViewportSize({width:915,height:412});await page.waitForTimeout(400);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow in landscape');
    await page.screenshot({path:'output/playwright/mobile-landscape.png',scale:'css'});
    await page.setViewportSize({width:412,height:915});
    await page.getByRole('button',{name:'Dollhouse',exact:true}).click();
    await page.getByRole('combobox',{name:'Graphics quality'}).selectOption('high');
    await page.getByRole('combobox',{name:'Graphics quality'}).selectOption('low');
    check(errors.length===0,errors.join('; '));check(failed.length===0,failed.join('; '));
    return {result:'PASS',checks:['mobile layout','simultaneous movement and looking','touch release','touch cancellation','room navigation','landscape resize','graphics quality'],errors,failed,device:'Chromium touchscreen emulation; not a physical phone'};
  }finally{if(touching)await touch('touchEnd',[]);await cdp.detach();page.off('pageerror',onError);page.off('requestfailed',onFailed);}
}
