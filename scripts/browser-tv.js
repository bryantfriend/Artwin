// Run with Playwright CLI's `run-code --filename scripts/browser-tv.js`.
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
      async function enter(){await page.goto(origin);await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);await page.getByRole('button',{name:'Step inside',exact:true}).click();await page.locator('.transition-fade.active').waitFor({state:'hidden'});await select('living','Living room');await aim(6.72,1.3,11.55);await page.getByRole('button',{name:'E Turn television on',exact:true}).waitFor();}
      async function capture(path){return page.locator('canvas').screenshot(path?{path}:{});}
      await enter();
      await page.keyboard.press('e');await page.getByRole('button',{name:'E Turn television off',exact:true}).waitFor();await page.waitForTimeout(300);
      const on1=await capture('output/playwright/tv-animation-1.png');await page.waitForTimeout(1600);const on2=await capture('output/playwright/tv-animation-2.png');check(!on1.equals(on2),'TV did not animate');
      await page.keyboard.press('e');await page.getByRole('button',{name:'E Turn television on',exact:true}).waitFor();await page.waitForTimeout(200);
      const off1=await capture('output/playwright/tv-off.png');await page.waitForTimeout(1100);check(off1.equals(await capture()),'Off scene kept animating');
      await page.keyboard.press('e');await page.getByRole('button',{name:'E Turn television off',exact:true}).waitFor();await page.waitForTimeout(300);check(!off1.equals(await capture()),'TV did not restart');
      await page.emulateMedia({reducedMotion:'reduce'});await enter();await page.keyboard.press('e');await page.getByRole('button',{name:'E Turn television off',exact:true}).waitFor();await page.waitForTimeout(300);
      const reduced1=await capture('output/playwright/tv-reduced.png');await page.waitForTimeout(1000);check(reduced1.equals(await capture()),'Reduced motion TV animated');
      check(!errors.length&&!failed.length&&!badResponses.length,JSON.stringify({errors,failed,badResponses}));
      return {result:'PASS',checks:['animated SVG frames differ','off screen stays still','on-off-on restart','reduced-motion still frame'],errors,failed,badResponses};
    }finally{await page.emulateMedia({reducedMotion:'no-preference'});page.off('pageerror',onError);page.off('console',onConsole);page.off('requestfailed',onFailed);page.off('response',onResponse);}
}
