import { emptyProject } from '../../utils/project';
import { getProject, saveProject, deleteProject } from '../../utils/storage';
import { STAGES } from '../../utils/constants';

const FIELD_META: any = {
  name: { title: '项目名称', placeholder: '例如：上海静安一居室' },
  address: { title: '房屋地址', placeholder: '填写详细地址' },
  tenant: { title: '租客姓名', placeholder: '例如：张三' },
  landlord: { title: '房东/中介称呼', placeholder: '例如：李房东' },
  rent: { title: '月租金额', placeholder: '例如：3500' },
  deposit: { title: '押金金额', placeholder: '例如：3500' },
  note: { title: '补充备注', placeholder: '可记录合同编号、特殊约定等' }
};

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

  editText(e: any) {
    const key = e.currentTarget.dataset.key;
    const meta = FIELD_META[key];
    if (!meta) return;
    const current = String((this.data.p as any)[key] || '');

    wx.showModal({
      title: meta.title,
      content: current,
      editable: true,
      placeholderText: meta.placeholder,
      confirmText: '保存',
      cancelText: '取消',
      success: (res: any) => {
        if (!res.confirm) return;
        const value = typeof res.content === 'string' ? res.content : '';
        this.setData({ [`p.${key}`]: value, dirty: true });
      }
    });
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

  save() {
    const p: any = { ...this.data.p };

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
