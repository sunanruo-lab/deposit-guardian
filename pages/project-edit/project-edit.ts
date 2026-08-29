import { emptyProject } from '../../utils/project';
import { getProject, saveProject, deleteProject } from '../../utils/storage';
import { STAGES } from '../../utils/constants';

Page({
  data: {
    p: emptyProject(),
    stages: STAGES,
    stageIndex: 0,
    dirty: false,
    editing: false
  },

  onLoad(o: any) {
    if (o.id) {
      const p = getProject(o.id);
      if (p) {
        this.setData({ p, editing: true, stageIndex: STAGES.indexOf(p.stage) });
      }
    }
  },

  onFieldBlur(e: any) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    const value = e.detail.value;
    if ((this.data.p as any)[key] === value) return;
    this.setData({ [`p.${key}`]: value, dirty: true });
  },

  onDateChange(e: any) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;
    this.setData({ [`p.${key}`]: e.detail.value, dirty: true });
  },

  onStageChange(e: any) {
    const i = Number(e.detail.value);
    this.setData({ 'p.stage': STAGES[i], stageIndex: i, dirty: true });
  },

  save(e: any) {
    const values = (e && e.detail && e.detail.value) || {};
    const p: any = {
      ...this.data.p,
      name: values.name || '',
      address: values.address || '',
      tenant: values.tenant || '',
      landlord: values.landlord || '',
      rent: values.rent || 0,
      deposit: values.deposit || 0,
      note: values.note || ''
    };

    if (!String(p.name || '').trim() || !String(p.address || '').trim() || !String(p.tenant || '').trim() || !p.startDate || !p.endDate) {
      wx.showToast({ title: '请完整填写必填项', icon: 'none' });
      return;
    }
    if (p.endDate < p.startDate) {
      wx.showToast({ title: '结束日期不能早于开始日期', icon: 'none' });
      return;
    }
    p.rent = Number(p.rent || 0);
    p.deposit = Number(p.deposit || 0);
    p.updatedAt = Date.now();
    if (p.rent < 0 || p.deposit < 0 || !Number.isFinite(p.rent) || !Number.isFinite(p.deposit)) {
      wx.showToast({ title: '金额格式不正确', icon: 'none' });
      return;
    }
    saveProject(p);
    this.setData({ p, dirty: false });
    wx.showToast({ title: '保存成功' });
    setTimeout(() => wx.navigateBack(), 500);
  },

  del() {
    wx.showModal({
      title: '二次确认',
      content: '确定永久删除此房屋档案？',
      confirmColor: '#C85C54',
      success: (r: any) => {
        if (r.confirm) {
          deleteProject(this.data.p.id);
          this.setData({ dirty: false });
          wx.navigateBack({ delta: 2 });
        }
      }
    });
  },

  onUnload() {
    if (this.data.dirty) {
      wx.showToast({ title: '未保存的修改已丢失', icon: 'none' });
    }
  }
});
