const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const path=require('node:path');
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{for(const reduced of [false,true]){
  const context=await browser.newContext({viewport:{width:1280,height:720}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const click=async name=>page.getByRole('button',{name,exact:true}).click();
  const load=async save=>{if(await page.getByRole('button',{name:'Pausa',exact:true}).isVisible()){await click('Pausa');await click('Guardar y volver al inicio');}
   const chooser=page.waitForEvent('filechooser');await click('↥ Cargar partida');await(await chooser).setFiles({name:'mist.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...save,settings:{...save.settings,reducedMotion:reduced}}))});await page.locator('canvas').waitFor();await page.waitForTimeout(1100);};
  async function capture(label){const shot=await page.screenshot({path:path.join(process.env.ARTIFACTS_DIR||'/tmp',`mist-${reduced?'static':'animated'}-${label}.png`)});
   return page.evaluate(async base64=>{const im=new Image();im.src='data:image/png;base64,'+base64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const s=im.width/480;const data=ctx.getImageData(80*s,70*s,320*s,65*s).data;let total=0;for(let i=0;i<data.length;i+=4)total+=(data[i]+data[i+1]+data[i+2])/3;return total/(data.length/4);},shot.toString('base64'));
  }
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8081');
  const approach={...fixtures[11],position:5030,checkpoint:'ch1_claro',missions:{...fixtures[11].missions,worldFlags:{...fixtures[11].missions.worldFlags,noReturn:false}}};
  await load(approach);await page.keyboard.press('e');await click('Estoy lista · entrar en la niebla');
  await page.waitForTimeout(300);const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')));
  assert.equal(saved.checkpoint,'ch1_niebla');assert.equal(saved.position,5200);assert(saved.missions.worldFlags.noReturn);
  assert(await page.getByText('Entraste en la niebla',{exact:false}).isVisible());await capture('entry');
  await load({...fixtures[12],position:6200});const dense=await capture('dense');
  await load({...fixtures[13],position:6200});const oriented=await capture('oriented');
  assert(dense>oriented+6,`orientation must open the background while retaining fog: ${dense} / ${oriented}`);
  await load({...fixtures[14],position:7440});await capture('refuge');
  assert.deepEqual(errors,[]);console.log('mist: visible entry, checkpoint, dense depth, partial clearing and refuge',reduced?'reduced motion':'animated',{dense,oriented});
  await context.close();
 }}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
