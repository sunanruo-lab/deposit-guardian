import { PhotoRef } from '../types/models';
import { uid } from './constants';
const fs=wx.getFileSystemManager();
const base=()=>`${wx.env.USER_DATA_PATH}/dg_photos`;
function ensureDir(){try{fs.accessSync(base())}catch(e){fs.mkdirSync(base(),true)}}
export async function choosePersistentPhotos(count=9):Promise<PhotoRef[]>{
  ensureDir();
  const chosen:any=await new Promise((resolve,reject)=>wx.chooseMedia({count,mediaType:['image'],sourceType:['album','camera'],sizeType:['compressed'],success:resolve,fail:reject}));
  const out:PhotoRef[]=[];
  for(const f of chosen.tempFiles){
    const compressed:any=await new Promise((resolve)=>wx.compressImage({src:f.tempFilePath,quality:75,success:resolve,fail:()=>resolve({tempFilePath:f.tempFilePath})}));
    const ext=(compressed.tempFilePath.match(/\.[a-zA-Z0-9]+$/)||['.jpg'])[0]; const id=uid('photo'); const dest=`${base()}/${id}${ext}`;
    await new Promise((resolve,reject)=>fs.copyFile({srcPath:compressed.tempFilePath,destPath:dest,success:resolve,fail:reject}));
    out.push({id,path:dest,createdAt:Date.now()});
  }
  return out;
}
export function removePhoto(p?:PhotoRef){if(!p)return;try{fs.unlinkSync(p.path)}catch(e){}}
export function cleanupUnused(used:Set<string>):number{ensureDir();let n=0;for(const f of fs.readdirSync(base())){const p=`${base()}/${f}`;if(!used.has(p)){try{fs.unlinkSync(p);n++}catch(e){}}}return n;}
export function persistTempImage(tempPath:string,prefix='file'):string{ensureDir();const ext=(tempPath.match(/\.[a-zA-Z0-9]+$/)||['.png'])[0];const dest=`${base()}/${uid(prefix)}${ext}`;fs.copyFileSync(tempPath,dest);return dest;}
