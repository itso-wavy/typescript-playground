import type { Lesson } from '../shared/contracts.js';

const source = { title: 'TypeScript TSConfig reference', url: 'https://www.typescriptlang.org/tsconfig/' };
const checkedAt = '2026-09-08';
const minutesByOrder: Record<number, 5 | 6 | 7> = { 29: 6, 30: 6, 31: 5, 32: 6 };
const make = (data: Omit<Lesson, 'kind'|'checkedAt'|'compilerVersion'|'revision'|'minutes'>): Lesson => ({...data, kind:'practice', checkedAt, compilerVersion:'7.0.2', revision:1, minutes:minutesByOrder[data.order]});

export const lessons: Lesson[] = [
  make({
    id:'p29', chapter:5, order:29,
    title:'콜백 매개변수와 strictFunctionTypes 이해하기', navTitle:'callback variance',
    summary:'테이블 라이브러리가 호출하는 Row 콜백의 매개변수 범위를 strictFunctionTypes로 검사해, 모든 행을 처리할 수 있는 렌더러를 만듭니다.',
    story:'관리자 화면의 테이블 라이브러리는 일반 Row와 VIP Row를 모두 renderRow 콜백에 전달합니다. 콜백이 vip 필드가 있는 행만 받도록 선언하면 일반 사용자 행을 렌더링할 때 처리할 수 없습니다. 라이브러리가 보장하는 Row 범위에 맞춰 콜백 매개변수를 선언하고, 추가 필드는 콜백 안에서 확인해 보세요.',
    concept:['콜백을 호출하는 쪽은 Row 전체를 전달할 수 있어야 하므로, callback parameter는 Row보다 좁아서는 안 됩니다. 이 호환성 차이를 callback variance라고 부릅니다.', 'strictFunctionTypes에서 좁은 매개변수를 요구하는 함수는 RowRenderer 자리에 올 수 없습니다. 필요한 추가 필드는 콜백 안에서 확인해야 합니다.'],
    mission:'정상 Row를 받을 수 있는 renderRow를 선언하고, vip만 요구하는 콜백이 RowRenderer에 들어갈 수 없는 이유를 확인하세요.',
    goals:['RowRenderer의 모든 Row를 받을 수 있는 콜백을 작성한다.','vip를 요구하는 더 좁은 callback parameter를 거절한다.'],
    hints:['호출자가 넘길 수 있는 Row에는 vip가 없습니다.', 'RowRenderer를 import type으로 사용하세요.', '추가 필드가 정말 필요한 경우에는 in으로 런타임 확인을 하세요.'],
    starter:{'table.d.ts':`export type Row = { id: string; name: string };
export type RowRenderer = (row: Row) => string;`,'index.ts':`import type { RowRenderer } from './table.js';
export const renderRow: RowRenderer = (row: { id: string; name: string; vip: boolean }) => row.name;`},
    solution:{'table.d.ts':`export type Row = { id: string; name: string };
export type RowRenderer = (row: Row) => string;`,'index.ts':`import type { RowRenderer } from './table.js';
export const renderRow: RowRenderer = (row) => row.name;`},
    editableFiles:['index.ts'], mode:'typecheck', sources:[source],
    explanation:['콜백이 더 좁은 객체를 요구하면 라이브러리가 정상적인 Row를 넘겨도 호출할 수 없습니다.', '호출자 관점에서 “전달할 수 있는 모든 값을 받을 수 있는가?”를 확인하면 callback variance와 strictFunctionTypes의 핵심을 판단할 수 있습니다.']
  }),
  make({
    id:'p30', chapter:5, order:30,
    title:'declare module로 analytics track API 선언하기', navTitle:'declare module .d.ts',
    summary:'타입 없는 analytics 모듈에 실제 사용하는 track(event, payload) 표면만 선언합니다.',
    story:'레거시 analytics 모듈을 any로 두자 checkout 이벤트 오타와 orderId 누락이 모두 통과했습니다. .d.ts에 실제로 사용하는 track(event, payload) 계약만 선언해 두 호출 오류를 컴파일 시 드러내 보세요.',
    concept:['declare module과 .d.ts는 타입이 없는 모듈의 공개 표면을 설명하는 자리입니다. 이번 API는 두 이벤트와 orderId payload만 사용합니다.', '선언 파일은 JavaScript 런타임을 검증하지 않습니다. 선언이 실제 analytics 구현과 맞는지는 문서·통합 테스트로 확인해야 합니다.'],
    mission:'analytics 모듈의 track(event, payload) 함수에 허용 이벤트 두 개와 orderId payload 계약을 선언하세요.',
    goals:['허용한 이벤트 이름과 payload만 통과한다.','존재하지 않는 함수나 잘못된 인자는 거절한다.'],
    hints:['declare module 안에 track을 선언하세요.', '허용할 이벤트 이름을 문자열 리터럴 유니온으로 적으세요.', 'track은 값을 반환하지 않으므로 void를 사용하세요.'],
    starter:{'analytics.d.ts':`declare module 'analytics' {
  export const track: any;
}`,'index.ts':`import { track } from 'analytics';
export { track };
track('checkout_started', { orderId: 'o1' });`},
    solution:{'analytics.d.ts':`declare module 'analytics' {
  export function track(event: 'checkout_started' | 'checkout_completed', payload: { orderId: string }): void;
}`,'index.ts':`import { track } from 'analytics';
export { track };
track('checkout_started', { orderId: 'o1' });`},
    editableFiles:['analytics.d.ts'], mode:'typecheck', sources:[source],
    explanation:['any는 오류를 없애 보이게 만들 뿐 잘못된 호출을 고치지 않습니다.', 'declare module 선언은 사용하는 API의 컴파일 계약만 제공하며 실제 JavaScript 동작이나 payload 검증까지 보장하지 않습니다.']
  }),
  make({
    id:'p31', chapter:5, order:31,
    title:'import type으로 실행 값과 타입 분리하기', navTitle:'import type',
    summary:'import type으로 컴파일 전용 타입과 실행할 값의 import를 분리합니다.',
    story:'공유 타입만 사용한 파일이 브라우저 번들에서 서버 모듈까지 불러왔습니다. 실행할 값과 컴파일할 때만 필요한 타입을 구분해 결과 JavaScript에 불필요한 의존성이 남지 않게 해 보세요.',
    concept:['브라우저 번들에 서버 모듈이 끼어드는 문제를, import type으로 컴파일할 때만 필요한 의존성을 표시해 해결합니다. 이 import는 JavaScript 출력에서 사라집니다.', 'verbatimModuleSyntax 설정은 타입과 값을 섞어 쓴 import를 그대로 드러내므로 잘못된 모듈 경계를 일찍 발견할 수 있습니다.'],
    mission:'Order는 타입으로만 가져오고 label은 실행할 값으로 가져오도록 import를 고치세요.',
    goals:['실행에 필요 없는 import가 JavaScript에 남지 않는다.','Order의 타입 검사는 그대로 유지된다.'],
    hints:['타입 이름을 가져오는 import 앞에 type을 붙이세요.', 'label은 실행할 함수이므로 일반 import로 남겨 두세요.', '이 과제의 모듈 설정은 이미 준비되어 있습니다.'],
    starter:{'model.ts':`export type Order = { id: string };
export const label = (order: Order) => order.id;`,'index.ts':`import { Order, label } from './model.js';
export const format = (order: Order) => label(order);`},
    solution:{'model.ts':`export type Order = { id: string };
export const label = (order: Order) => order.id;`,'index.ts':`import { label } from './model.js';
import type { Order } from './model.js';
export const format = (order: Order) => label(order);`},
    editableFiles:['index.ts'], mode:'typecheck', sources:[source],
    explanation:['값과 타입을 구분하면 번들에 실제로 필요한 모듈만 남고 모듈 경계도 분명해집니다.', 'ESM과 CommonJS의 전체 호환성이나 lib 설정은 이 과제의 범위를 넘어서는 별도 설정 문제입니다.']
  }),
  make({
    id:'p32', chapter:5, order:32,
    title:'optional과 null로 수정 의도 구분하기', navTitle:'optional vs null',
    summary:'프로필 수정 요청에서 optional 키 생략과 null 삭제를 구분해, 닉네임을 유지할지 바꿀지 지울지 서버가 정확히 판단하게 합니다.',
    story:'프로필 수정 화면에서 nickname을 바꾸지 않는 것과 지우는 것을 같은 방식으로 보내면 서버가 의도를 알 수 없습니다. 키를 생략한 경우와 undefined, null이 JSON에서 어떻게 달라지는지 확인하며 Patch 타입을 작성해 보세요.',
    concept:['서버가 생략과 삭제를 구분하지 못하는 문제를, exactOptionalPropertyTypes로 optional을 “키가 없어도 된다”는 뜻으로 고정해 줄입니다. Object.hasOwn으로 메모리 객체에 키가 실제로 있는지도 확인할 수 있습니다.', 'JSON.stringify는 객체의 undefined 속성을 생략합니다. 서버에 삭제를 요청하려면 null이나 API가 정한 명시적 연산을 계약에 넣어야 합니다.'],
    mission:'nickname을 생략하는 요청, 문자열로 바꾸는 요청, null로 지우는 요청을 구분해 Patch를 만드세요.',
    goals:['undefined 입력은 nickname 키가 없는 객체가 된다.', 'null은 JSON에도 남아 삭제 요청으로 전달된다.'],
    hints:['nickname은 string 또는 null을 담는 optional 필드로 선언하세요.', 'undefined가 들어오면 빈 객체를 반환하세요.', 'null은 그대로 nickname 값으로 넣으세요.'],
    starter:{'index.ts':`export type ProfilePatch = { nickname?: string | undefined };
export function patchNickname(nickname: string | null | undefined): ProfilePatch { return { nickname }; }`},
    solution:{'index.ts':`export type ProfilePatch = { nickname?: string | null };
export function patchNickname(nickname: string | null | undefined): ProfilePatch {
  return nickname === undefined ? {} : { nickname };
}`},
    editableFiles:['index.ts'], mode:'runtime', sources:[source],
    explanation:["Object.hasOwn(patch, 'nickname')을 사용하면 메모리 안에서 키가 아예 없는 경우와 값이 있는 경우를 구분할 수 있습니다.", 'JSON으로 보낼 때 undefined 속성은 사라집니다. 삭제하려는 뜻은 null이나 API가 문서화한 명시적 연산으로 표현해야 합니다.'],
    interview:{question:'JSON API에서 nickname: undefined를 필드 생략과 다른 신호로 사용할 수 있을까요?',answer:'일반적인 객체 JSON 직렬화에서는 undefined 속성이 생략되므로 구분되지 않는다. 다른 뜻이 필요하면 null이나 명시적인 연산을 계약으로 정해야 한다.',points:['메모리 객체와 JSON 결과를 구분한다.']}
  }),
];


