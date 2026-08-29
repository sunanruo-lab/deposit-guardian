import { ensureStore } from './utils/storage';
App({
  onLaunch() {
    ensureStore();
  },
  globalData: { activeProjectId: '' }
});
