/** Run the same exported-game checks locally and in CI, with one temporary server. */
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const artifacts = path.resolve(process.env.ARTIFACTS_DIR || path.join(root, 'browser-artifacts'));
const suites = [
  'interactions-browser.cjs', 'menu-browser.cjs', 'menu-preferences-browser.cjs', 'controls-browser.cjs',
  'media-browser.cjs', 'transfer-browser.cjs', 'challenge-resume-browser.cjs', 'browser-v3.cjs',
  'art-browser.cjs', 'suspension-browser.cjs', 'mist-browser.cjs', 'library-browser.cjs', 'companion-browser.cjs', 'replay-browser.cjs', 'stability-browser.cjs', 'graphics-browser.cjs', 'chest-browser.cjs',
];
fs.mkdirSync(artifacts, {recursive:true});
let server;
let activeChild;
function stopSuite() {
  if (!activeChild || activeChild.exitCode !== null || activeChild.signalCode) return;
  try {
    if(process.platform!=='win32' && activeChild.pid) process.kill(-activeChild.pid,'SIGTERM');
    else activeChild.kill('SIGTERM');
  } catch(error) { if(error.code!=='ESRCH') console.error(error); }
}
function stopServer() { if (server && !server.killed) server.kill('SIGTERM'); }
process.on('SIGTERM', () => { stopSuite(); stopServer(); process.exit(143); });
process.on('SIGINT', () => { stopSuite(); stopServer(); process.exit(130); });
async function localUrl() {
  if (process.env.GAME_URL) return process.env.GAME_URL;
  const directory = path.resolve(process.env.GAME_DIST || path.join(root,'dist'));
  if (!fs.existsSync(path.join(directory,'index.html'))) throw Error('Primero ejecuta npm run build:web.');
  const log = fs.createWriteStream(path.join(artifacts,'server.log'));
  server = spawn('python3',['-u','-m','http.server','0','--bind','127.0.0.1','--directory',directory],{cwd:root});
  return new Promise((resolve,reject)=>{
    const timer = setTimeout(()=>reject(Error('El servidor de pruebas no arrancó.')),15000);
    let banner='';
    server.stdout.on('data',chunk=>{
      log.write(chunk);banner+=chunk.toString();
      const port=banner.match(/port (\d+)/);
      if(port){clearTimeout(timer);resolve('http://127.0.0.1:'+port[1]);}
    });
    server.stderr.on('data',chunk=>log.write(chunk));
    server.once('error',error=>{clearTimeout(timer);reject(error);});
    server.once('close',code=>{clearTimeout(timer);log.end();reject(Error('Servidor detenido: '+code));});
  });
}
async function run(name,url) {
  const log=fs.createWriteStream(path.join(artifacts,name+'.log'));
  const env={...process.env,GAME_URL:url,ARTIFACTS_DIR:artifacts,CHROMIUM_PATH:process.env.CHROMIUM_PATH||chromium.executablePath()};
  console.log('Browser suite:',name);
  const child=spawn(process.execPath,[path.join(root,'tests',name)],{cwd:root,env,detached:process.platform!=='win32'});
  activeChild=child;
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{
      stopSuite();
    },600000);
    child.stdout.on('data',chunk=>{log.write(chunk);process.stdout.write(chunk);});
    child.stderr.on('data',chunk=>{log.write(chunk);process.stderr.write(chunk);});
    child.once('error',error=>{clearTimeout(timeout);log.end();reject(error);});
    child.once('close',code=>{clearTimeout(timeout);if(activeChild===child)activeChild=undefined;log.end();code===0?resolve():reject(Error(name+' terminó con código '+code));});
  });
}
(async()=>{
  try {
    const url=await localUrl();
    const selected=process.env.BROWSER_SUITES?process.env.BROWSER_SUITES.split(','):suites;
    if(selected.some(name=>!suites.includes(name))) throw Error('BROWSER_SUITES contiene una prueba desconocida.');
    for(const name of selected) await run(name,url);
    console.log('Browser verification passed:',selected.length,'suites. Artifacts:',artifacts);
  } finally {stopSuite();stopServer();}
})().catch(error=>{console.error(error);process.exitCode=1;});
