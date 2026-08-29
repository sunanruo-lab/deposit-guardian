import { listProjects, deleteProject, saveProject } from '../../utils/storage';
import { progress } from '../../utils/project';
import { uid } from '../../utils/constants';
Page({
 data:{all:[] as any[],items:[] as any[],q:'',stage:'全部阶段',stages:['全部阶段','入住检查','租住中','准备退租','已经退租'],stageIndex:0,sortDesc:true},
 onShow(){this.load();},
 load(){const all=listProjects().map(p=>({...p,prog:progress(p).pct}));this.setData({all},()=>this.filter());},
 editSearch(){wx.showModal({title:'搜索房屋档案',content:this.data.q,editable:true,placeholderText:'输入项目名称或地址',confirmText:'搜索',success:(r:any)=>{if(r.confirm)this.setData({q:r.content||''},()=>this.filter());}});},
 clearSearch(){this.setData({q:''},()=>this.filter());},
 stageChange(e:any){const i=Number(e.detail.value);this.setData({stageIndex:i,stage:this.data.stages[i]},()=>this.filter());},
 toggleSort(){this.setData({sortDesc:!this.data.sortDesc},()=>this.filter());},
 filter(){let a=this.data.all.filter((p:any)=>(!this.data.q||(p.name+p.address).includes(this.data.q))&&(this.data.stage==='全部阶段'||p.stage===this.data.stage));a.sort((x:any,y:any)=>(this.data.sortDesc?y.createdAt-x.createdAt:x.createdAt-y.createdAt));this.setData({items:a});},
 create(){wx.navigateTo({url:'/pages/project-edit/project-edit'});},open(e:any){wx.navigateTo({url:`/pages/project-detail/project-detail?id=${e.currentTarget.dataset.id}`});},edit(e:any){wx.navigateTo({url:`/pages/project-edit/project-edit?id=${e.currentTarget.dataset.id}`});},
 copy(e:any){const src=listProjects().find(p=>p.id===e.currentTarget.dataset.id);if(!src)return;const p=JSON.parse(JSON.stringify(src));p.id=uid('project');p.name=`${p.name}（副本）`;p.createdAt=p.updatedAt=Date.now();p.reports=[];saveProject(p);wx.showToast({title:'已复制'});this.load();},
 del(e:any){const id=e.currentTarget.dataset.id;wx.showModal({title:'删除房屋档案？',content:'档案数据将被删除，已保存到本机的报告图片不会自动删除。',confirmColor:'#C85C54',success:(r:any)=>{if(r.confirm){deleteProject(id);this.load();}}});}
});
