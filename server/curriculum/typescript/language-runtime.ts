import type { LessonFixture } from '../types.js';

const missing = (name: string) => [{ name: '필수 export 누락', files: { 'index.ts': `export const ${name}=undefined;` } }];

export const fixtures: LessonFixture[] = [
  {
    lessonId: 'ts18.class-value-type',
    typeTests: `import { MemoryOrderStore, type OrderStore } from './index.js';
const Constructor: typeof MemoryOrderStore=MemoryOrderStore;const store:OrderStore=new Constructor();store.save({id:'ord_1',total:1});const found=store.find('ord_1');if(found){const total:number=found.total;}
// @ts-expect-error store contract requires an Order
store.save({id:'ord_2'});`,
    runtimeTests: `const store=new learner.MemoryOrderStore();check('missing is undefined',store.find('missing')===undefined);store.save({id:'ord_1',total:12000});check('saved order found',store.find('ord_1')?.total===12000);store.save({id:'ord_1',total:15000});check('same id updated',store.find('ord_1')?.total===15000);`,
    alternatives: [{ 'index.ts': `export type Order={id:string;total:number};export interface OrderStore{save(order:Order):void;find(id:string):Order|undefined}export class MemoryOrderStore implements OrderStore{private readonly orders:Record<string,Order>={};save(order:Order){this.orders[order.id]=order}find(id:string){return this.orders[id]}}` }],
    invalid: [{ name: 'save가 주문을 보관하지 않는 클래스', files: { 'index.ts': `export type Order={id:string;total:number};export interface OrderStore{save(order:Order):void;find(id:string):Order|undefined}export class MemoryOrderStore implements OrderStore{save(_order:Order):void{}find(_id:string):Order|undefined{return undefined}}` } }],
  },
  {
    lessonId: 'ts19.abstract-contract',
    typeTests: `import { OrderRepository, MemoryOrderRepository } from './index.js';
// @ts-expect-error abstract repository cannot be instantiated
new OrderRepository();const repository:OrderRepository=new MemoryOrderRepository();repository.save({id:'ord_1',total:2});const found=repository.find('ord_1');`,
    runtimeTests: `const repository=new learner.MemoryOrderRepository();repository.save({id:'ord_1',total:2});check('subclass save works',repository.find('ord_1')?.total===2);check('base find handles missing',repository.find('none')===undefined);`,
    alternatives: [{ 'index.ts': `export type Order={id:string;total:number};export abstract class OrderRepository{protected readonly orders=new Map<string,Order>();abstract save(order:Order):void;find(id:string){return this.orders.get(id)}}export class MemoryOrderRepository extends OrderRepository{save(order:Order){this.orders.set(order.id,order)}}` }],
    invalid: [{ name: '하위 저장 구현이 상태를 갱신하지 않음', files: { 'index.ts': `export type Order={id:string;total:number};export abstract class OrderRepository{protected readonly orders=new Map<string,Order>();abstract save(order:Order):void;find(id:string){return this.orders.get(id)}}export class MemoryOrderRepository extends OrderRepository{save(_order:Order):void{}}` } }],
  },
  {
    lessonId: 'ts20.decorator-boundary',
    typeTests: `import { PaymentService, calls } from './index.js';const service=new PaymentService();const result:string=service.charge(100);const names:string[]=calls;
// @ts-expect-error charge requires a number
service.charge('100');`,
    runtimeTests: `check('definition does not log a call',learner.calls.length===0);const first=new learner.PaymentService().charge(100);check('return preserved',first==='charged:100');check('call logged',learner.calls.length===1&&learner.calls[0]==='charge');new learner.PaymentService().charge(200);check('each invocation logged',learner.calls.length===2);`,
    alternatives: [{ 'index.ts': `export const calls:string[]=[];export function logCall<This,Args extends unknown[],Return>(target:(this:This,...args:Args)=>Return,context:ClassMethodDecoratorContext<This,(this:This,...args:Args)=>Return>){return function(this:This,...args:Args){calls.push(String(context.name));return target.apply(this,args)}}export class PaymentService{@logCall charge(total:number){return'charged:'+total}}` }],
    invalid: [{ name: '클래스 정의 시점만 기록하는 데코레이터', files: { 'index.ts': `export const calls:string[]=[];export function logCall<This,Args extends unknown[],Return>(target:(this:This,...args:Args)=>Return,context:ClassMethodDecoratorContext<This,(this:This,...args:Args)=>Return>){calls.push(String(context.name));return target}export class PaymentService{@logCall charge(total:number){return'charged:'+total}}` } }],
  },
  {
    lessonId: 'ts21.enum-or-const-object',
    typeTests: `import { LegacyStatus, ORDER_STATUS, statusLabel, type OrderStatus } from './index.js';const pending:OrderStatus=ORDER_STATUS.pending;const legacy:number=LegacyStatus.Pending;const label:string=statusLabel(ORDER_STATUS.paid);
// @ts-expect-error arbitrary server status is rejected
const unknown:OrderStatus='cancelled';`,
    runtimeTests: `check('const values match JSON',learner.ORDER_STATUS.pending==='pending'&&learner.ORDER_STATUS.paid==='paid');check('pending label',learner.statusLabel('pending')==='결제 대기');check('paid label',learner.statusLabel('paid')==='결제 완료');check('enum creates runtime value',typeof learner.LegacyStatus==='object'&&learner.LegacyStatus.Pending===0);`,
    alternatives: [{ 'index.ts': `export enum LegacyStatus{Pending,Paid}export const ORDER_STATUS={pending:'pending',paid:'paid'}as const;export type OrderStatus=(typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];export const statusLabel=(status:OrderStatus)=>status===ORDER_STATUS.pending?'결제 대기':'결제 완료';` }],
    invalid: [{ name: '모든 문자열을 상태로 허용', files: { 'index.ts': `export enum LegacyStatus{Pending,Paid}export const ORDER_STATUS={pending:'pending',paid:'paid'};export type OrderStatus=string;export const statusLabel=(_status:OrderStatus)=>'주문';` } }],
  },
  {
    lessonId: 'ts22.strict-baseline',
    typeTests: `import { firstLabel, errorMessage, makeProfile, type Profile } from './index.js';const label:string=firstLabel([]);const message:string=errorMessage('실패');const profile:Profile=makeProfile(undefined);
// @ts-expect-error exact optional properties reject explicit undefined
const explicitLiteral:Profile={nickname:undefined};`,
    runtimeTests: `check('empty array handled',learner.firstLabel([])==='없음');check('first label trimmed',learner.firstLabel(['  주문  '])==='주문');check('Error message read',learner.errorMessage(new Error('실패'))==='실패');check('non Error converted',learner.errorMessage('문자열 오류')==='문자열 오류');check('undefined key omitted',!Object.hasOwn(learner.makeProfile(undefined),'nickname'));check('nickname retained',learner.makeProfile('wavy').nickname==='wavy');`,
    alternatives: [{ 'index.ts': `export type Profile={nickname?:string};export const firstLabel=(items:readonly string[])=>{const first=items[0];return first===undefined?'없음':first.trim()};export const errorMessage=(error:unknown)=>error instanceof Error?error.message:String(error);export const makeProfile=(nickname:string|undefined):Profile=>nickname===undefined?{}:{nickname};` }],
    invalid: [{ name: 'optional 키를 undefined 값으로 생성', files: { 'index.ts': `export type Profile={nickname?:string};export const firstLabel=(items:readonly string[])=>items[0]?.trim()??'없음';export const errorMessage=(error:unknown)=>error instanceof Error?error.message:String(error);export const makeProfile=(nickname:string|undefined):Profile=>({nickname} as Profile);` } }],
    compilerOptions: { exactOptionalPropertyTypes: true },
  },
  {
    lessonId: 'ts23.function-variance',
    typeTests: `import { renderRow } from './index.js';import type { RowRenderer } from './table.js';const renderer:RowRenderer=renderRow;const text:string=renderer({id:'1',name:'wavy'});type VipRow={id:string;name:string;vip:boolean};const vipOnly=(row:VipRow)=>row.name;
// @ts-expect-error a vip-only callback cannot render every Row
const unsafe:RowRenderer=vipOnly;const reusable:(row:VipRow)=>string=renderRow;`,
    alternatives: [{ 'index.ts': `import type{RowRenderer}from'./table.js';export const renderRow:RowRenderer=({name})=>name;` }],
    invalid: missing('renderRow'),
  },
  {
    lessonId: 'ts24.script-module-boundary',
    typeTests: `import { format } from './index.js';const value:string=format({id:'ord_1'});
// @ts-expect-error Order requires id
format({});`,
    alternatives: [{ 'legacy-a.ts': `const mode='a';void mode;export{};`, 'legacy-b.ts': `const mode='b';void mode;export{};`, 'index.ts': `import{label}from'./model.js';import type{Order}from'./model.js';export const format=(order:Order)=>label(order);` }],
    invalid: [{ name: '전역 스크립트 충돌을 남김', files: { 'legacy-a.ts': `const mode='a';void mode;`, 'legacy-b.ts': `const mode='b';void mode;`, 'index.ts': `import type{Order}from'./model.js';import{label}from'./model.js';export const format=(order:Order)=>label(order);` } }],
    compilerOptions: { verbatimModuleSyntax: true },
  },
  {
    lessonId: 'ts25.declaration-file',
    typeTests: `import { track } from './index.js';track('checkout_completed',{orderId:'ord_1'});
// @ts-expect-error unknown event
track('checkout_cancelled',{orderId:'ord_1'});
// @ts-expect-error payload requires orderId
track('checkout_started',{});`,
    alternatives: [{ 'analytics.d.ts': `declare module'analytics'{export function track(event:'checkout_started'|'checkout_completed',payload:{orderId:string}):void}` }],
    invalid: [{ name: 'any로 모든 호출을 허용하는 선언', files: { 'analytics.d.ts': `declare module'analytics'{export const track:any}` } }],
  },
  {
    lessonId: 'ts26.package-contract',
    typeTests: `import { formatOrder } from './index.js';const formatted:string=formatOrder('ord_1');
// @ts-expect-error wrapper accepts an id string only
formatOrder({id:'ord_1'});type IsAny<T>=0 extends(1&T)?true:false;type ExpectFalse<T extends false>=T;type ResultIsNotAny=ExpectFalse<IsAny<ReturnType<typeof formatOrder>>>;`,
    alternatives: [{ 'index.ts': `import formatter from'./legacy-formatter.js';export const formatOrder=(id:string):string=>formatter(id,{uppercase:true});` }],
    invalid: missing('formatOrder'),
  },
  {
    lessonId: 'ts27.mapped-errors',
    typeTests: `import type { FieldErrors } from './index.js';type OrderForm={title:string;quantity:number;note:string};const errors:FieldErrors<OrderForm>={quantity:['0 이상이어야 합니다.']};const titleErrors:string[]|undefined=errors.title;
// @ts-expect-error unknown fields are not accepted
const unknown:FieldErrors<OrderForm>={total:['잘못된 필드']};`,
    alternatives: [{ 'index.ts': `export type FieldErrors<T>={[Key in keyof T]?:string[]};` }],
    invalid: [{ name: '임의 문자열 키를 허용하는 오류 타입', files: { 'index.ts': `export type FieldErrors<T>=Record<string,string[]>;` } }],
  },
  {
    lessonId: 'ts28.infer-and-distribution',
    typeTests: `import type { PayloadOf, IsAllPayload } from './index.js';type Events={type:'created';payload:{id:string}}|{type:'paid';payload:{total:number}}|{type:'idle'};const payload:PayloadOf<Events>={id:'ord_1'};const total:PayloadOf<Events>={total:1};const all:IsAllPayload<Events>=false;const yes:IsAllPayload<{payload:1}|{payload:2}>=true;type ExpectFalse<T extends false>=T;type EveryEventMustBeFalse=ExpectFalse<IsAllPayload<Events>>;
// @ts-expect-error payload is not wrapped in an array
const array:PayloadOf<Events>=[{id:'ord_1'}];`,
    alternatives: [{ 'index.ts': `export type PayloadOf<T>=T extends{payload:infer Payload}?Payload:never;export type IsAllPayload<T>=[T]extends[{payload:unknown}]?true:false;` }],
    invalid: [{ name: '유니온 전체 검사도 분산시킴', files: { 'index.ts': `export type PayloadOf<T>=T extends{payload:infer P}?P:never;export type IsAllPayload<T>=T extends{payload:unknown}?true:false;` } }],
  },
  {
    lessonId: 'ts29.template-key-remap',
    typeTests: `import type { ChangeEvent, PublicMetrics } from './index.js';type Metrics={pageView:number;signUp:number;0:boolean};const event:ChangeEvent<Metrics>='pageViewChanged';const metrics:PublicMetrics<Metrics>={metric_pageView:1,metric_signUp:2};
// @ts-expect-error arbitrary event is rejected
const badEvent:ChangeEvent<Metrics>='purchaseChanged';
// @ts-expect-error numeric keys are not public metric names
const badMetric:PublicMetrics<Metrics>={metric_pageView:1,metric_signUp:2,metric_0:true};`,
    alternatives: [{ 'index.ts': `export type ChangeEvent<T>=\`${'${Extract<keyof T,string>}'}Changed\`;export type PublicMetrics<T>={[K in keyof T as K extends string?\`metric_${'${K}'}\`:never]:T[K]};` }],
    invalid: [{ name: '임의 문자열 이벤트를 허용', files: { 'index.ts': `export type ChangeEvent<T>=string;export type PublicMetrics<T>={[K in keyof T as K extends string?\`metric_${'${K}'}\`:never]:T[K]};` } }],
  },
  {
    lessonId: 'ts30.brand-at-boundary',
    typeTests: `import { toOrderId, type OrderId } from './index.js';const id:OrderId=toOrderId('ord_12');const text:string=id;declare const userId:string&{readonly __brand:'UserId'};
// @ts-expect-error another branded string is not an OrderId
const wrong:OrderId=userId;`,
    runtimeTests: `check('valid id returned',learner.toOrderId('ord_12')==='ord_12');for(const value of [null,12,'','ord_0','ord_-1','ord_1x','user_1',' ord_1']){let failed=false;try{learner.toOrderId(value)}catch{failed=true}check('invalid id rejected',failed)}`,
    alternatives: [{ 'index.ts': `declare const brand:unique symbol;export type OrderId=string&{readonly[brand]:'OrderId'};export function toOrderId(value:unknown):OrderId{if(typeof value!=='string'||!/^ord_[1-9]\\d*$/.test(value))throw Error('id');return value as OrderId}` }],
    invalid: [{ name: '검증 없이 브랜드를 단언', files: { 'index.ts': `declare const brand:unique symbol;export type OrderId=string&{readonly[brand]:'OrderId'};export const toOrderId=(value:unknown):OrderId=>value as OrderId;` } }],
  },
];
