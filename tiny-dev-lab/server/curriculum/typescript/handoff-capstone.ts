import type { FileMap } from '../../../src/shared/contracts.js';
import type { LessonFixture } from '../types.js';

const contracts: FileMap = {
  'contracts.ts': `export type OrderAction={type:'edit';id:string}|{type:'cancel';id:string};export type OrderViewProps={order:{id:string;title:string;quantity:number};onAction:(action:OrderAction)=>void};export type CreateOrderDto={title:string;quantity:number};export type UpdateOrderDto=Partial<CreateOrderDto>;export const orderActionTypes=['edit','cancel'] as const;`,
};

const ports: FileMap = {
  'ports.ts': `export type ReadTextFile=(path:string,encoding:'utf8')=>Promise<string>;export type HttpResponse={ok:boolean;status:number;json():Promise<unknown>};export type FetchPort=(input:string)=>Promise<HttpResponse>;`,
};

const model = `export type ApiOrder={id:string;title:string;quantity:number;editable:boolean};`;
const initialApi = `export const initialResponse:unknown={id:'ord_1',title:'키보드',quantity:2,editable:true};`;
const v1Parser = `import type{ApiOrder}from'./model.js';function isRecord(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value)}export function parseApiOrder(value:unknown):ApiOrder{if(!isRecord(value)||typeof value.id!=='string'||!value.id.startsWith('ord_')||typeof value.title!=='string'||value.title.trim().length===0||typeof value.quantity!=='number'||!Number.isInteger(value.quantity)||value.quantity<0||typeof value.editable!=='boolean')throw Error('bad');return{id:value.id,title:value.title,quantity:value.quantity,editable:value.editable}}`;
const view = `import type{ApiOrder}from'./model.js';export type OrderAction={type:'edit';id:string}|{type:'cancel';id:string};export type OrderViewModel={id:string;title:string;quantityLabel:string;canEdit:boolean};export type OrderViewProps={order:OrderViewModel;onAction:(action:OrderAction)=>void};export function toOrderViewModel(order:ApiOrder):OrderViewModel{return{id:order.id,title:order.title,quantityLabel:'수량 '+order.quantity,canEdit:order.editable}}`;
const exportsFromChain = `export{parseApiOrder}from'./validate.js';export{toOrderViewModel}from'./view.js';export type{OrderAction,OrderViewModel,OrderViewProps}from'./view.js';`;
const compatibleParser = `import type{ApiOrder}from'./model.js';function isRecord(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value)}function validQuantity(value:unknown):value is number{return typeof value==='number'&&Number.isInteger(value)&&value>=0}export function parseApiOrder(value:unknown):ApiOrder{if(!isRecord(value)||typeof value.id!=='string'||!value.id.startsWith('ord_')||typeof value.title!=='string'||value.title.trim().length===0||typeof value.editable!=='boolean')throw Error('bad');const hasQuantity=Object.hasOwn(value,'quantity');const hasUnits=Object.hasOwn(value,'units');if(hasQuantity===hasUnits)throw Error('ambiguous');const quantity=hasQuantity?value.quantity:value.units;if(!validQuantity(quantity))throw Error('quantity');return{id:value.id,title:value.title,quantity,editable:value.editable}}`;

const stage33: FileMap = {
  'api.ts': initialApi,
  'model.ts': model,
  'validate.ts': `import type{ApiOrder}from'./model.js';export function parseApiOrder(_value:unknown):ApiOrder{throw Error('TODO')}`,
  'index.ts': `export{parseApiOrder}from'./validate.js';`,
};
const stage34: FileMap = {
  'api.ts': initialApi, 'model.ts': model, 'validate.ts': v1Parser,
  'view.ts': `import type{ApiOrder}from'./model.js';export type OrderAction={type:'edit';id:string}|{type:'cancel';id:string};export type OrderViewModel={id:string;title:string;quantityLabel:string;canEdit:boolean};export type OrderViewProps={order:OrderViewModel;onAction:(action:OrderAction)=>void};export function toOrderViewModel(_order:ApiOrder):OrderViewModel{throw Error('TODO')}`,
  'index.ts': exportsFromChain,
};
const stage35: FileMap = {
  'api.ts': `export const versionedResponses:readonly unknown[]=[{id:'ord_1',title:'키보드',quantity:2,editable:true},{id:'ord_2',title:'마우스',units:1,editable:false}];`,
  'model.ts': model, 'validate.ts': v1Parser, 'view.ts': view, 'index.ts': exportsFromChain,
};
const handoff = `export type NestBoundaryHandoff={runtimeValidation:'validation-pipeline';reactResponsibility:'render-validated-props';patchIntent:'omit-undefined-use-explicit-null-or-operation'};export const nestBoundaryHandoff:NestBoundaryHandoff={runtimeValidation:'validation-pipeline',reactResponsibility:'render-validated-props',patchIntent:'omit-undefined-use-explicit-null-or-operation'};`;

export const fixtures: LessonFixture[] = [
  {
    lessonId: 'ts31.framework-contract-handoff',
    typeTests: `import{canDispatch,createDto,updateDto,viewProps}from'./index.js';import type{OrderAction,OrderViewProps}from'./contracts.js';const action:OrderAction={type:'edit',id:'ord_1'};const props:OrderViewProps=viewProps({id:'ord_1',title:'A',quantity:1},(_action)=>{});const created={...createDto('A',1),action};const updated=updateDto('B');const dispatch:boolean=canDispatch('edit');
// @ts-expect-error DTO quantity is a number
createDto('A','1');
// @ts-expect-error unknown action is not part of the React contract
const bad:OrderAction={type:'delete',id:'ord_1'};void props;void created;void updated;void dispatch;void bad;`,
    alternatives: [{ ...contracts, 'index.ts': `import{orderActionTypes}from'./contracts.js';import type{CreateOrderDto,OrderViewProps,UpdateOrderDto}from'./contracts.js';export const canDispatch=(type:string):boolean=>orderActionTypes.includes(type as (typeof orderActionTypes)[number]);export const viewProps=(order:OrderViewProps['order'],onAction:OrderViewProps['onAction']):OrderViewProps=>({order,onAction});export const createDto=(title:string,quantity:number):CreateOrderDto=>({title,quantity});export const updateDto=(title:string):UpdateOrderDto=>({title});` }],
    invalid: [{ name: '타입을 실행 import로 가져온 계약 모듈', files: { ...contracts, 'index.ts': `import{orderActionTypes,OrderViewProps,CreateOrderDto,UpdateOrderDto}from'./contracts.js';export const canDispatch=(type:string)=>orderActionTypes.includes(type as (typeof orderActionTypes)[number]);export const viewProps=(order:OrderViewProps['order'],onAction:OrderViewProps['onAction']):OrderViewProps=>({order,onAction});export const createDto=(title:string,quantity:number):CreateOrderDto=>({title,quantity});export const updateDto=(title:string):UpdateOrderDto=>({title});` } }],
    compilerOptions: { verbatimModuleSyntax: true },
  },
  {
    lessonId: 'ts32.node-module-handoff',
    typeTests: `import{fetchOrders}from'./index.js';import type{FetchPort}from'./ports.js';const port:FetchPort=async()=>({ok:true,status:200,json:async()=>({orders:[]})});const body:unknown=await fetchOrders(port);void body;
// @ts-expect-error a fetch port must return a response with json
fetchOrders(async()=>({ok:true,status:200}));`,
    runtimeTests: `let called='';const body=await learner.fetchOrders(async(input)=>{called=input;return{ok:true,status:200,json:async()=>({orders:[{id:'ord_1'}]})}});check('orders endpoint',called==='/orders');check('keeps body unknown until next boundary',typeof body==='object'&&body!==null);let rejected=false;try{await learner.fetchOrders(async()=>({ok:false,status:503,json:async()=>({})}))}catch{rejected=true}check('reject HTTP failure',rejected);`,
    alternatives: [{ ...ports, 'index.ts': `import type{FetchPort,ReadTextFile}from'./ports.js';export type NodePorts={readTextFile:ReadTextFile;fetch:FetchPort};export const fetchOrders=async(fetch:FetchPort):Promise<unknown>=>{const response=await fetch('/orders');if(!response.ok)throw Error('주문 조회 실패: '+response.status);return response.json()};` }],
    invalid: [{ name: 'HTTP 실패를 성공 본문처럼 처리', files: { ...ports, 'index.ts': `import type{FetchPort,ReadTextFile}from'./ports.js';export type NodePorts={readTextFile:ReadTextFile;fetch:FetchPort};export const fetchOrders=async(fetch:FetchPort):Promise<unknown>=>{const response=await fetch('/orders');return response.json()};` } }],
    compilerOptions: { verbatimModuleSyntax: true },
  },
  {
    lessonId: 'ts33.capstone-validate',
    typeTests: `import{parseApiOrder}from'./index.js';const order=parseApiOrder({id:'ord_1',title:'A',quantity:1,editable:true});const quantity:number=order.quantity;
// @ts-expect-error quantity remains numeric after parsing
const wrong:string=order.quantity;void quantity;void wrong;`,
    runtimeTests: `check('valid order',learner.parseApiOrder({id:'ord_1',title:'A',quantity:0,editable:true}).quantity===0);for(const value of [null,[],{error:'x'},{id:'usr_1',title:'A',quantity:1,editable:true},{id:'ord_1',title:'',quantity:1,editable:true},{id:'ord_1',title:'A',quantity:1.5,editable:true},{id:'ord_1',title:'A',quantity:-1,editable:true},{id:'ord_1',title:'A',quantity:1,editable:'true'}]){let failed=false;try{learner.parseApiOrder(value)}catch{failed=true}check('reject invalid response',failed);}`,
    alternatives: [{ ...stage33, 'validate.ts': `import type{ApiOrder}from'./model.js';export function parseApiOrder(value:unknown):ApiOrder{if(typeof value!=='object'||value===null||Array.isArray(value))throw Error('bad');const order=value as Record<string,unknown>;if(typeof order.id!=='string'||!order.id.startsWith('ord_')||typeof order.title!=='string'||order.title.trim().length===0||typeof order.quantity!=='number'||!Number.isInteger(order.quantity)||order.quantity<0||typeof order.editable!=='boolean')throw Error('bad');return{id:order.id,title:order.title,quantity:order.quantity,editable:order.editable}}` }],
    invalid: [{ name: 'unknown 응답 단언', files: { ...stage33, 'validate.ts': `import type{ApiOrder}from'./model.js';export const parseApiOrder=(value:unknown):ApiOrder=>value as ApiOrder;` } }],
  },
  {
    lessonId: 'ts34.capstone-map-display',
    typeTests: `import{parseApiOrder,toOrderViewModel}from'./index.js';import type{OrderViewProps}from'./index.js';const api=parseApiOrder({id:'ord_1',title:'A',quantity:2,editable:true});const view=toOrderViewModel(api);const props:OrderViewProps={order:view,onAction:(_action)=>{}};const label:string=view.quantityLabel;
// @ts-expect-error screen labels are strings
const wrong:number=view.quantityLabel;void props;void label;void wrong;`,
    runtimeTests: `const api=learner.parseApiOrder({id:'ord_1',title:'키보드',quantity:2,editable:true});const view=learner.toOrderViewModel(api);check('maps display label',view.quantityLabel==='수량 2');check('maps edit permission',view.canEdit===true);check('keeps stable identity',view.id==='ord_1'&&view.title==='키보드');`,
    alternatives: [{ ...stage34, 'view.ts': `import type{ApiOrder}from'./model.js';export type OrderAction={type:'edit';id:string}|{type:'cancel';id:string};export type OrderViewModel={id:string;title:string;quantityLabel:string;canEdit:boolean};export type OrderViewProps={order:OrderViewModel;onAction:(action:OrderAction)=>void};export const toOrderViewModel=(order:ApiOrder):OrderViewModel=>({id:order.id,title:order.title,quantityLabel:\`수량 \${order.quantity}\`,canEdit:order.editable});` }],
    invalid: [{ name: 'API quantity를 화면 label로 바꾸지 않음', files: { ...stage34, 'view.ts': `import type{ApiOrder}from'./model.js';export type OrderAction={type:'edit';id:string}|{type:'cancel';id:string};export type OrderViewModel={id:string;title:string;quantityLabel:string;canEdit:boolean};export type OrderViewProps={order:OrderViewModel;onAction:(action:OrderAction)=>void};export function toOrderViewModel(order:ApiOrder):OrderViewModel{return{id:order.id,title:order.title,quantityLabel:String(order.quantity),canEdit:order.editable}}` } }],
  },
  {
    lessonId: 'ts35.capstone-change',
    typeTests: `import{parseApiOrder,toOrderViewModel}from'./index.js';const oldView=toOrderViewModel(parseApiOrder({id:'ord_1',title:'A',quantity:2,editable:true}));const newView=toOrderViewModel(parseApiOrder({id:'ord_2',title:'B',units:3,editable:false}));const oldLabel:string=oldView.quantityLabel;const newLabel:string=newView.quantityLabel;void oldLabel;void newLabel;`,
    runtimeTests: `const oldView=learner.toOrderViewModel(learner.parseApiOrder({id:'ord_1',title:'A',quantity:2,editable:true}));const newView=learner.toOrderViewModel(learner.parseApiOrder({id:'ord_2',title:'B',units:3,editable:false}));check('old API still displays',oldView.quantityLabel==='수량 2');check('new API keeps display contract',newView.quantityLabel==='수량 3');for(const value of [{id:'ord_3',title:'C',editable:true},{id:'ord_3',title:'C',quantity:1,units:1,editable:true},{id:'ord_3',title:'C',units:1.5,editable:true},{id:'ord_3',title:'C',units:-1,editable:true}]){let failed=false;try{learner.parseApiOrder(value)}catch{failed=true}check('reject ambiguous or invalid version',failed);}`,
    alternatives: [{ ...stage35, 'validate.ts': `import type{ApiOrder}from'./model.js';const record=(value:unknown):value is Record<string,unknown>=>typeof value==='object'&&value!==null&&!Array.isArray(value);export function parseApiOrder(value:unknown):ApiOrder{if(!record(value)||typeof value.id!=='string'||!value.id.startsWith('ord_')||typeof value.title!=='string'||value.title.trim()===''||typeof value.editable!=='boolean')throw Error('bad');const fields=['quantity','units'].filter((key)=>Object.hasOwn(value,key));if(fields.length!==1)throw Error('bad fields');const quantity=value[fields[0]!];if(typeof quantity!=='number'||!Number.isInteger(quantity)||quantity<0)throw Error('bad quantity');return{id:value.id,title:value.title,quantity,editable:value.editable}}` }],
    invalid: [{ name: '새 units 응답만 받아 이전 응답 회귀를 깸', files: { ...stage35, 'validate.ts': `import type{ApiOrder}from'./model.js';export function parseApiOrder(value:unknown):ApiOrder{if(typeof value!=='object'||value===null||Array.isArray(value))throw Error('bad');const order=value as Record<string,unknown>;if(typeof order.id!=='string'||typeof order.title!=='string'||typeof order.units!=='number'||!Number.isInteger(order.units)||order.units<0||typeof order.editable!=='boolean')throw Error('bad');return{id:order.id,title:order.title,quantity:order.units,editable:order.editable}}` } }],
  },
  {
    lessonId: 'ts36.capstone-decision',
    typeTests: `import{nestBoundaryHandoff}from'./index.js';const validation:'validation-pipeline'=nestBoundaryHandoff.runtimeValidation;const react:'render-validated-props'=nestBoundaryHandoff.reactResponsibility;const patch:'omit-undefined-use-explicit-null-or-operation'=nestBoundaryHandoff.patchIntent;void validation;void react;void patch;`,
    alternatives: [{ 'api.ts': stage35['api.ts']!, 'model.ts': model, 'validate.ts': compatibleParser, 'view.ts': view, 'handoff.ts': handoff, 'index.ts': `export{parseApiOrder}from'./validate.js';export{toOrderViewModel}from'./view.js';export{nestBoundaryHandoff}from'./handoff.js';` }],
    invalid: [{ name: 'Controller 데코레이터가 런타임 검증을 대신한다고 기록', files: { 'api.ts': stage35['api.ts']!, 'model.ts': model, 'validate.ts': compatibleParser, 'view.ts': view, 'handoff.ts': `export type NestBoundaryHandoff={runtimeValidation:'validation-pipeline';reactResponsibility:'render-validated-props';patchIntent:'omit-undefined-use-explicit-null-or-operation'};export const nestBoundaryHandoff:NestBoundaryHandoff={runtimeValidation:'controller-decorator',reactResponsibility:'render-validated-props',patchIntent:'omit-undefined-use-explicit-null-or-operation'};`, 'index.ts': `export{parseApiOrder}from'./validate.js';export{toOrderViewModel}from'./view.js';export{nestBoundaryHandoff}from'./handoff.js';` } }],
  },
];
