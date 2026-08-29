import { Project, Store } from '../types/models';
const KEY='dg_store_v1';
export function ensureStore():Store { const s=wx.getStorageSync(KEY); if(s&&s.version===1&&Array.isArray(s.projects)) return s; const n:Store={version:1,projects:[]}; wx.setStorageSync(KEY,n); return n; }
export const getStore=():Store=>ensureStore();
export function saveStore(s:Store){ s.version=1; wx.setStorageSync(KEY,s); }
export const listProjects=()=>getStore().projects.sort((a,b)=>b.updatedAt-a.updatedAt);
export const getProject=(id:string)=>getStore().projects.find(p=>p.id===id);
export function saveProject(p:Project){ const s=getStore(); const i=s.projects.findIndex(x=>x.id===p.id); p.updatedAt=Date.now(); if(i<0)s.projects.unshift(p);else s.projects[i]=p; saveStore(s); }
export function deleteProject(id:string){const s=getStore();s.projects=s.projects.filter(p=>p.id!==id);saveStore(s);}
export function clearStore(){wx.setStorageSync(KEY,{version:1,projects:[]});}
export function validateStore(x:any):x is Store{return !!x&&x.version===1&&Array.isArray(x.projects)&&x.projects.every((p:any)=>p&&typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.rooms)&&Array.isArray(p.checks));}
export function mergeStore(incoming:Store){const s=getStore(); const ids=new Set(s.projects.map(p=>p.id)); incoming.projects.forEach(p=>{if(ids.has(p.id))p.id=`${p.id}_import_${Date.now()}`;s.projects.push(p)});saveStore(s);}
