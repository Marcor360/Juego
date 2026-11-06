const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
const path = require('node:path');
const fixtures = JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types', 'tests/fixtures.ts'], {stdio:['ignore','pipe','ignore']}));
const artifacts = process.env.ARTIFACTS_DIR || '/tmp';
(async()=>{
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  try {
    for(const mobile of [false,true]) {
      const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:2048,height:1152},isMobile:mobile,hasTouch:mobile});
      const page=await context.newPage(),errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      const click=async name=>{const el=page.getByRole('button',{name,exact:true});mobile?await el.tap():await el.click();};
      // Detect actual character pixels above the soil, not merely a successful screenshot.
      async function heroOnGround(label) {
        const shot=await page.screenshot({path:path.join(artifacts,`actors-${mobile?'mobile':'desktop'}-${label}.png`)});
        const pixels=await page.evaluate(async base64=>{
          const image=new window.Image(); image.src='data:image/png;base64,'+base64; await image.decode();
          const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
          const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
          const scale=image.width/480;
          const crop=ctx.getImageData(Math.round(180*scale),Math.round(181*scale),Math.round(32*scale),Math.round(44*scale));
          let body=0,feet=0;
          for(let y=0;y<crop.height;y++)for(let x=0;x<crop.width;x++){
            const i=(y*crop.width+x)*4,r=crop.data[i],g=crop.data[i+1],b=crop.data[i+2];
            if(r>g*1.25&&b>g*1.15&&r>65) body++;
            if(y>=crop.height-4*scale&&r>g*1.25&&g>b*1.05&&r<210)feet++;
          }
          return {body,feet,scale};
        },shot.toString('base64'));
        assert(pixels.body>8*pixels.scale*pixels.scale,`${label}: protagonist must be visible (${JSON.stringify(pixels)})`);
        assert(pixels.feet>3,`${label}: her boots must reach the ground (${JSON.stringify(pixels)})`);
      }
      await page.goto(process.env.GAME_URL||'http://127.0.0.1:8091');
      for(const position of [3750,3860,4400]) {
        await page.evaluate(save=>localStorage.setItem('precursora-save-v2',JSON.stringify(save)),{...fixtures[9],position});
        await page.reload();await click('▤ Continuar');await page.waitForTimeout(1200);
        await heroOnGround(String(position));
        await click('Pausa');await click('Guardar y volver al inicio');
      }
      // Exercise all animation states and camera movement using actual controls.
      await page.evaluate(save=>localStorage.setItem('precursora-save-v2',JSON.stringify(save)),{...fixtures[8],position:3700});
      await page.reload();await click('▤ Continuar');await page.waitForTimeout(700);
      await page.clock.install();await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
      let cdp,point;
      if(mobile){cdp=await context.newCDPSession(page);const box=await page.getByRole('button',{name:'Caminar a la derecha',exact:true}).boundingBox();point={id:1,x:box.x+box.width/2,y:box.y+box.height/2};await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});}
      else await page.keyboard.down('d');
      await page.clock.runFor(400);
      await page.screenshot({path:path.join(artifacts,`actors-${mobile?'mobile':'desktop'}-walk.png`)});
      if(mobile){await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await click('Saltar');}
      else {await page.keyboard.up('d');await page.keyboard.down('Space');}
      await page.clock.runFor(250);
      await page.screenshot({path:path.join(artifacts,`actors-${mobile?'mobile':'desktop'}-jump.png`)});
      if(!mobile)await page.keyboard.up('Space');
      await page.clock.runFor(230);
      await page.screenshot({path:path.join(artifacts,`actors-${mobile?'mobile':'desktop'}-follower-jump.png`)});
      await page.clock.runFor(1170);
      await page.screenshot({path:path.join(artifacts,`actors-${mobile?'mobile':'desktop'}-landed.png`)});
      await click('Pausa');await page.clock.runFor(120);await click('Guardar y volver al inicio');await page.clock.runFor(120);
      const save=await page.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')));
      assert(save.position>3720,'real controls must advance the player');
      assert.deepEqual(errors,[]);
      console.log('actors visible and grounded at bridge/clearing, walking and jumping controls',mobile?'touch':'desktop','ok');
      await context.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
