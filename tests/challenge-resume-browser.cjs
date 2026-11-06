const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {execFileSync} = require('node:child_process');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}).toString());
const content=require('../game/dialogues/chapter1.json');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try {
  for(const mobile of [false,true]) {
   const context=await browser.newContext({viewport:mobile?{width:812,height:375}:{width:1280,height:720},hasTouch:mobile,isMobile:mobile,acceptDownloads:true});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   const button=name=>page.getByRole('button',{name,exact:true});
   const click=async name=>mobile?button(name).tap():button(name).click();
   const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')));
   const open=async save=>{
    const chooser=page.waitForEvent('filechooser');await click('↥ Cargar partida');
    await (await chooser).setFiles({name:'checkpoint.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(save))});
    await page.getByRole('button',{name:save.challenge?'Volver al bosque':'Pausa',exact:true}).waitFor();
   };
   await page.goto(process.env.GAME_URL||'http://127.0.0.1:8081');
   // Cancellation releases the import lock and does not create a new game.
   const cancel=page.waitForEvent('filechooser');await click('↥ Cargar partida');
   await (await cancel).setFiles([]);
   await page.waitForFunction(()=>document.querySelector('[aria-label="↥ Cargar partida"]')?.getAttribute('aria-disabled')!=='true');
   assert.equal(await saved(),null);
   await open(fixtures[1]);
   if(mobile)await click('Interactuar');else await page.keyboard.press('e');
   const scene=content.scenes[1];
   for(let i=0;i<scene.dialogue.length;i++)await click(i===scene.dialogue.length-1?'Seguir mi camino →':'Continuar →');
   const pick=async(stage,id)=>click(stage.options.find(option=>option.id===id).text);
   await pick(scene.stages[0],scene.stages[0].answers[0]);
   await click('Comprobar decisión');
   await page.getByText('PASO 2 DE',{exact:false}).waitFor();
   await pick(scene.stages[1],scene.stages[1].answers[0]);
   await click('Consultar una pista');
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('precursora-save-v2'))?.challenge?.hints===true);
   const before=(await saved()).challenge;
   const order=await page.getByRole('dialog').getByRole('button').allTextContents();
   await click('Volver al bosque');await click('Pausa');await click('Retomar reto');
   assert(await page.getByText('PASO 2 DE',{exact:false}).isVisible());
   assert.deepEqual((await saved()).challenge,before);
   await page.reload();
   await click('▤ Continuar');
   assert(await page.getByText('PASO 2 DE',{exact:false}).isVisible());
   assert(await page.getByText(scene.stages[1].hint,{exact:true}).isVisible());
   assert.deepEqual(await page.getByRole('dialog').getByRole('button').allTextContents(),order);
   assert.equal((await saved()).missions.completedMissions.length,1);
   await click('Volver al bosque');await click('Pausa');
   const downloadEvent=page.waitForEvent('download');await click('Descargar partida');
   const downloaded=await downloadEvent;const exported=JSON.parse(fs.readFileSync(await downloaded.path(),'utf8'));
   assert.deepEqual(exported.challenge,before);
   await click('Guardar y volver al inicio');await open(exported);
   await click('Comprobar decisión');
   for(let i=2;i<scene.stages.length;i++){
    await pick(scene.stages[i],scene.stages[i].answers[0]);await click('Comprobar decisión');
   }
   await page.waitForFunction(()=>JSON.parse(localStorage.getItem('precursora-save-v2'))?.missions.completedMissions.length===2);
   assert.equal((await saved()).challenge,null);
   const artifact=require('node:path').join(process.env.ARTIFACTS_DIR||'/tmp',`challenge-resume-${mobile?'mobile':'desktop'}.png`);
   await page.screenshot({path:artifact});
   assert.deepEqual(errors,[]);
   console.log('partial challenge',mobile?'mobile':'desktop','close, resume, reload, export/import, completion and cancel ok');
   await context.close();
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
