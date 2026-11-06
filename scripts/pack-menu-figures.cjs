const fs=require('node:fs');
const path=require('node:path');
/** Preserve the original figure resolution, packing only the two poses needed by a menu. */
module.exports=async function packMenuFigures(root,sharp,report){
 const variants={beginning:['hero','menu-art',0],middle:['hero-formal','menu-formal-art',1],ending:['hero','menu-art',2]};
 const result={};
 for(const [theme,[sourceName,metaName,column]]of Object.entries(variants)){
  const source=`assets/menu/${sourceName}.png`,input=path.join(root,source);
  const original=JSON.parse(fs.readFileSync(path.join(root,`game/rendering/${metaName}.json`)));
  const selected=[original.frames[column],original.frames[column+3]];
  const cellWidth=Math.max(...selected.map(f=>f.width))+4,baseline=Math.max(...selected.map(f=>f.anchorY-f.y));
  const height=baseline+2,width=cellWidth*2,layers=[],frames=[];
  for(let i=0;i<2;i++){
   const f=selected[i],left=i*cellWidth+2,top=baseline-(f.anchorY-f.y);
   layers.push({input:await sharp(input).extract({left:f.x,top:f.y,width:f.width,height:f.height}).png().toBuffer(),left,top});
   frames.push({x:left,y:top,width:f.width,height:f.height,anchorX:left+f.anchorX-f.x,anchorY:baseline});
  }
  const runtime=`assets/runtime/menu-figure-${theme}.png`;
  await sharp({create:{width,height,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(layers).png({compressionLevel:9,adaptiveFiltering:true}).toFile(path.join(root,runtime));
  result[theme]={width,height,referenceHeight:original.referenceHeight,frames};
  report.push({source,runtime,originalBytes:fs.statSync(input).size,runtimeBytes:fs.statSync(path.join(root,runtime)).size,originalSize:[original.width,original.height],runtimeSize:[width,height],decodedBytes:width*height*4});
 }
 fs.writeFileSync(path.join(root,'game/rendering/menu-figures.json'),JSON.stringify(result,null,2)+'\n');
};
