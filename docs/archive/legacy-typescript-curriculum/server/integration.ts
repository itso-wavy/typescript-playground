import type { LessonFixture } from './types.js';
const missing = (name: string) => [{ name: '필수 export 누락', files: { 'index.ts': `export const ${name}=undefined;` } }];

export const fixtures: LessonFixture[] = [
  { lessonId:'p29', typeTests:`import { renderRow } from './index.js'; import type { RowRenderer } from './table.js';
const text:string=renderRow({id:'1',name:'A'}); type VipRow={id:string;name:string;vip:boolean}; const onlyVip=(row:VipRow)=>row.name;
// @ts-expect-error a callback requiring vip cannot render every Row
const cannotRenderEveryRow:RowRenderer=onlyVip;
const canRenderVip:(row:VipRow)=>string=renderRow;`, alternatives:[{'index.ts':`import type{RowRenderer}from'./table.js';export const renderRow:RowRenderer=({name})=>name;`}], invalid:missing('renderRow') },
  { lessonId:'p30', typeTests:`import { track } from './index.js';track('checkout_completed',{orderId:'o1'});
// @ts-expect-error unknown event
track('typo',{orderId:'o1'});
// @ts-expect-error payload requires orderId
track('checkout_started',{});`, alternatives:[{'analytics.d.ts':`declare module 'analytics'{export function track(event:'checkout_started'|'checkout_completed',payload:{orderId:string}):void}`,'index.ts':`import {track}from'analytics';export{track};track('checkout_started',{orderId:'o1'});`}], invalid:[{name:'any track 선언',files:{'analytics.d.ts':`declare module 'analytics'{export const track:any}`,'index.ts':`import {track}from'analytics';export{track};track('checkout_started',{orderId:'o1'});`}}] },
  { lessonId:'p31', typeTests:`import { format } from './index.js';const id:string=format({id:'o1'});`, alternatives:[{'index.ts':`import type{Order}from'./model.js';import{label}from'./model.js';export const format=(o:Order)=>label(o);`}], invalid:missing('format'), compilerOptions:{verbatimModuleSyntax:true} },
  { lessonId:'p32', typeTests:`import { patchNickname, type ProfilePatch } from './index.js';const empty:ProfilePatch=patchNickname(undefined);const set:ProfilePatch=patchNickname('민지');const clear:ProfilePatch=patchNickname(null);if(Object.hasOwn(clear,'nickname')){const value:string|null=clear.nickname!;}
// @ts-expect-error explicit undefined is not a patch value
const bad:ProfilePatch={nickname:undefined};`, runtimeTests:`const omitted=learner.patchNickname(undefined);const set=learner.patchNickname('민지');const clear=learner.patchNickname(null);check('undefined omits key',!Object.hasOwn(omitted,'nickname'));check('string keeps key',Object.hasOwn(set,'nickname')&&set.nickname==='민지');check('null survives JSON',JSON.stringify(clear)==='{"nickname":null}');`, alternatives:[{'index.ts':`export type ProfilePatch={nickname?:string|null};export const patchNickname=(nickname:string|null|undefined):ProfilePatch=>nickname===undefined?{}:{nickname};`}], invalid:[{name:'단언으로 undefined 키를 숨긴 patch',files:{'index.ts':`export type ProfilePatch={nickname?:string|null};export const patchNickname=(nickname:string|null|undefined):ProfilePatch=>({nickname} as ProfilePatch);`}}], compilerOptions:{exactOptionalPropertyTypes:true} },
];
