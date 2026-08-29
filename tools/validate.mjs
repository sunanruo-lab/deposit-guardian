import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(new URL('..',import.meta.url).pathname);const errors=[];const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let app;try{app=JSON.parse(read('app.json'));}catch(e){errors.push(`app.json 无法解析: ${e.message}`);app={pages:[]};}
for(const file of fs.readdirSync(root,{recursive:true}).filter(x=>x.endsWith('.json'))){try{JSON.parse(read(file));}catch(e){errors.push(`${file} JSON 无法解析: ${e.message}`);}}
for(const page of app.pages||[])for(const ext of ['ts','wxml','wxss','json'])if(!fs.existsSync(path.join(root,`${page}.${ext}`)))errors.push(`缺少页面文件: ${page}.${ext}`);
const required=['project.config.json','app.ts','app.wxss','types/models.ts','utils/storage.ts','utils/photo.ts','utils/report.ts','README.md'];for(const f of required)if(!fs.existsSync(path.join(root,f)))errors.push(`缺少核心文件: ${f}`);
const all=fs.readdirSync(root,{recursive:true}).filter(x=>/\.(ts|wxml|json)$/.test(x)).map(read).join('\n');
for(const banned of ['wx.cloud','request({','uploadFile({','TODO','功能开发中'])if(all.includes(banned))errors.push(`发现禁止内容: ${banned}`);
const tags=[...all.matchAll(/bind(?:tap|change|input|touchstart|touchmove|touchend)="([A-Za-z0-9_]+)"/g)].map(x=>x[1]);
for(const page of app.pages||[]){const w=read(`${page}.wxml`),t=read(`${page}.ts`);for(const m of w.matchAll(/bind(?:tap|change|input|touchstart|touchmove|touchend)="([A-Za-z0-9_]+)"/g))if(!new RegExp(`\\b${m[1]}\\s*\\(`).test(t))errors.push(`${page}.wxml 事件 ${m[1]} 未在同页 TS 中实现`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}console.log(`验证通过：${app.pages.length} 个页面，JSON/页面配套/事件处理/禁用依赖检查均通过。`);
