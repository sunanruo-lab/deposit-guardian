import { Project } from '../types/models';
import { DISCLAIMER, uid } from './constants';
import { fmt, progress } from './project';
const fs=wx.getFileSystemManager();
type Block={title?:string;lines:string[];images?:string[];h?:number};
const wrap=(s:string,n=34)=>{const out:string[]=[];let line='';for(const ch of String(s||'')){line+=ch;if(line.length>=n){out.push(line);line='';}}if(line)out.push(line);return out.length?out:['—'];};
function makeBlocks(p:Project,type:string):Block[]{
 const b:Block[]=[];const ip=progress(p,'入住'),op=progress(p,'退租');
 b.push({title:'房屋基本信息',lines:[`项目：${p.name}`,`地址：${p.address}`,`租客：${p.tenant}　房东/中介：${p.landlord||'未填写'}`,`租期：${p.startDate} 至 ${p.endDate}`,`月租：¥${p.rent}　押金：¥${p.deposit}`,`当前阶段：${p.stage}`,`入住完成度：${ip.done}/${ip.total}（${ip.pct}%）`,`退租完成度：${op.done}/${op.total}（${op.pct}%）`]});
 const phases=type==='入住交接报告'?['入住']:type==='退租交接报告'?['退租']:['入住','退租'];
 phases.forEach(ph=>{p.rooms.forEach(room=>{const rows=p.checks.filter(c=>c.phase===ph&&c.roomId===room.id);if(rows.length)b.push({title:`${ph}检查 · ${room.name}`,lines:rows.map(x=>`${x.itemName}｜${x.status}${x.note?'｜'+x.note:''}${x.comparison?'｜'+x.comparison:''}`),images:rows.flatMap(x=>x.photos.map(y=>y.path)).slice(0,4)});});});
 if(type!=='水电燃气读数报告'){
  b.push({title:`问题档案（${p.issues.length}）`,lines:p.issues.length?p.issues.map(x=>`${x.phase}｜${x.room}·${x.itemName}｜${x.severity}｜${x.resolved?'已解决':'未解决'}｜${x.description}${x.resolution?'｜'+x.resolution:''}`):['暂无问题记录'],images:p.issues.flatMap(x=>x.photos.map(y=>y.path)).slice(0,6)});
  b.push({title:`钥匙与门禁（${p.keys.length}）`,lines:p.keys.length?p.keys.map(x=>`${x.name}｜入住收到 ${x.received}｜退租归还 ${x.returned}｜${x.isReturned?'已归还':'未归还'}${x.note?'｜'+x.note:''}`):['暂无钥匙与门禁记录'],images:p.keys.flatMap(x=>x.photo?[x.photo.path]:[]).slice(0,4)});
  b.push({title:`家具家电（${p.assets.length}）`,lines:p.assets.length?p.assets.map(x=>`${x.room}｜${x.name}×${x.quantity}｜${x.status}｜${x.testResult}｜${x.landlordOwned?'房东物品':'租客物品'}${x.note?'｜'+x.note:''}`):['暂无家具家电记录'],images:p.assets.flatMap(x=>x.photos.map(y=>y.path)).slice(0,6)});
 }
 const meterNames=Array.from(new Set(p.meters.map(x=>x.name)));b.push({title:'水电燃气及其他表计',lines:meterNames.length?meterNames.map(n=>{const a=p.meters.find(x=>x.name===n&&x.phase==='入住'),z=p.meters.find(x=>x.name===n&&x.phase==='退租');const diff=a&&z?Number((z.reading-a.reading).toFixed(3)):'待记录';return `${n}｜入住 ${a?a.reading+a.unit:'未记录'}｜退租 ${z?z.reading+z.unit:'未记录'}｜差值 ${diff}`;}):['暂无表计记录'],images:p.meters.flatMap(x=>x.photo?[x.photo.path]:[]).slice(0,6)});
 if(p.moveOut)b.push({title:'退租押金与交接',lines:[`实际返还押金：¥${p.moveOut.depositReturned}`,`未返还原因：${p.moveOut.withheldReason||'无'}`,`交接时间：${p.moveOut.handoverAt||'未填写'}`]});
 const c=p.confirmation;b.push({title:'双方确认与补充说明',lines:c?[`租客：${c.tenantName}${c.tenantContact?'｜'+c.tenantContact:''}`,`房东/中介：${c.landlordName}${c.landlordContact?'｜'+c.landlordContact:''}`,`交接日期：${c.date}`,`补充说明：${c.note||'无'}`]:['尚未填写双方确认'],images:c?[c.tenantSignature,c.landlordSignature].filter(Boolean) as string[]:[]});
 b.push({title:'项目补充备注',lines:[p.note||'无']});b.push({title:'免责声明',lines:wrap(DISCLAIMER,30)});return b;
}
function blockHeight(b:Block){const lines=b.lines.flatMap(x=>wrap(x));const imageRows=b.images?.length?Math.ceil(Math.min(6,b.images.length)/3):0;return 54+lines.length*34+imageRows*150+22;}
function paginate(blocks:Block[]){const pages:Block[][]=[];let page:Block[]=[];let used=110;for(const b of blocks){const h=blockHeight(b);if(page.length&&used+h>970){pages.push(page);page=[];used=110;}if(h>850){const expanded=b.lines.flatMap(x=>wrap(x));const size=b.images?.length?10:18;const chunks:Block[]=[];for(let i=0;i<expanded.length;i+=size)chunks.push({...b,title:i?`${b.title}（续）`:b.title,lines:expanded.slice(i,i+size),images:i?[]:b.images});for(const c of chunks){const ch=blockHeight(c);if(page.length&&used+ch>970){pages.push(page);page=[];used=110;}page.push(c);used+=ch;}}else{page.push(b);used+=h;}}if(page.length)pages.push(page);return pages;}
const drawText=(ctx:any,s:string,x:number,y:number,max=34)=>{const lines=wrap(s,max);for(const l of lines){ctx.fillText(l,x,y);y+=34;}return y;};
export async function generateReport(p:Project,type:string,page:any,onProgress:(n:number,total:number)=>void):Promise<string[]>{
 const pages=paginate(makeBlocks(p,type));const dir=`${wx.env.USER_DATA_PATH}/dg_reports`;try{fs.accessSync(dir)}catch(e){fs.mkdirSync(dir,true)}const paths:string[]=[];
 for(let pi=0;pi<pages.length;pi++){onProgress(pi+1,pages.length);const ctx=wx.createCanvasContext('reportCanvas',page);ctx.setFillStyle('#F7F3EA');ctx.fillRect(0,0,750,1100);ctx.setFillStyle('#244A3D');ctx.fillRect(0,0,750,92);ctx.setFillStyle('#FFFFFF');ctx.setFontSize(27);ctx.fillText(type,34,42);ctx.setFontSize(18);ctx.fillText(p.name,34,70);let y=125;
  for(const b of pages[pi]){ctx.setFillStyle('#244A3D');ctx.setFontSize(22);ctx.fillText(b.title||'',34,y);y+=34;ctx.setFillStyle('#252A28');ctx.setFontSize(18);for(const l of b.lines){y=drawText(ctx,l,42,y,38);}if(b.images?.length){let col=0;for(const img of b.images.slice(0,6)){try{ctx.drawImage(img,42+col%3*216,y+Math.floor(col/3)*142,198,124);}catch(e){}col++;}y+=Math.ceil(Math.min(6,b.images.length)/3)*142;}ctx.setStrokeStyle('#D7D2C8');ctx.beginPath();ctx.moveTo(34,y+8);ctx.lineTo(716,y+8);ctx.stroke();y+=30;}
  ctx.setFillStyle('#7A817D');ctx.setFontSize(16);ctx.fillText(`${p.name}　${pi+1}/${pages.length}　生成：${fmt(Date.now()).slice(0,10)}`,34,1065);
  await new Promise<void>((resolve,reject)=>ctx.draw(false,()=>setTimeout(resolve,100)));
  const tmp:any=await new Promise((resolve,reject)=>wx.canvasToTempFilePath({canvasId:'reportCanvas',x:0,y:0,width:750,height:1100,destWidth:1500,destHeight:2200,fileType:'jpg',quality:.92,success:resolve,fail:reject},page));const dest=`${dir}/${uid('report')}_${pi+1}.jpg`;fs.copyFileSync(tmp.tempFilePath,dest);paths.push(dest);
 }
 return paths;
}
