const { chromium }=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const { execFileSync }=require('node:child_process');
const assert=require('node:assert/strict');
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}).toString());
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try {
  const context=await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:720}});
  await context.addInitScript(save=>localStorage.setItem('precursora-save-v2',JSON.stringify(save)),fixtures[1]);
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8081');
  const button=name=>page.getByRole('button',{name,exact:true});
  await button('▤ Continuar').click();await page.locator('canvas').waitFor();
  await button('Pausa').click();
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')));
  await page.evaluate(()=>{window.__createObjectURL=URL.createObjectURL;URL.createObjectURL=()=>{throw Error('No hay espacio para preparar la copia.');};});
  await button('Descargar partida').click();
  await page.getByText('No se pudo preparar la copia.',{exact:false}).waitFor();
  assert.equal(await page.getByRole('dialog').count(),1);
  await page.keyboard.press('Escape');
  assert(await button('Continuar aventura').isVisible());
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')).missions),before.missions);
  await page.evaluate(()=>{URL.createObjectURL=window.__createObjectURL;});
  const download=page.waitForEvent('download');await button('Descargar partida').click();await download;
  assert.deepEqual(errors,[]);
  console.log('transfer: visible failure, pause restored, progress retained, retry export ok');
  await context.close();
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
