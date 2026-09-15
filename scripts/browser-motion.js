async(page)=>{
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 const errors=[],onError=e=>errors.push(String(e));page.on('pageerror',onError);
 const cdp=await page.context().newCDPSession(page);
 const url='http://127.0.0.1:4174/Artwin/projects/tokyo-city/apartments/two-room-euro-52/';
 try{
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
   // The QA host itself has a touchscreen; model a desktop without one explicitly.
   if(new URLSearchParams(location.search).get('motionQA')==='desktop'){
    Object.defineProperty(navigator,'maxTouchPoints',{configurable:true,get:()=>0});
    const media=window.matchMedia.bind(window);
    window.matchMedia=query=>{const result=media(query);if(query==='(any-pointer: coarse)')Object.defineProperty(result,'matches',{value:false});return result;};
   }
   window.__motionQA={permission:'granted',requests:0};
   Object.defineProperty(DeviceOrientationEvent,'requestPermission',{configurable:true,value:()=>{
    window.__motionQA.requests++;
    return window.__motionQA.permission==='pending'?new Promise(resolve=>{window.__motionQA.resolve=resolve;}):Promise.resolve(window.__motionQA.permission);
   }});
  });
  const ready=async()=>{
   await page.locator('.loading-overlay').waitFor({state:'hidden',timeout:90000});
   await page.locator('.topbar select').selectOption('en-US');
   await page.getByRole('button',{name:'Step inside',exact:true}).click();
   await page.locator('.transition-fade.active').waitFor({state:'hidden'});
   await page.locator('.motion-controls').waitFor();
  };
  const emit=async(alpha=0,beta=90,gamma=0)=>page.evaluate(values=>window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',values)),{alpha,beta,gamma});
  const rotation=async()=>Number((await page.locator('.plan-player').getAttribute('transform')).match(/rotate\(([^)]+)/)[1]);
  const waitRotation=async(expected)=>page.waitForFunction(value=>{
   const node=document.querySelector('.plan-player');return node&&Math.abs(Number(node.getAttribute('transform').match(/rotate\(([^)]+)/)[1])-value)<.5;
  },expected,{timeout:10000});
  await page.goto(url);await ready();
  check(await page.evaluate(()=>window.__motionQA.requests)===0,'Permission requested before opting in');
  await page.getByRole('button',{name:'Enable motion look',exact:true}).click();
  await emit(null,null,null);check(await page.getByRole('button',{name:'Cancel motion connection'}).count()===1,'Null sensor reading activated motion');
  await emit();await page.getByRole('button',{name:'Disable motion look'}).waitFor();
  await page.locator('.plan-heading').click();await page.locator('.plan-player').waitFor();
  const start=await rotation();
  const before=await page.locator('canvas').screenshot();
  await emit(30);await waitRotation(start-30);
  const after=await page.locator('canvas').screenshot();check(!before.equals(after),'Sensor movement did not change the rendered view');
  await page.locator('.plan-heading').click();
  const canvas=await page.locator('canvas').boundingBox(),x=canvas.x+canvas.width*.5,y=canvas.y+canvas.height*.64;
  await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+50,y+12,{steps:6});await page.mouse.up();
  await page.locator('.plan-heading').click();await page.locator('.plan-player').waitFor();
  await waitRotation(start-30+50*.003*180/Math.PI);
  const swiped=await rotation();await emit(40);await waitRotation(swiped-10);
  await page.locator('.plan-heading').click();
  await page.getByRole('button',{name:'Recenter motion',exact:true}).click();await emit(200);
  await page.locator('.plan-heading').click();await waitRotation(swiped-10);
  await page.locator('.plan-heading').click();
  await page.getByRole('button',{name:'Open controls and help'}).click();await emit(220);
  await page.getByRole('button',{name:'Got it',exact:true}).click();
  await page.locator('.plan-heading').click();await waitRotation(swiped-10);
  await page.locator('.plan-heading').click();
  await page.getByLabel('Select a room',{exact:true}).selectOption({label:'Bedroom'});
  await page.locator('.transition-fade.active').waitFor({state:'hidden'});
  await page.locator('.plan-heading').click();await page.locator('.plan-player').waitFor();
  await page.waitForFunction(()=>document.querySelector('.scene-title h2')?.textContent==='Bedroom');
  const roomRotation=await rotation();await emit(230);await waitRotation(roomRotation-10);
  await page.locator('.plan-heading').click();
  await page.getByRole('button',{name:'Disable motion look'}).click();await emit(270);
  await page.locator('.plan-heading').click();await waitRotation(roomRotation-10);await page.locator('.plan-heading').click();
  await page.evaluate(()=>window.__motionQA.permission='denied');
  await page.getByRole('button',{name:'Enable motion look'}).click();await page.getByRole('status').filter({hasText:'Motion permission was not granted'}).waitFor();
  check(await page.getByRole('button',{name:'Enable motion look'}).count()===1,'Denied permission lost fallback control');
  await page.evaluate(()=>window.__motionQA.permission='granted');
  await page.getByRole('button',{name:'Enable motion look'}).click();
  await page.getByRole('status').filter({hasText:'Motion sensors are unavailable'}).waitFor({timeout:10000});
  await page.getByRole('button',{name:'Enable motion look'}).click();await emit(270);
  await page.getByRole('button',{name:'Disable motion look'}).waitFor();
  for(const language of ['ru','ky','zh-CN','en-US']){
   await page.locator('.topbar select').selectOption(language);
   for(const size of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]){
    await page.setViewportSize(size);
    const controls=await page.locator('.motion-controls').boundingBox();
    check(controls.x>=0&&controls.x+controls.width<=size.width,'Motion controls overflow');
    const buttons=await page.locator('.motion-controls button').all();
    for(const button of buttons){const box=await button.boundingBox();check(box.width>=44&&box.height>=44,'Motion button touch target too small');}
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile page overflow');
   }
  }
  await page.setViewportSize({width:390,height:844});await page.locator('.topbar select').selectOption('ru');
  await page.screenshot({path:'output/playwright/motion-mobile-ru.png'});
  await page.locator('.topbar select').selectOption('en-US');
  await page.screenshot({path:'output/playwright/motion-mobile-en.png'});
  await page.getByRole('button',{name:'Dollhouse',exact:true}).click();
  check(await page.locator('.motion-controls').count()===0,'Motion control remains in dollhouse');
  await page.getByRole('button',{name:'Walkthrough',exact:true}).click();await page.getByRole('button',{name:'Enable motion look'}).waitFor();
  await page.evaluate(()=>window.__motionQA.permission='pending');
  await page.getByRole('button',{name:'Enable motion look'}).click();await page.getByRole('button',{name:'Cancel motion connection'}).click();
  await page.evaluate(()=>window.__motionQA.resolve('granted'));await emit();
  check(await page.getByRole('button',{name:'Enable motion look'}).count()===1,'Cancelled request reactivated motion');
  await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:false});await page.setViewportSize({width:1440,height:1000});await page.goto(url+'?motionQA=desktop');
  await page.locator('.loading-overlay').waitFor({state:'hidden',timeout:90000});await page.locator('.topbar select').selectOption('en-US');
  await page.getByRole('button',{name:'Step inside',exact:true}).click();
  check(await page.locator('.motion-controls').count()===0,'Motion offered on desktop without touch');
  check(errors.length===0,errors.join('; '));
  return {result:'PASS',sensorChangesRenderedView:true,swipeWithMotion:true,permissionFallbacks:true,roomTravel:true,recenter:true,pausedHelp:true,cancelledRequest:true,localizedViewports:12,desktopFallback:true,errors};
 }finally{page.off('pageerror',onError);await cdp.detach();}
}
