import { Room } from '../types/models';
export const DISCLAIMER='本工具仅用于整理和保存交接记录，不构成法律意见或证据效力承诺。';
export const STAGES=['入住检查','租住中','准备退租','已经退租'];
export const CHECK_STATUSES=['尚未检查','正常','有轻微问题','有明显损坏','无法使用','房屋内没有此项'];
export const SEVERITIES=['轻微','一般','严重'];
export const DEFAULT_ROOMS:Room[]=[
  {id:'entry',name:'入户区域',items:['入户门','门锁','猫眼','门铃','墙面','地面','电箱']},
  {id:'living',name:'客厅',items:['墙面','墙纸或乳胶漆','地板','踢脚线','窗户','窗帘','灯具','插座','空调','家具']},
  {id:'bedroom',name:'卧室',items:['墙面','墙纸或乳胶漆','地板','踢脚线','窗户','窗帘','灯具','插座','空调','家具']},
  {id:'kitchen',name:'厨房',items:['橱柜','台面','水槽','水龙头','下水','燃气灶','抽油烟机','冰箱','热水器','插座','墙砖和地砖']},
  {id:'bathroom',name:'卫生间',items:['马桶','洗手池','淋浴','地漏','防水','热水器','浴霸','镜柜','门锁','墙砖和地砖']},
  {id:'balcony',name:'阳台',items:['墙面','地面','窗户','晾衣架','排水口']},
  {id:'other',name:'其他区域',items:['墙面','地面','照明','插座']}
];
export const KEY_TEMPLATES=['入户门钥匙','房间钥匙','信箱钥匙','门禁卡','电梯卡','车位卡'];
export const ASSET_TEMPLATES=['床','衣柜','沙发','餐桌','空调','冰箱','洗衣机','热水器','电视','微波炉'];
export const METER_TEMPLATES=[{name:'电表',unit:'kWh'},{name:'水表',unit:'m³'},{name:'燃气表',unit:'m³'}];
export const uid=(prefix='id')=>`${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
