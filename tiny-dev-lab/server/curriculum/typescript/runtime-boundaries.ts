import type { LessonFixture } from '../types.js';

export const fixtures: LessonFixture[] = [
  {
    lessonId: 'ts13.unknown-guard',
    typeTests: `import { isPayment, type Payment } from './index.js';
const value: unknown = { id: 'pay_1', total: 12000 };
if (isPayment(value)) { const payment: Payment = value; const total: number = payment.total; }
// @ts-expect-error unknown values are not Payment before validation
const unsafe: Payment = value;`,
    runtimeTests: `check('valid payment', learner.isPayment({id:'pay_1',total:0})===true);for(const value of [null,[],{}, {id:' ',total:1},{id:'pay_1',total:-1},{id:'pay_1',total:Infinity},{id:1,total:1},{id:'pay_1',total:'1'}])check('reject invalid payment',learner.isPayment(value)===false);`,
    alternatives: [{ 'index.ts': `export type Payment={id:string;total:number};export const isPayment=(value:unknown):value is Payment=>{if(typeof value!=='object'||value===null||Array.isArray(value))return false;const row=value as Record<string,unknown>;return typeof row.id==='string'&&row.id.trim()!==''&&typeof row.total==='number'&&Number.isFinite(row.total)&&row.total>=0};` }],
    invalid: [{ name: '필드 값 범위를 확인하지 않는 가드', files: { 'index.ts': `export type Payment={id:string;total:number};export const isPayment=(value:unknown):value is Payment=>typeof value==='object'&&value!==null&&'id'in value&&typeof value.id==='string'&&'total'in value&&typeof value.total==='number';` } }],
  },
  {
    lessonId: 'ts14.dto-to-domain',
    typeTests: `import { toOrder, type OrderDto } from './index.js';
const dto: OrderDto={id:'ord_1',created_at:'2026-09-11T00:00:00Z',assignee:null};const order=toOrder(dto);const date:Date=order.createdAt;const name:string=order.assigneeName;
// @ts-expect-error domain model does not expose the DTO field
order.created_at;`,
    runtimeTests: `const order=learner.toOrder({id:'ord_1',created_at:'2026-09-11T00:00:00Z',assignee:null});check('date mapped',order.createdAt instanceof Date&&!Number.isNaN(order.createdAt.getTime()));check('null mapped',order.assigneeName==='미배정');check('empty string preserved',learner.toOrder({id:'ord_2',created_at:'2026-09-11',assignee:''}).assigneeName==='');let failed=false;try{learner.toOrder({id:'ord_3',created_at:'not-a-date',assignee:'민지'})}catch{failed=true}check('invalid date rejected',failed);`,
    alternatives: [{ 'index.ts': `export type OrderDto={id:string;created_at:string;assignee:string|null};export type Order={id:string;createdAt:Date;assigneeName:string};export function toOrder(dto:OrderDto):Order{const createdAt=new Date(dto.created_at);if(Number.isNaN(createdAt.valueOf()))throw Error('date');return{id:dto.id,createdAt,assigneeName:dto.assignee===null?'미배정':dto.assignee}}` }],
    invalid: [{ name: '잘못된 날짜를 그대로 반환하는 변환기', files: { 'index.ts': `export type OrderDto={id:string;created_at:string;assignee:string|null};export type Order={id:string;createdAt:Date;assigneeName:string};export const toOrder=(dto:OrderDto):Order=>({id:dto.id,createdAt:new Date(dto.created_at),assigneeName:dto.assignee??'미배정'});` } }],
  },
  {
    lessonId: 'ts15.result-failure',
    typeTests: `import { parseQuantity, type Result } from './index.js';
const result:Result<number,string>=parseQuantity('2');if(result.ok){const value:number=result.value;
// @ts-expect-error success has no error
result.error;}else{const error:string=result.error;
// @ts-expect-error failure has no value
result.value;}`,
    runtimeTests: `const ok=learner.parseQuantity('2');check('integer succeeds',ok.ok&&ok.value===2);for(const raw of ['', '   ', '-1', '1.5', 'hello']){const result=learner.parseQuantity(raw);check('invalid quantity fails',!result.ok&&typeof result.error==='string'&&result.error.length>0)}`,
    alternatives: [{ 'index.ts': `export type Result<T,E>={ok:true;value:T}|{ok:false;error:E};export function parseQuantity(raw:string):Result<number,string>{const value=Number(raw);if(raw.trim()===''||!Number.isInteger(value)||value<0)return{ok:false,error:'잘못된 수량'};return{ok:true,value}}` }],
    invalid: [{ name: '빈 문자열을 0으로 받는 파서', files: { 'index.ts': `export type Result<T,E>={ok:true;value:T}|{ok:false;error:E};export function parseQuantity(raw:string):Result<number,string>{const value=Number(raw);return Number.isInteger(value)&&value>=0?{ok:true,value}:{ok:false,error:'잘못된 수량'}}` } }],
  },
  {
    lessonId: 'ts16.async-awaited',
    typeTests: `import { loadOrder, type LoaderValue, type Order } from './index.js';
const promise:Promise<Order>=loadOrder();const value:LoaderValue={id:'ord_2',total:1};const id:string=value.id;
// @ts-expect-error LoaderValue is the fulfilled Order, not its Promise
const nested:LoaderValue=promise;`,
    runtimeTests: `const value=await learner.loadOrder();check('loader fulfills order',value.id==='ord_1'&&value.total===12000);check('fulfilled value is not a promise',typeof value.then==='undefined');`,
    alternatives: [{ 'index.ts': `export type Order={id:string;total:number};export const loadOrder=async():Promise<Order>=>({id:'ord_1',total:12000});export type LoaderValue=Awaited<ReturnType<typeof loadOrder>>;` }],
    invalid: [{ name: '성공값은 맞지만 loader가 잘못된 주문을 반환', files: { 'index.ts': `export type Order={id:string;total:number};export const loadOrder=async():Promise<Order>=>({id:'',total:-1});export type LoaderValue=Awaited<ReturnType<typeof loadOrder>>;` } }],
  },
  {
    lessonId: 'ts17.patch-json-boundary',
    typeTests: `import { makeOrderPatch, type OrderPatch } from './index.js';
const omitted:OrderPatch=makeOrderPatch(undefined);const changed:OrderPatch=makeOrderPatch('도착 전 연락');const cleared:OrderPatch=makeOrderPatch(null);
// @ts-expect-error explicit undefined is not an allowed patch value
const bad:OrderPatch={note:undefined};
// @ts-expect-error server-owned id is not part of this patch
const serverField:OrderPatch={id:'ord_1'};`,
    runtimeTests: `const omitted=learner.makeOrderPatch(undefined);const changed=learner.makeOrderPatch('도착 전 연락');const cleared=learner.makeOrderPatch(null);check('undefined omits key',!Object.hasOwn(omitted,'note')&&JSON.stringify(omitted)==='{}');check('string remains',changed.note==='도착 전 연락');check('null remains in JSON',Object.hasOwn(cleared,'note')&&JSON.stringify(cleared)==='{"note":null}');`,
    alternatives: [{ 'index.ts': `export type OrderPatch={note?:string|null};export const makeOrderPatch=(note:string|null|undefined):OrderPatch=>note===undefined?{}:{note};` }],
    invalid: [{ name: 'undefined note 키를 실제 객체에 남기는 변환기', files: { 'index.ts': `export type OrderPatch={note?:string|null};export const makeOrderPatch=(note:string|null|undefined):OrderPatch=>({note} as OrderPatch);` } }],
    compilerOptions: { exactOptionalPropertyTypes: true },
  },
];
