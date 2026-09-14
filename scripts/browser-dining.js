// Production visual checks for table lighting, the 52.10 seating arrangement and cabinet fronts.
// Start npm run serve:pages; run with Playwright CLI run-code --filename scripts/browser-dining.js.
async(page)=>{
 const errors=[],failed=[],bad=[],results=[];
 const error=e=>errors.push(String(e)),consoleError=m=>{if(m.type()==='error')errors.push(m.text());},failure=r=>failed.push(r.url()),response=r=>{if(r.status()>=400)bad.push(r.url());};
 page.on('pageerror',error);page.on('console',consoleError);page.on('requestfailed',failure);page.on('response',response);
 let pitch=0;
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 async function select(room){
  pitch=0;await page.locator('.room-picker select').selectOption(room);
  await page.locator('.transition-fade.active').waitFor({state:'hidden'});await page.waitForTimeout(300);
  check(!await page.locator('.toast').count(),'Blocked room destination');
 }
 async function aim(x,y,z){
  const p=(await page.locator('.plan-player').getAttribute('transform')).match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
  const dx=x-p[0],dz=z-p[1],yaw=Math.atan2(-dx,-dz),nextPitch=Math.atan2(y-1.645,Math.hypot(dx,dz));
  let delta=yaw+p[2]*Math.PI/180;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;
  const mx=-delta/.003,my=-(nextPitch-pitch)/.003,box=await page.locator('canvas').boundingBox(),x0=box.x+box.width*.6,y0=box.y+box.height*.42;
  const steps=Math.ceil(Math.max(Math.abs(mx),Math.abs(my))/180)||1;
  for(let i=0;i<steps;i++){await page.mouse.move(x0,y0);await page.mouse.down();await page.mouse.move(x0+mx/steps,y0+my/steps,{steps:6});await page.mouse.up();}
  pitch=nextPitch;await page.waitForTimeout(250);
 }
 try{
  await page.goto('about:blank');await page.setViewportSize({width:1440,height:1000});
  await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city');
  await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();
  const plans=[['two-room-euro-52',[['living',3,3.865]]],['three-room-euro-70',[['living',1.715,5.82]]],['two-room-78',[['kitchen',12.45,5.685]]],['three-room-euro-82',[['living',3.765,5.55]]],['three-room-106',[['kitchen',2.385,2.7],['living',5.15,9.5]]],['four-room-134',[['kitchen',5.685,2.2],['living',8.1,14.4]]]];
  for(const [id,views] of plans){
   await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city/apartments/'+id);
   await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
   await page.locator('.quality-picker select').selectOption('high');
   await page.getByRole('button',{name:'Step inside',exact:true}).click({noWaitAfter:true});
   await page.locator('.plan-player').waitFor();
   for(const [room,x,z] of views){
    await select(room);await aim(x,.9,z);
    await page.screenshot({path:`output/playwright/kitchen-table-${id}-${room}.png`});
    await aim(x,1.5,z);
    await page.screenshot({path:`output/playwright/chandelier-${id}-${room}.png`});
    results.push(`${id}/${room}`);
   }
   if(id==='two-room-euro-52'){
    await select('living');await aim(1.3,1,4.65);await page.screenshot({path:'output/playwright/seating-52.png'});
    await select('living');await aim(1.3,1.645,5.45);
    await page.keyboard.down('w');await page.waitForTimeout(1000);await page.keyboard.up('w');await page.waitForTimeout(200);
    await aim(1.21,.755,6.18);
    await page.getByRole('button',{name:'E Turn television on',exact:true}).waitFor();await page.keyboard.press('e');
    await page.getByRole('button',{name:'E Turn television off',exact:true}).waitFor();await page.waitForTimeout(500);
    await page.screenshot({path:'output/playwright/relocated-tv-52.png'});
    await select('living');
    for(const [x,z] of [[4.1,4.62],[4.1,3.83]]){
     await aim(x,1.645,z);await page.keyboard.down('w');
     try{await page.waitForFunction(([x,z])=>{const p=document.querySelector('.plan-player').getAttribute('transform').match(/-?\d+(?:\.\d+)?/g).map(Number);return Math.hypot(p[0]-x,p[1]-z)<.09;},[x,z],{timeout:5000});}finally{await page.keyboard.up('w');}
    }
    await aim(4.5,1.05,3.82);await page.getByRole('button',{name:'E Open Living room door',exact:true}).waitFor();await page.keyboard.press('e');await page.waitForTimeout(800);
    await aim(5.65,1.645,3.83);await page.keyboard.down('w');
    try{await page.waitForFunction(()=>Number(document.querySelector('.plan-player').getAttribute('transform').match(/-?\d+(?:\.\d+)?/g)[0])>5.5,null,{timeout:5000});}finally{await page.keyboard.up('w');}
    await page.screenshot({path:'output/playwright/kitchen-table-52-door-exit.png'});
    await select('primary');await aim(5.3,1.35,.7);await page.screenshot({path:'output/playwright/black-cabinet-52.png'});
   }
   if(id==='four-room-134'){
    await select('kitchen');await aim(5.52,1.25,5.37);
    await page.getByRole('button',{name:'E Turn Kitchen & dining light off',exact:true}).waitFor();await page.keyboard.press('e');
    await page.getByRole('button',{name:'E Turn Kitchen & dining light on',exact:true}).waitFor();
    await aim(5.685,1.5,2.2);await page.screenshot({path:'output/playwright/chandelier-light-off.png'});
    await aim(5.52,1.25,5.37);await page.keyboard.press('e');
    await page.getByRole('button',{name:'E Turn Kitchen & dining light off',exact:true}).waitFor();
   }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city/apartments/two-room-euro-52');
  await page.getByRole('button',{name:'Dollhouse',exact:true}).click({noWaitAfter:true});
  await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
  await page.locator('.quality-picker select').selectOption('low');
  await page.locator('.tour-start').click({noWaitAfter:true});await page.locator('.tour-play').click({noWaitAfter:true});
  await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.tour-scene-fade')).opacity)<.01);
  await page.screenshot({path:'output/playwright/seating-52-mobile-tour.png'});
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow');
  check(!errors.length,errors.join(';'));check(!failed.length,failed.join(';'));check(!bad.length,bad.join(';'));
  return {result:'PASS',views:results,mobile:'390px Light-quality guided tour',errors,failed,bad};
 }finally{await page.keyboard.up('w');page.off('pageerror',error);page.off('console',consoleError);page.off('requestfailed',failure);page.off('response',response);}
}
