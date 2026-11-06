const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}));
const tasks=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','-e',"import('./game/chapter2/library.ts').then(m=>process.stdout.write(JSON.stringify(m.libraryTasks)))"],{stdio:['ignore','pipe','ignore']}));
const escape=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});try{
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:667,height:375}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile});const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const click=async name=>{const el=p.getByRole('button',{name,exact:true});mobile?await el.tap():await el.click();if(clock)await p.clock.runFor(100);};let clock=false;
 const saved=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')));
 await p.goto(process.env.GAME_URL||'http://127.0.0.1:8081');
 const original={...fixtures[15],unlockedChapters:[1,2],missions:{...fixtures[15].missions,completedMissions:[...fixtures[15].missions.completedMissions,'CH1_16']}};
 const chooser=p.waitForEvent('filechooser');await click('↥ Cargar partida');await(await chooser).setFiles({name:'forest.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});
 await click('Pausa');await click('Guardar y volver al inicio');await click('Diario de capítulos');await click('Jugar capítulo II');
 await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();await p.waitForTimeout(800);
 await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));clock=true;
 const cdp=mobile?await context.newCDPSession(p):null;
 async function moveTo(target){const current=(await saved()).library.position;const delta=target-current;if(Math.abs(delta)<8)return;
  if(mobile){const box=await p.getByRole('button',{name:delta>0?'Biblioteca caminar derecha':'Biblioteca caminar izquierda',exact:true}).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2,y:box.y+box.height/2}]});}
  else{await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).focus();await p.keyboard.down(delta>0?'d':'a');}
  await p.clock.runFor(Math.abs(delta)/115*1000);
  if(mobile)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await p.keyboard.up(delta>0?'d':'a');await p.clock.runFor(750);
 }
 for(let i=0;i<tasks.length;i++){
  const task=tasks[i];await moveTo(task.x);console.log('library station',mobile,i,(await saved()).library.position);await click(mobile?'Leer mesa':'E · Leer mesa');
  if(i===0){await click(task.options.find(o=>!task.answer.includes(o.id)).text);await click('Comprobar lectura');assert.equal((await saved()).library.answers.length,0,'wrong answers cannot grant a step');await click('Cerrar lectura');await click(mobile?'Leer mesa':'E · Leer mesa');}
  for(const id of task.answer){const option=task.options.find(o=>o.id===id);const button=p.getByRole('button',{name:new RegExp(escape(option.text)+'$')});mobile?await button.tap():await button.click();await p.clock.runFor(100);}
  if(i===1){await click('Cerrar lectura');await click('Pausa biblioteca');await click('Guardar biblioteca y salir');assert.equal((await saved()).activeChapter,2);await p.clock.resume();clock=false;await p.reload();await click('▤ Continuar');await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();await p.waitForTimeout(500);await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));clock=true;await click(mobile?'Leer mesa':'E · Leer mesa');assert.deepEqual((await saved()).library.selected,task.answer);}
  await click('Comprobar lectura');assert.equal((await saved()).library.answers.length,i+1);
 }
 await p.getByText('Aprendizaje obtenido',{exact:true}).waitFor();await p.screenshot({path:path.join(process.env.ARTIFACTS_DIR||'/tmp',`library-complete-${mobile?'mobile':'desktop'}.png`)});
 const complete=await saved();assert.deepEqual(complete.tools,['fe','aprendizaje']);assert.deepEqual(complete.unlockedChapters,[1,2,3]);assert.equal(complete.missions.completedMissions.length,16);
 await click('Guardar biblioteca y salir');
 const downloadEvent=p.waitForEvent('download');await click('Descargar partida');const download=await downloadEvent;
 const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.library.answers.length,8);assert.equal(exported.activeChapter,2);
 if(!mobile){const before=JSON.stringify(await saved());await click('Diario de capítulos');await click('Repetir capítulo');await p.clock.runFor(200);await click('Pausa');await click('Guardar y volver al inicio');assert.equal(JSON.stringify(await saved()),before);await p.clock.resume();clock=false;await click('▤ Continuar');await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();assert.deepEqual((await saved()).tools,['fe','aprendizaje']);}

 assert.deepEqual(errors,[]);console.log('library: eight real stations, wrong answer, partial reload, reward and intact forest',mobile?'touch':'desktop','ok');await context.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
