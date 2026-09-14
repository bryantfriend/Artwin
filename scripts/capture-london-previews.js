// Run against the production build served by scripts/serve-pages.mjs.
async (page) => {
 await page.goto('about:blank');
 await page.setViewportSize({width:1580,height:1050});
 for(const id of ['london-two-room-71','london-studio-100','london-three-room-110','london-four-room-131']){
  await page.goto(`http://127.0.0.1:4173/Artwin/#/projects/london-square/apartments/${id}`);
  await page.reload();
  await page.locator('.welcome-dialog .language-picker select').selectOption('en-US');
  await page.locator('.welcome-dialog .dialog-close').click();
  await page.waitForFunction(()=>document.querySelector('.enter-button')?.disabled===false,null,{timeout:90000});
  await page.locator('.quality-picker select').selectOption('high');
  await page.locator('.experience canvas').waitFor({state:'visible'});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const box=await page.locator('.experience canvas').boundingBox();
  await page.screenshot({path:`public/plans/${id}.png`,style:'.compass{visibility:hidden!important}',clip:{x:box.x,y:box.y+box.height*.13,width:box.width,height:box.height*.72}});
 }
}
