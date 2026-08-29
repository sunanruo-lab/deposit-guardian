import { Project } from '../types/models';
import { DEFAULT_ROOMS, uid } from './constants';
export function emptyProject():Project{return {id:uid('project'),name:'',address:'',landlord:'',tenant:'',startDate:'',endDate:'',deposit:0,rent:0,createdAt:Date.now(),updatedAt:Date.now(),stage:'入住检查',rooms:JSON.parse(JSON.stringify(DEFAULT_ROOMS)),checks:[],meters:[],keys:[],assets:[],issues:[],note:'',reports:[]};}
export function progress(p:Project,phase:'入住'|'退租'='入住'){const total=p.rooms.reduce((n,r)=>n+r.items.length,0);const done=p.checks.filter(c=>c.phase===phase&&c.status!=='尚未检查').length;return {total,done,pct:total?Math.round(done/total*100):0,left:Math.max(0,total-done)};}
export function fmt(ts:number){const d=new Date(ts);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
