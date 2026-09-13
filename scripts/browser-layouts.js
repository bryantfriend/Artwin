async(page)=>{
 const errors=[],failed=[],responses=[],plans=[['two-room-euro-52','52.10',6,3],['three-room-euro-70','70.33',8,4],['two-room-78','78.83',7,4],['three-room-euro-82','82.30',8,4],['three-room-106','106.01',9,5]];
 const error=e=>errors.push(String(e)),consoleError=m=>{if(m.type()==='error')errors.push(m.text());},failure=r=>failed.push(r.url()),response=r=>{if(r.status()>=400)responses.push(r.url());};
 page.on('pageerror',error);page.on('console',consoleError);page.on('requestfailed',failure);page.on('response',response);
 const check=(v,m)=>{if(!v)throw Error(m);};
 try{
  await page.setViewportSize({width:1440,height:960});
  await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city');await page.reload();await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');await page.locator('.welcome-dialog .dialog-close').click();
  await page.locator('.residence-card').first().waitFor();
  check(await page.locator('.residence-card').count()===6,'Expected six plans');
  await page.getByRole('button',{name:'1 bedroom',exact:true}).click();check(await page.locator('.residence-card').count()===2,'One bedroom filter');
  await page.getByRole('button',{name:'2 bedrooms',exact:true}).click();check(await page.locator('.residence-card').count()===3,'Two bedroom filter');
  await page.getByRole('button',{name:'All floor plans',exact:true}).click();
  await page.locator('.plan-showcase').screenshot({path:'output/playwright/tokyo-plans.png'});
  const results=[];
  for(const [id,area,count,tours] of plans){
   await page.goto('http://127.0.0.1:4173/Artwin/#/projects/tokyo-city/apartments/'+id);
   await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,{},{timeout:60000});
   await page.waitForTimeout(800);
   check((await page.locator('.stats').innerText()).includes(area),'Wrong advertised area '+id);
   check(await page.locator('.floor-plan [role=button]').count()===count,'Wrong room count '+id);
   check(await page.locator('canvas').count()===1,'Multiple canvases after switching');
   await page.screenshot({path:'output/playwright/'+id+'-dollhouse.png'});
   await page.getByRole('button',{name:'Step inside',exact:true}).click({noWaitAfter:true});
   await page.locator('.plan-player').waitFor();await page.waitForTimeout(600);
   const rooms=await page.locator('.room-picker option').evaluateAll(options=>options.filter(o=>o.value).map(o=>({id:o.value,name:o.textContent})));
   for(const room of rooms){
    await page.getByRole('combobox',{name:'Select a room'}).selectOption(room.id);await page.waitForTimeout(500);
    await page.waitForFunction(name=>document.querySelector('.scene-title h2')?.textContent===name,room.name,{timeout:10000});
    check(await page.locator('.toast').count()===0,'Obstructed destination '+id+'/'+room.id);
   }
   await page.getByRole('button',{name:'Dollhouse',exact:true}).click({noWaitAfter:true});
   await page.getByRole('button',{name:'Take a guided tour',exact:true}).click({noWaitAfter:true});
   await page.getByRole('button',{name:'Pause tour',exact:true}).click({noWaitAfter:true});
   check(await page.locator('.tour-progress button').count()===tours,'Wrong tour count '+id);
   for(let t=0;t<tours;t++){
    await page.locator('.tour-progress button').nth(t).click({noWaitAfter:true});
    await page.waitForFunction(()=>{const fade=document.querySelector('.tour-scene-fade');return fade&&Number(getComputedStyle(fade).opacity)<.01;});await page.waitForTimeout(200);
    await page.screenshot({path:`output/playwright/${id}-tour-${t}.png`});
   }
   results.push({id,rooms:rooms.length,tourStops:tours});
  }
  check(!errors.length,'Runtime errors '+errors.join(';'));check(!failed.length,'Failed requests '+failed.join(';'));check(!responses.length,'HTTP errors '+responses.join(';'));
  return {result:'PASS',results,errors,failed,responses};
 }finally{page.off('pageerror',error);page.off('console',consoleError);page.off('requestfailed',failure);page.off('response',response);}
}
