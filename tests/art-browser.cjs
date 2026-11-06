const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {execFileSync}=require('node:child_process');
const assert=require('node:assert/strict');
const path=require('node:path');
const fixtures=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','tests/fixtures.ts'],{stdio:['ignore','pipe','ignore']}));
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});try{
 for(const reduced of [false,true]){
  const c=await b.newContext({viewport:{width:1280,height:720}}),p=await c.newPage(),errors=[],requests=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(r.url()));
  let clock=false;const click=async name=>{await p.getByRole('button',{name,exact:true}).click();if(clock)await p.clock.runFor(100);};
  const shot=async name=>p.screenshot({path:path.join(process.env.ARTIFACTS_DIR||'/tmp',`art-${name}-${reduced?'static':'animated'}.png`)});
  const open=async save=>{if(clock){await p.clock.resume();clock=false;}if(await p.getByRole('button',{name:'Pausa',exact:true}).isVisible()){await click('Pausa');await click('Guardar y volver al inicio');}const chooser=p.waitForEvent('filechooser');await click('↥ Cargar partida');await(await chooser).setFiles({name:'art.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...save,settings:{...save.settings,reducedMotion:reduced}}))});await p.locator('canvas').waitFor();await p.waitForTimeout(700);};
  await p.goto(process.env.GAME_URL||'http://127.0.0.1:8081');await p.waitForTimeout(500);await shot('menu');
  await open({...fixtures[3],position:1400});await shot('stream');
  await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+100));clock=true;
  async function waterPixels(){const png=await p.screenshot({clip:{x:560,y:640,width:46,height:55}});return p.evaluate(async base64=>{const im=new Image();im.src='data:image/png;base64,'+base64;await im.decode();const canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const data=ctx.getImageData(0,0,im.width,im.height).data;let hash=2166136261,teal=0;for(let i=0;i<data.length;i++){hash=Math.imul(hash^data[i],16777619)>>>0;if(i%4===0&&data[i+1]>data[i]*1.2&&data[i+2]>data[i]*1.1)teal++;}return {hash,teal};},png.toString('base64'));}
  const before=await waterPixels();await p.clock.runFor(230);const after=await waterPixels();assert(before.teal>30,'real teal water texture must be drawn in the river gap');
  if(reduced)assert.equal(before.hash,after.hash,'reduced motion freezes water');else assert.notEqual(before.hash,after.hash,'water actually animates');
  assert(requests.some(u=>u.includes('/water.')));assert(requests.some(u=>u.includes('/waterfall.')));
  await open({...fixtures[3],position:1800});await p.keyboard.press('e');await p.getByLabel('La caminante',{exact:true}).waitFor();await shot('walker-portrait');for(let i=0;i<3;i++)await click('Continuar →');await click('Seguir mi camino →');
  // Return to the menu from a pending question without granting a scene.
  await click('Volver al bosque');await click('Pausa');await click('Guardar y volver al inicio');
  const complete={...fixtures[15],unlockedChapters:[1,2],activeChapter:2,missions:{...fixtures[15].missions,completedMissions:[...fixtures[15].missions.completedMissions,'CH1_16']},library:{version:1,position:180,answers:[],selected:[]}};
  await open(complete);await p.getByLabel('Zona de juego de la biblioteca',{exact:true}).waitFor();await shot('library');await click('E · Leer mesa');await p.getByLabel('La bibliotecaria',{exact:true}).waitFor();await shot('librarian-portrait');
  assert(requests.some(u=>u.includes('/cast.')));assert(requests.some(u=>u.includes('/castPortraits.')));assert(requests.some(u=>u.includes('/pickups.')));assert(requests.some(u=>u.includes('/decor.')));assert(requests.some(u=>u.includes('/menuEmblems.')));
  assert.deepEqual(errors,[]);console.log('art: water pixels, reduced motion, NPC portraits, librarian, props and menu assets',reduced?'static':'animated','ok');await c.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
