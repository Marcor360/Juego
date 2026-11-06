/** Build runtime copies; original art and its source-space metadata stay intact.
 * npm install --no-save sharp, or set SHARP_MODULE to an existing installation. */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.resolve(__dirname, '..');
const destination = path.join(root, 'assets/runtime');
const atlasSources = {
  locals:'characters/v3/locals.png', localsPortraits:'characters/v3/locals-portraits.png',
  heroTalk:'characters/v3/hero-talk.png', travelerTalk:'characters/v3/traveler-talk.png',
  branch:'props/v3/branch-clear.png', flame:'effects/flame.png',
  waterfall: 'effects/waterfall.png',
  decor: 'props/v3/decor.png', castPortraits: 'characters/v3/cast-portraits.png',
  cast: 'characters/v3/cast.png', water: 'effects/water.png', pickups: 'props/v3/pickups.png', menuEmblems: 'menu/emblems.png',
  library: 'props/v3/library.png', traveler: 'characters/v3/traveler.png', hero: 'characters/v2/hero.png', npcs: 'characters/v2/npcs.png',
  portraits: 'characters/v2/portraits.png', others: 'characters/v3/others.png',
  props: 'props/v2/forest-props.png', treasures: 'props/v2/treasures.png',
  terrain: 'props/v3/terrain.png', chest: 'props/v3/chest.png',
};
function scaledMetadata(data) {
  const result = {...data, width: Math.ceil(data.width / 2), height: Math.ceil(data.height / 2), referenceHeight: data.referenceHeight / 2};
  result.frames = data.frames.map(frame => Object.fromEntries(Object.entries(frame).map(([key, value]) => [key, typeof value === 'number' ? value / 2 : Object.fromEntries(Object.entries(value).map(([k,v]) => [k,v / 2]))])));
  return result;
}
(async () => {
  fs.mkdirSync(destination, {recursive:true});
  const report = [];
  async function convert(source, output, atlas = false) {
    const input = path.join(root, 'assets', source);
    if (!fs.existsSync(input)) return;
    const metadata = await sharp(input).metadata();
    const pipeline = sharp(input);
    if (atlas) {
      pipeline.extend({right:metadata.width % 2, bottom:metadata.height % 2, top:0, left:0, background:{r:0,g:0,b:0,alpha:0}})
        .resize(Math.ceil(metadata.width / 2), Math.ceil(metadata.height / 2))
        .png({compressionLevel:9, adaptiveFiltering:true});
    } else pipeline.resize({width:1200, withoutEnlargement:true}).webp({quality:86, effort:6});
    const outputPath = path.join(destination, output);
    await pipeline.toFile(outputPath);
    const optimized = await sharp(outputPath).metadata();
    report.push({source:'assets/'+source, runtime:'assets/runtime/'+output, originalBytes:fs.statSync(input).size, runtimeBytes:fs.statSync(outputPath).size, originalSize:[metadata.width,metadata.height], runtimeSize:[optimized.width,optimized.height], decodedBytes:optimized.width*optimized.height*4});
  }
  const art = JSON.parse(fs.readFileSync(path.join(root,'game/rendering/art.json')));
  for (const [key, source] of Object.entries(atlasSources)) await convert(source, key+'.png', true);
  fs.writeFileSync(path.join(root,'game/rendering/art-runtime.json'), JSON.stringify(Object.fromEntries(Object.entries(art).map(([key,data]) => [key,scaledMetadata(data)])),null,2)+'\n');
  for (const [key, source] of [['menu-hero','hero'],['menu-hero-formal','hero-formal']]) {
    await convert('menu/'+source+'.png',key+'.png',true);
    const metadataName = source === 'hero' ? 'menu-art' : 'menu-formal-art';
    const data = JSON.parse(fs.readFileSync(path.join(root,'game/rendering/'+metadataName+'.json')));
    fs.writeFileSync(path.join(root,'game/rendering/'+metadataName+'-runtime.json'),JSON.stringify(scaledMetadata(data),null,2)+'\n');
  }
  await require('./pack-menu-figures.cjs')(root,sharp,report);
  for (const name of ['entrance','stream','bridge','clearing','mist','refuge']) await convert('backgrounds/v3/'+name+'.png',name+'.webp');
  for (const name of ['beginning','middle','ending']) await convert('menu/'+name+'.png','menu-'+name+'.webp');
  await convert('props/v3/ground.png','ground.webp');
  await convert('backgrounds/library.png','library.webp');
  await convert('props/v3/foreground.png','foreground.png',true);
  fs.writeFileSync(path.join(root,'game/rendering/asset-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({assets:report.length, originalBytes:report.reduce((s,a)=>s+a.originalBytes,0), runtimeBytes:report.reduce((s,a)=>s+a.runtimeBytes,0)}));
})().catch(error=>{console.error(error);process.exit(1)});
