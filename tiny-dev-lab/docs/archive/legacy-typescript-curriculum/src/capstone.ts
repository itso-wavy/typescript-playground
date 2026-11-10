import type { Lesson } from '../shared/contracts.js';

const source={title:'TypeScript 좁히기와 판별 유니온',url:'https://www.typescriptlang.org/docs/handbook/2/narrowing.html'}; const checkedAt='2026-09-08';
const minutesByOrder: Record<number, 5 | 6 | 7> = { 33: 7, 34: 6, 35: 7, 36: 7 };
const make=(data: Omit<Lesson,'kind'|'checkedAt'|'compilerVersion'|'revision'|'minutes'>):Lesson=>({...data,kind:'practice',checkedAt,compilerVersion:'7.0.2',revision:1,minutes:minutesByOrder[data.order]});
const api=`export type ApiOrder = { id: unknown; title: unknown; quantity: unknown; editable: unknown };
export const raw: unknown = { id: 'ord_1', title: '키보드', quantity: 2, editable: true };`;
const model=`export type Order = { id: string; title: string; quantity: number; editable: boolean };`;

export const lessons: Lesson[]=[
 make({
   id:'c33',chapter:6,order:33,
   title:'주문 API 응답을 앱 모델로 변환하기', navTitle:'주문 검증',
   summary:'주문 API 응답의 필드 타입과 값 범위를 서버 경계에서 검증해, 화면 컴포넌트가 안전하게 사용할 Order 모델로 변환합니다.',
   story:'주문 API는 null이나 오류 객체를 보낼 수 있고, id와 title의 값이 뒤바뀔 수도 있습니다. 화면 컴포넌트가 이런 값을 직접 다루지 않도록 서버 경계에서 하나씩 확인해 안전한 Order로 바꿔 보세요.',
   concept:['이 단계의 starter에는 api.ts와 model.ts가 함께 있어 앞 단계 결과 없이도 시작할 수 있습니다.', 'id·title·quantity·editable의 실제 타입과 값의 범위를 확인한 뒤에만 앱 모델을 만들어야 합니다.'],
   mission:'toOrder를 완성해 잘못된 주문 응답을 거절하세요.',
   goals:['null·오류 객체·형식이 잘못된 id를 거절한다.', '모든 값을 확인한 뒤에만 Order를 반환한다.'],
   hints:['먼저 object인지, null이 아닌지, 배열이 아닌지 확인하세요.', '네 필드가 모두 있는지와 각 값의 타입을 확인하세요.', 'quantity는 0 이상인 정수인지 확인하세요.'],
   starter:{'api.ts':api,'model.ts':model,'index.ts':`import type { Order } from './model.js';
export function toOrder(_value: unknown): Order { throw new Error('TODO'); }`},
   solution:{'api.ts':api,'model.ts':model,'index.ts':`import type { Order } from './model.js';
export function toOrder(value: unknown): Order {
 if(typeof value!=='object'||value===null||Array.isArray(value)||!('id'in value)||!('title'in value)||!('quantity'in value)||!('editable'in value)||typeof value.id!=='string'||!value.id.startsWith('ord_')||typeof value.title!=='string'||typeof value.quantity!=='number'||!Number.isInteger(value.quantity)||value.quantity<0||typeof value.editable!=='boolean') throw new Error('잘못된 주문 응답');
 return {id:value.id,title:value.title,quantity:value.quantity,editable:value.editable};
}`},
   editableFiles:['index.ts'],mode:'runtime',sources:[source],
   explanation:['API에 타입을 적어 두는 것만으로는 실제로 들어온 값을 확인할 수 없습니다. 응답을 검사하면서 앱 모델을 새로 만들어야 합니다.', '이 단계는 중간 단계부터 열어도 필요한 파일을 starter에 모두 제공합니다.']
 }),
 make({
   id:'c34',chapter:6,order:34,
   title:'주문 Patch에서 생략과 검증 구분하기', navTitle:'Order Patch omission',
   summary:'타입으로 수정 필드를 제한하고 undefined 생략과 quantity 런타임 검증을 함께 처리합니다.',
   story:'주문 수정 요청은 id와 editable을 보내면 안 되고, title이나 quantity를 생략할 때는 JSON에 키도 없어야 합니다. Pick과 Partial은 복습으로 사용하되, 실제 경계에서는 undefined 키 생략과 quantity의 정수·범위 검증까지 수행해 보세요.',
   concept:['OrderPatch의 Pick은 허용 필드를 계산하는 타입 단계이고, toPatch는 입력을 요청 객체로 바꾸는 런타임 경계입니다.', 'undefined는 키를 생략하는 뜻으로 처리하고, quantity가 정수가 아니거나 음수면 예상 가능한 입력 오류로 거절합니다.'],
   mission:'title·quantity만 허용하는 OrderPatch를 만들고, undefined 키는 생략하며 잘못된 quantity는 거절하세요.',
   goals:['id와 editable은 수정 요청에 들어가지 않는다.', 'title 또는 quantity가 undefined이면 그 키를 생략한다.'],
   hints:['수정할 필드는 title과 quantity뿐입니다.', 'undefined일 때는 객체에 키를 넣지 마세요.', 'quantity가 정수이고 0 이상인지 확인하세요.'],
   starter:{'model.ts':model,'index.ts':`import type { Order } from './model.js';
export type OrderPatch = Partial<Order>;
export function toPatch(title: string | undefined, quantity: number | undefined): OrderPatch { return { title, quantity }; }`},
   solution:{'model.ts':model,'index.ts':`import type { Order } from './model.js';
export type OrderPatch = Pick<Order,'title'|'quantity'>;
export function toPatch(title: string | undefined, quantity: number | undefined): Partial<OrderPatch> {
 const patch: Partial<OrderPatch>={}; if(title!==undefined) patch.title=title; if(quantity!==undefined){if(!Number.isInteger(quantity)||quantity<0) throw new Error('수량');patch.quantity=quantity;} return patch;
}`},
   editableFiles:['index.ts'],mode:'runtime',sources:[source],
   explanation:['t10은 Pick과 Partial의 타입 계산을 연습하지만, 이 레슨은 그 타입을 실제 요청 객체로 변환하며 생략과 검증을 관찰합니다.', '수정 요청 타입과 변환 함수를 별도로 두면 서버 필드 차단과 JSON에 보낼 키 규칙이 코드에 드러납니다.']
 }),
 make({
   id:'c35',chapter:6,order:35,
   title:'주문 표시 함수 오버로드 설계하기', navTitle:'Order overloads',
   summary:'Order 하나와 주문 배열을 구분하는 overloaded API를 설계하고 반환 타입을 보존합니다.',
   story:'주문 상세 화면은 한 Order를, 요약 화면은 Order 배열을 받아야 하는데 any API는 두 호출의 반환 형태를 잃게 만듭니다. 같은 함수 이름으로 단일 주문과 배열을 구분하고 각 입력에 맞는 반환 타입을 제공해 보세요.',
   concept:['overload signature는 호출자가 보는 입력·출력 관계를 여러 개로 명시하고, 구현 signature는 두 경우를 처리합니다.', 'Array.isArray로 런타임 입력을 분기하면 단일 Order에는 문자열, 배열에는 문자열 배열을 반환하는 계약을 유지할 수 있습니다.'],
   mission:'formatOrder를 overload API로 완성해 Order에는 요약 문자열을, Order 배열에는 요약 문자열 배열을 반환하세요.',
   goals:['Order와 readonly Order[] 호출에 맞는 반환 타입을 제공한다.', '단일 값과 배열 입력을 런타임에서 구분해 title·quantity를 표시한다.'],
   hints:['두 overload signature를 먼저 작성하세요.', '구현에서는 Order | readonly Order[]를 받고 Array.isArray로 나누세요.', '다른 타입을 넘기는 호출은 컴파일 오류가 되어야 합니다.'],
   starter:{'model.ts':model,'index.ts':`import type { Order } from './model.js';
export function formatOrder(_order: Order): string;
export function formatOrder(_orders: readonly Order[]): string[];
export function formatOrder(_value: Order | readonly Order[]): string | string[] { throw new Error('TODO'); }`},
   solution:{'model.ts':model,'index.ts':`import type { Order } from './model.js';
export function formatOrder(order: Order): string;
export function formatOrder(orders: readonly Order[]): string[];
export function formatOrder(value: Order | readonly Order[]): string | string[] {
 const format=(order: Order): string => order.title + ' × ' + order.quantity;
 if(Array.isArray(value)) return value.map(format);
 return format(value as Order);
}`},
   editableFiles:['index.ts'],mode:'runtime',sources:[source],
   explanation:['overload signature는 한 함수 이름으로 입력 형태별 반환 타입을 호출자에게 보장합니다.', '구현 signature는 두 경우를 함께 받고 Array.isArray로 분기하므로 Order 한 개에는 문자열, 배열에는 문자열 배열을 반환합니다.']
 }),
 make({
   id:'c36',chapter:6,order:36,
   title:'변경된 API 필드를 변환 경계에서 처리하기', navTitle:'API 변환 경계',
   summary:'주문 API의 quantity가 units로 바뀐 응답을 변환 경계에서 검사해, 기존 화면이 사용하는 Order 모델과 회귀 테스트를 유지합니다.',
   story:'API가 quantity를 units로 바꿨는데 화면은 조용히 0을 표시했습니다. 외부 응답을 앱 모델로 바꾸는 한 지점을 고치고, 새 응답과 예전 형식 모두를 다시 검사해 보세요.',
   concept:['quantity가 units로 바뀌어도 화면이 조용히 틀리지 않게 하려면 외부 형식에 대한 의존성을 변환 함수 한 곳에 모읍니다. 그러면 API 변경이 컴파일 오류와 테스트 실패로 드러납니다.', '회귀 테스트에는 정상 입력뿐 아니라 필드 누락과 타입이 잘못된 입력도 포함해야 합니다.'],
   mission:'units 응답을 기존 quantity 모델로 변환하고, 예전 quantity 응답은 거절하세요.',
   goals:['units가 있는 새 형식만 받는다.', '예전 quantity 형식과 오류 객체는 거절한다.'],
   hints:['이번 응답에서는 quantity 키를 검사하지 마세요.', 'units가 0 이상인 정수인지 확인하세요.', '반환하는 Order의 필드 이름은 quantity로 유지하세요.'],
   starter:{'api.ts':`export const changed: unknown={id:'ord_2',title:'마우스',units:1,editable:false};`,'model.ts':model,'index.ts':`import type { Order } from './model.js';
export function toChangedOrder(value: unknown): Order { return value as Order; }`},
   solution:{'api.ts':`export const changed: unknown={id:'ord_2',title:'마우스',units:1,editable:false};`,'model.ts':model,'index.ts':`import type { Order } from './model.js';
export function toChangedOrder(value: unknown): Order {
 if(typeof value!=='object'||value===null||Array.isArray(value)||!('id'in value)||!('title'in value)||!('units'in value)||!('editable'in value)||typeof value.id!=='string'||!value.id.startsWith('ord_')||typeof value.title!=='string'||typeof value.units!=='number'||!Number.isInteger(value.units)||value.units<0||typeof value.editable!=='boolean') throw new Error('변경된 주문 응답 오류');
 return {id:value.id,title:value.title,quantity:value.units,editable:value.editable};
}`},
   editableFiles:['index.ts'],mode:'runtime',sources:[source],
   explanation:['API 형식이 바뀌어도 변환 함수가 앱 모델을 계속 만들어 주면 화면과 목록 컴포넌트는 영향을 받지 않습니다.', '타입 단언으로 예전 형식을 억지로 받아들이면 변경을 숨기게 되므로, 오류 입력을 함께 검사해야 합니다.'],
   interview:{question:'API 필드 이름이 바뀌었을 때 영향 범위를 작게 만들려면 외부 형식에 대한 의존성을 어디에 모아야 할까요?',answer:'외부 응답을 읽어 앱 모델로 바꾸는 변환 함수의 경계에 모아야 한다.',points:['DTO와 앱 모델을 분리한다.','정상 입력과 오류 입력을 함께 회귀 검증한다.']}
 }),
];


