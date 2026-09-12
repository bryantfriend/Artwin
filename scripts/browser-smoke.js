// Run with Playwright CLI's `run-code --filename scripts/browser-smoke.js`.
// Start `npm run serve:pages` first. Only public UI and DOM state are inspected.
async (page) => {
  const errors=[],warnings=[],failed=[],badResponses=[];
  const onError=e=>errors.push(String(e));
  const onConsole=m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());};
  const onFailed=r=>failed.push(r.url());
  const onResponse=r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`);};
  page.on('pageerror',onError);page.on('console',onConsole);page.on('requestfailed',onFailed);page.on('response',onResponse);
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  const origin='http://127.0.0.1:4173/Artwin/';
  let pitch=0;
  async function playerPosition() {
    const transform=await page.locator('.plan-player').getAttribute('transform');
    const values=transform.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi).map(Number);
    return {x:values[0],z:values[1],yaw:-values[2]*Math.PI/180};
  }
  async function move(key,ms) {
    await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(200);
  }
  async function moveUntil(key,predicate) {
    await page.keyboard.down(key);
    try {
      for(let i=0;i<35;i++) {if(predicate(await playerPosition()))return;await page.waitForTimeout(120);}
      throw new Error(`Did not reach movement target with ${key}: ${JSON.stringify(await playerPosition())}`);
    }finally{await page.keyboard.up(key);await page.waitForTimeout(200);}
  }
  async function select(id,name) {
    pitch=0;
    await page.getByRole('combobox',{name:'Select a room'}).selectOption(id);
    await page.locator('.transition-fade.active').waitFor({state:'hidden'});
    await page.getByRole('heading',{name,exact:true}).waitFor();
    await page.waitForTimeout(250);
    check(!await page.getByRole('status').count(),'Room relocation was rejected');
  }
  async function aim(x,y,z) {
    const p=await playerPosition(), dx=x-p.x,dz=z-p.z;
    const yaw=Math.atan2(-dx,-dz), nextPitch=Math.atan2(y-1.645,Math.hypot(dx,dz));
    let change=yaw-p.yaw;while(change>Math.PI)change-=Math.PI*2;while(change<-Math.PI)change+=Math.PI*2;
    let pixelsX=-change/.003,pixelsY=-(nextPitch-pitch)/.003;
    const canvas=await page.locator('canvas').boundingBox();
    const x0=canvas.x+canvas.width*.6,y0=canvas.y+canvas.height*.42;
    const steps=Math.ceil(Math.max(Math.abs(pixelsX),Math.abs(pixelsY))/210)||1;
    for(let i=0;i<steps;i++){
      await page.mouse.move(x0,y0);await page.mouse.down();
      await page.mouse.move(x0+pixelsX/steps,y0+pixelsY/steps,{steps:6});await page.mouse.up();
    }
    pitch=nextPitch;await page.waitForTimeout(250);
  }
  try {
    await page.setViewportSize({width:1440,height:960});
    await page.goto(origin);
    await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);
    await page.waitForTimeout(500);
    await page.screenshot({path:'output/playwright/dollhouse.png'});
    check(await page.locator('.room-marker').count()===0,'Dollhouse markers should be removed');
    await page.getByRole('button',{name:'Go to Bedroom 03',exact:true}).click();
    check(await page.getByRole('button',{name:'Go to Bedroom 03',exact:true}).getAttribute('aria-pressed')==='true','Floor plan selection did not work');
    await page.getByRole('button',{name:'Go to Kitchen & dining',exact:true}).focus();
    await page.keyboard.press('Enter');
    check(await page.getByRole('button',{name:'Go to Kitchen & dining',exact:true}).getAttribute('aria-pressed')==='true','Keyboard floor plan selection did not work');
    await page.getByRole('button',{name:'Step inside',exact:true}).click();
    await page.locator('.plan-player').waitFor();
    await page.locator('.transition-fade.active').waitFor({state:'hidden'});
    await page.waitForTimeout(300);
    const start=await playerPosition();await move('w',600);const moved=await playerPosition();
    check(moved.x<start.x-.25,'Keyboard movement did not work after entering');
    await page.keyboard.press('Escape');await page.getByRole('button',{name:'Continue exploring'}).waitFor();
    const paused=await playerPosition();await move('w',250);
    check(Math.abs((await playerPosition()).x-paused.x)<.05,'Movement continued while paused');
    await page.getByRole('button',{name:'Continue exploring'}).click();
    const destinations=[['living','Living room'],['kitchen','Kitchen & dining'],['primary','Primary bedroom'],['bedroom2','Bedroom 02'],['bedroom3','Bedroom 03'],['hall','Entrance hall'],['bath1','En suite'],['bath2','Guest bathroom'],['bath3','Bathroom'],['loggia1','Kitchen loggia'],['loggia2','Bedroom loggia']];
    for(const [id,name] of destinations){await select(id,name);if(id==='living'||id==='kitchen'||id==='primary')await page.screenshot({path:`output/playwright/${id}.png`});}
    await select('bedroom2','Bedroom 02');
    await aim(2.65,1.645,5.5);
    await move('w',1800);
    check((await playerPosition()).z<5.3,'Closed door did not block the player');
    await moveUntil('s',p=>p.z<4.05);
    await page.getByRole('button',{name:'E Open Bedroom 02 door',exact:true}).waitFor();
    await page.keyboard.press('e');await page.waitForTimeout(100);
    await page.keyboard.press('e');await page.waitForTimeout(100);
    await page.keyboard.press('e');await page.waitForTimeout(900);
    await page.locator('.interaction-prompt').waitFor({state:'hidden'});
    await moveUntil('w',p=>p.z>5.8);
    check((await playerPosition()).z>5.7,'Open door did not permit passage');
    await select('kitchen','Kitchen & dining');await aim(5.52,1.25,5.4);
    await page.getByRole('button',{name:'E Turn Kitchen & dining light off',exact:true}).waitFor();
    await page.screenshot({path:'output/playwright/light-on.png'});
    await page.keyboard.press('e');
    await page.getByRole('button',{name:'E Turn Kitchen & dining light on',exact:true}).waitFor();
    await page.screenshot({path:'output/playwright/light-off.png'});
    await select('living','Living room');await aim(6.72,1.3,11.55);
    await page.getByRole('button',{name:'E Turn television on',exact:true}).waitFor();await page.keyboard.press('e');
    await page.getByRole('button',{name:'E Turn television off',exact:true}).waitFor();
    await page.screenshot({path:'output/playwright/television.png'});
    await page.getByRole('button',{name:'Return to entrance',exact:true}).click();
    await page.locator('.transition-fade.active').waitFor({state:'hidden'});await page.waitForTimeout(300);
    check(Math.abs((await playerPosition()).x-5.65)<.1,'Recovery did not return to entrance');
    await page.keyboard.down('w');await page.getByRole('button',{name:'Dollhouse',exact:true}).click();await page.keyboard.up('w');
    check(!await page.locator('.plan-player').count(),'Player remained visible in dollhouse');
    await page.getByRole('button',{name:'Open controls and help'}).click();
    await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');
    check(!await page.getByRole('dialog').count(),'Help did not close with Escape');
    const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name));
    check(resources.every(url=>url.startsWith('http://127.0.0.1:4173/Artwin/')||url.startsWith('data:')),'A resource escaped /Artwin/');
    check(errors.length===0,`Console/runtime errors: ${errors.join('; ')}`);
    check(failed.length===0,`Failed requests: ${failed.join('; ')}`);
    check(badResponses.length===0,`Missing assets: ${badResponses.join('; ')}`);
    return {result:'PASS',checks:['dollhouse','keyboard movement','pause','all 11 room destinations','closed/open door collisions','repeated door interaction','light switch','television','entrance recovery','mode change with held key','help','subpath resources'],errors,failed,badResponses,warnings:[...new Set(warnings)]};
  } finally {
    await page.keyboard.up('w');await page.keyboard.up('s');
    page.off('pageerror',onError);page.off('console',onConsole);page.off('requestfailed',onFailed);page.off('response',onResponse);
  }
}
