export type Stage = '入住检查'|'租住中'|'准备退租'|'已经退租';
export type Phase = '入住'|'退租';
export type CheckStatus = '正常'|'有轻微问题'|'有明显损坏'|'无法使用'|'房屋内没有此项'|'尚未检查';
export type Severity = '轻微'|'一般'|'严重';
export interface PhotoRef { id:string; path:string; createdAt:number; }
export interface CheckRecord { id:string; roomId:string; itemName:string; phase:Phase; status:CheckStatus; photos:PhotoRef[]; note:string; severity:Severity; checkedAt:number; comparison?:'无变化'|'已经修复'|'新增损坏'|'状态不确定'; }
export interface Room { id:string; name:string; items:string[]; custom?:boolean; }
export interface MeterRecord { id:string; name:string; reading:number; unit:string; phase:Phase; photo?:PhotoRef; recordedAt:number; note:string; }
export interface KeyRecord { id:string; name:string; received:number; returned:number; photo?:PhotoRef; note:string; isReturned:boolean; }
export interface AssetRecord { id:string; name:string; room:string; brand:string; model:string; quantity:number; status:string; photos:PhotoRef[]; testResult:string; note:string; landlordOwned:boolean; }
export interface Issue { id:string; room:string; itemName:string; type:string; description:string; photos:PhotoRef[]; severity:Severity; recordedAt:number; phase:Phase; resolved:boolean; resolution:string; }
export interface Confirmation { tenantName:string; landlordName:string; tenantContact:string; landlordContact:string; date:string; note:string; tenantSignature?:string; landlordSignature?:string; }
export interface ReportRecord { id:string; type:string; createdAt:number; paths:string[]; }
export interface MoveOut { depositReturned:number; withheldReason:string; handoverAt:string; }
export interface Project { id:string; name:string; address:string; landlord:string; tenant:string; startDate:string; endDate:string; deposit:number; rent:number; createdAt:number; updatedAt:number; stage:Stage; rooms:Room[]; checks:CheckRecord[]; meters:MeterRecord[]; keys:KeyRecord[]; assets:AssetRecord[]; issues:Issue[]; note:string; confirmation?:Confirmation; moveOut?:MoveOut; reports:ReportRecord[]; }
export interface Store { version:1; projects:Project[]; }
