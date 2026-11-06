const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}));
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});try{
 for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:{width:812,height:457},hasTouch:mobile,isMobile:mobile}),p=await context.newPage(),errors=[];
  p.on('pageerror',e=>errors.push(e.message));const click=async name=>{const el=p.getByRole('button',{name,exact:true});mobile?await el.tap():await el.click();};
  const saved=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('precursora-save-v2')));
  await p.goto(process.env.GAME_URL||'http://127.0.0.1:8081');await click('▶ Comenzar aventura');await click('Seguir mi camino →');await p.locator('canvas').waitFor();await p.waitForTimeout(500);
  if(mobile){const cdp=await context.newCDPSession(p),box=await p.getByRole('button',{name:'Caminar a la derecha',exact:true}).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:box.x+box.width/2,y:box.y+box.height/2}]});await p.waitForTimeout(330);await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await p.waitForTimeout(100);}
  else{await p.keyboard.down('d');await p.waitForTimeout(330);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await p.getByRole('button',{name:'Continuar aventura',exact:true}).waitFor();await click('Continuar aventura');}
  await click('▤ Cuaderno');await p.waitForTimeout(100);const stopped=(await saved()).position;assert(stopped>125);await click('Volver');await p.waitForTimeout(850);await click('▤ Cuaderno');await p.waitForTimeout(100);assert.equal((await saved()).position,stopped,'cancelled input must not remain held');await click('Volver');
  await p.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await p.getByRole('button',{name:'Continuar aventura',exact:true}).waitFor();await p.waitForTimeout(100);assert.equal((await saved()).position,stopped);
  await p.evaluate(()=>{delete document.visibilityState;delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  await click('Guardar y volver al inicio');
  const library={...fixtures[15],activeChapter:2,unlockedChapters:[1,2],missions:{...fixtures[15].missions,completedMissions:[...fixtures[15].missions.completedMissions,'CH1_16']},library:{version:1,position:100,answers:[],selected:['cause']}};
  const chooser=p.waitForEvent('filechooser');await click('↥ Cargar partida');await(await chooser).setFiles({name:'library.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(library))});await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();await p.waitForTimeout(300);
  if(mobile){const cdp=await context.newCDPSession(p),box=await p.getByRole('button',{name:'Biblioteca caminar derecha',exact:true}).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:2,x:box.x+box.width/2,y:box.y+box.height/2}]});}else{await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).focus();await p.keyboard.down('d');}
  await p.waitForTimeout(300);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await p.getByRole('button',{name:'Continuar biblioteca',exact:true}).waitFor();await p.waitForTimeout(150);const partial=(await saved()).library;
  assert(partial.position>110);assert.deepEqual(partial.selected,['cause']);await click('Continuar biblioteca');await p.waitForTimeout(850);await click('Pausa biblioteca');await p.waitForTimeout(100);assert.equal((await saved()).library.position,partial.position);
  await click('Guardar biblioteca y salir');await p.reload();await click('▤ Continuar');await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();assert.deepEqual((await saved()).library,partial);assert.equal((await saved()).missions.completedMissions.length,16);
  assert.deepEqual(errors,[]);console.log('suspension: cancelled controls, background save, library focus loss and reload',mobile?'touch':'keyboard','ok');await context.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
