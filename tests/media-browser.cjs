const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const fixtures = JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}).toString());
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try {
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  await context.addInitScript(()=>{
   window.__media=[];
   const original=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=function(){
    window.__media.push({source:this.src,element:this,event:'play',overlap:window.__media.some(x=>x.element!==this&&x.source.includes('ambience-')&&!x.element.paused)});
    return original.call(this);
   };
  });
  const page=await context.newPage(); const errors=[],failed=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  page.on('request',r=>requests.push(r.url()));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8081');
  const button=name=>page.getByRole('button',{name,exact:true});
  await button('▶ Comenzar aventura').waitFor();
  assert.equal(await page.evaluate(()=>window.__media.length),0,'no unprompted autoplay');
  await button('⚙ Ajustes').click();
  await page.waitForFunction(()=>window.__media.some(x=>x.source.includes('ambience-menu')&&!x.element.paused));
  await button('Volver').click();
  await button('▶ Comenzar aventura').click();
  await button('Seguir mi camino →').click();
  await page.locator('canvas').waitFor();
  await page.waitForTimeout(1000);
  await page.keyboard.down('d');await page.waitForTimeout(700);await page.keyboard.up('d');
  await page.keyboard.press('Space');await page.waitForTimeout(900);
  const sounds=await page.evaluate(()=>window.__media.map(x=>x.source));
  assert(sounds.some(x=>x.includes('ambience-forest')));
  assert(await page.evaluate(()=>window.__media.some(x=>x.source.includes('ambience-forest')&&x.overlap)),'ambiences overlap during the crossfade');
  assert(sounds.some(x=>x.includes('/jump.')));
  assert(sounds.some(x=>x.includes('/land.')));
  assert(sounds.some(x=>x.includes('step-grass')));
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(100);
  await page.waitForFunction(()=>window.__media.every(x=>x.element.paused), null, {timeout:3000}).catch(async error=>{console.error(await page.evaluate(()=>window.__media.filter(x=>!x.element.paused).map(x=>({source:x.source,volume:x.element.volume,paused:x.element.paused,hidden:document.hidden}))));throw error;});
  await page.evaluate(()=>{
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert(!requests.some(x=>/\/(mist|refuge)\.[^/]+\.webp/.test(x)),'far backgrounds remain unloaded');
  assert(!requests.some(x=>/assets\/assets\/(characters|props)\/v[23]\//.test(x)),'original atlases are not loaded');
  await button('Pausa').click();
  await button('Guardar y volver al inicio').click();
  const chooser=page.waitForEvent('filechooser');await button('↥ Cargar partida').click();
  const save={...fixtures[15],unlockedChapters:[1,2],missions:{...fixtures[15].missions,completedMissions:[...fixtures[15].missions.completedMissions,"CH1_16"]},settings:{music:.4,effects:.5,reducedMotion:false}};
  await (await chooser).setFiles({name:'finished.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
  await button('Pausa').click();await button('Guardar y volver al inicio').click();
  await button('Diario de capítulos').click();
  await button('Jugar capítulo II').click();
  await page.waitForFunction(()=>window.__media.some(x=>x.source.includes('ambience-library')&&!x.element.paused&&x.element.readyState>=2));
  await page.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();
  await page.screenshot({path:require("node:path").join(process.env.ARTIFACTS_DIR || "/tmp", "library-preview.png")});
  await page.setViewportSize({width:390,height:844});
  await page.waitForTimeout(200);
  const libraryBack = await button('Pausa biblioteca').boundingBox();
  assert(libraryBack.y + libraryBack.height <= 844 && libraryBack.x >= 0);
  await page.screenshot({path:require("node:path").join(process.env.ARTIFACTS_DIR || "/tmp", "library-preview-portrait.png")});
  await page.setViewportSize({width:1280,height:720});
  await button('Pausa biblioteca').click();await button('Guardar biblioteca y salir').click();
  await button('⚙ Ajustes').click();
  const musicMinus=button('−').nth(0);
  for(let i=0;i<4;i++)await musicMinus.click();
  await page.waitForTimeout(150);
  assert(await page.evaluate(()=>window.__media.filter(x=>x.source.includes('ambience-')).every(x=>x.element.paused)),'music zero mutes every ambience');
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  console.log('media: menu, footsteps, jump, landing, library, mute, lazy backgrounds, runtime atlases ok');
  await context.close();
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
