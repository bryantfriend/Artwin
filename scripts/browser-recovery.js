// Fault injection is deliberately isolated from normal-load browser checks.
async (page) => {
  const origin='http://127.0.0.1:4173/Artwin/';
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  await page.goto(origin);
  await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);
  await page.getByRole('button',{name:'Step inside',exact:true}).click();
  await page.locator('.transition-fade.active').waitFor({state:'hidden'});
  check(await page.evaluate(()=>!document.pointerLockElement),'Pointer lock activated without an explicit capture action');
  await page.evaluate(()=>{
    HTMLCanvasElement.prototype.requestPointerLock=()=>Promise.reject(new DOMException('Simulated refusal','NotAllowedError'));
    HTMLElement.prototype.requestFullscreen=()=>Promise.reject(new DOMException('Simulated refusal','NotAllowedError'));
  });
  await page.getByRole('button',{name:'Capture mouse',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Mouse capture is unavailable'}).waitFor();
  await page.getByRole('button',{name:'Toggle fullscreen',exact:true}).click();
  await page.getByRole('status').filter({hasText:'Fullscreen is unavailable'}).waitFor();
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  await page.getByRole('button',{name:'Continue exploring'}).waitFor();
  await page.getByRole('button',{name:'Continue exploring'}).click();
  await page.getByRole('combobox',{name:'Select a room'}).selectOption('living');
  await page.locator('.transition-fade.active').waitFor({state:'hidden'});
  await page.waitForTimeout(250);
  await page.keyboard.down('s');await page.waitForTimeout(350);await page.keyboard.up('s');
  await page.waitForTimeout(250);
  const t=await page.locator('.plan-player').getAttribute('transform'),n=t.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const yaw=-n[2]*Math.PI/180,dx=7.75-n[0],dz=8.72-n[1],nextYaw=Math.atan2(-dx,-dz),pitch=Math.atan2(.95-1.645,Math.hypot(dx,dz));
  let change=nextYaw-yaw;while(change>Math.PI)change-=2*Math.PI;while(change<-Math.PI)change+=2*Math.PI;
  const canvas=await page.locator('canvas').boundingBox(),x=canvas.x+canvas.width*.6,y=canvas.y+canvas.height*.4;
  const mx=-change/.003,my=-pitch/.003,steps=Math.ceil(Math.max(Math.abs(mx),Math.abs(my))/210);
  for(let i=0;i<steps;i++){await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+mx/steps,y+my/steps,{steps:6});await page.mouse.up();}
  await page.getByRole('button',{name:'E Open cabinet',exact:true}).waitFor();
  await page.keyboard.press('e');await page.waitForTimeout(1200);
  await page.locator('.interaction-prompt').waitFor({state:'hidden'});
  await page.screenshot({path:'output/playwright/cabinet-open.png'});
  await page.evaluate(()=>document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
  await page.getByRole('heading',{name:'The graphics connection was lost.',exact:true}).waitFor();
  await page.getByRole('button',{name:'Reload viewer',exact:true}).waitFor();
  await page.screenshot({path:'output/playwright/graphics-recovery.png'});
  const pattern='**/assets/Viewer-*.js';
  await page.route(pattern,route=>route.abort());
  try {
    await page.reload();
    await page.getByRole('heading',{name:'The apartment could not load.',exact:true}).waitFor();
    await page.getByRole('button',{name:'Reload viewer',exact:true}).waitFor();
    await page.screenshot({path:'output/playwright/asset-recovery.png'});
  }finally{await page.unroute(pattern);}
  await page.reload();await page.waitForFunction(()=>!document.querySelector('.enter-button')?.disabled);
  return {result:'PASS',checks:['no unsolicited pointer lock','pointer lock refusal fallback','fullscreen refusal message','blur pause','cabinet animation','graphics context recovery','failed scene chunk recovery','successful reload after restoring assets'],note:'Expected errors from deliberate fault injection are not normal-load errors.'};
}
