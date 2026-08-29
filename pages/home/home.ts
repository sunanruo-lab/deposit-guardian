import { listProjects } from '../../utils/storage';
import { progress, fmt } from '../../utils/project';
Page({
 data:{projects:[] as any[],active:null as any,prog:{done:0,total:0,pct:0,left:0},recentReport:null as any},
 onLoad(){if(!wx.getStorageSync('dg_privacy_seen'))setTimeout(()=>wx.navigateTo({url:'/pages/privacy/privacy?first=1'}),200);},
 onShow(){const projects=listProjects();const active=projects[0]||null;this.setData({projects:projects.slice(0,3),active,prog:active?progress(active):{done:0,total:0,pct:0,left:0},recentReport:active&&active.reports[0]?{...active.reports[0],date:fmt(active.reports[0].createdAt)}:null});},
 create(){wx.navigateTo({url:'/pages/project-edit/project-edit'});},
 open(e:any){wx.navigateTo({url:`/pages/project-detail/project-detail?id=${e.currentTarget.dataset.id}`});},
 go(e:any){if(!this.data.active){wx.showToast({title:'请先创建房屋档案',icon:'none'});return;}const path=e.currentTarget.dataset.path;wx.navigateTo({url:`/pages/${path}/${path}?id=${this.data.active.id}`});},
 previewReport(){const r=this.data.active.reports[0];if(r&&r.paths.length)wx.previewImage({urls:r.paths,current:r.paths[0]});}
});
