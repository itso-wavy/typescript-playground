import type { Lesson } from '../shared/contracts.js';

const checkedAt = '2026-09-08';
const tsSource = { title: 'TypeScript 좁히기와 판별 유니온', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };
const advanced = { title: 'TypeScript 고급 타입', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html' };

const minutesByOrder: Record<number, 5 | 6 | 7> = { 17: 6, 18: 5, 19: 7, 20: 6, 21: 6, 22: 6 };
function lesson(data: Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision' | 'minutes'>): Lesson {
  return { ...data, kind: 'practice', checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: minutesByOrder[data.order] };
}

export const lessons: Lesson[] = [
  lesson({
    id: 'b17', chapter: 3, order: 17, title: '판별 유니온으로 요청 상태 모델링하기', navTitle: '요청 상태',
    summary: '주문 화면의 로딩·성공·실패 상태를 판별 유니온으로 나눠, 상태에 맞지 않는 이전 데이터나 오류가 함께 표시되지 않게 합니다.',
    story: '주문 화면에 “불러오는 중”과 이전 주문이 함께 보여 운영자가 다른 주문을 수정했습니다. 로딩·성공·실패를 한 상태 객체로 뭉개지 말고, 각 상태에 필요한 값만 존재하도록 타입으로 고정해 봅니다.',
    concept: ['각 상태를 status라는 구분값으로 나누면, status에 맞는 데이터만 사용할 수 있습니다. 이런 타입을 판별 유니온이라고 부릅니다.', '상태에 맞지 않는 필드는 never로 표시하면 객체를 만들 때도 실수를 잡을 수 있습니다. switch의 마지막에서 never를 확인하면 새 상태를 빠뜨린 것도 알려 줍니다.'],
    mission: 'RequestState 타입을 완성하고, 로딩·성공·실패 상태에 맞는 문장을 반환하세요.',
    goals: ['loading 상태에는 data와 error를 넣을 수 없다.', '상태를 하나 더 추가하면 switch에서 빠뜨린 사실이 드러난다.'],
    hints: ['세 상태에 status를 공통으로 넣으세요.', 'data는 성공 상태에만 넣으세요.', 'switch의 default에서 state를 never 변수에 넣어 보세요.'],
    starter: { 'index.ts': `export type RequestState<T> =\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: string };\n\nexport function message(state: RequestState<string>): string {\n  return '';\n}` },
    solution: { 'index.ts': `export type RequestState<T> =\n  | { status: 'loading'; data?: never; error?: never }\n  | { status: 'success'; data: T; error?: never }\n  | { status: 'error'; error: string; data?: never };\n\nexport function message(state: RequestState<string>): string {\n  switch (state.status) {\n    case 'loading': return '불러오는 중';\n    case 'success': return state.data;\n    case 'error': return state.error;\n    default: { const exhaustive: never = state; return exhaustive; }\n  }\n}` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [tsSource],
    explanation: ['loading과 hasError처럼 boolean을 여러 개 두면 “로딩 중이면서 성공 데이터도 있는” 모순된 상태가 생길 수 있습니다.', 'status로 상태를 나누면 각 상태에서 필요한 값만 읽을 수 있습니다. 마지막 never 검사는 상태를 추가했을 때 처리하지 않은 분기를 알려 줍니다.'],
  }),
  lesson({
    id: 'b18', chapter: 3, order: 18, title: '사용자 정의 타입 가드로 값 검증하기', navTitle: 'value is 타입 가드',
    summary: '사용자 정의 타입 가드의 value is 계약과 실제 런타임 검증을 함께 작성합니다.',
    story: '외부 값이 주소처럼 보인다는 이유만으로 화면에 표시했더니 null, 배열, 빈 문자열이 통과했습니다. value is 반환형은 컴파일러를 좁혀 줄 뿐이므로, 가드 안에서 실제 입력을 검증해 안전한 WithAddress만 통과시키세요.',
    concept: ['value is WithAddress는 가드가 true일 때만 컴파일러가 값을 WithAddress로 좁힌다는 사용자 정의 타입 가드 계약입니다.', '그 반환형이 검증을 대신하지는 않습니다. null, 배열, 키 누락, 빈 문자열, 공백 문자열까지 직접 거절해야 안전합니다.'],
    mission: 'unknown 입력에서 유효한 address만 true를 반환하는 hasAddress(value): value is WithAddress를 작성하세요.',
    goals: ['user-defined type guard와 value is 반환형을 작성한다.', 'null·배열·키 누락·빈 문자열·공백 문자열을 거절한다.'],
    hints: ['먼저 object인지, null이 아니고 배열도 아닌지 확인하세요.', 'address라는 키와 string 타입을 확인하세요.', 'trim()한 결과가 비어 있지 않은지도 확인하세요.'],
    starter: { 'index.ts': `export type WithAddress = { address: string };\nexport function hasAddress(value: unknown): value is WithAddress {\n  return typeof value === 'object' && value !== null;\n}` },
    solution: { 'index.ts': `export type WithAddress = { address: string };\nexport function hasAddress(value: unknown): value is WithAddress {\n  return typeof value === 'object' && value !== null && !Array.isArray(value)\n    && 'address' in value\n    && typeof value.address === 'string'\n    && value.address.trim().length > 0;\n}` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [tsSource],
    explanation: ['잘못된 가드는 컴파일러만 속입니다. 다섯 가지 malformed 입력을 실제로 넣어 런타임 검증이 가드의 선언과 일치하는지 확인하세요.', '이번 과제는 asserts가 아니라 실패를 false로 반환하는 value is 가드에 집중합니다.'],
  }),
  lesson({
    id: 'b19', chapter: 3, order: 19, title: 'unknown 응답을 Payment로 변환하기', navTitle: 'unknown → Payment',
    summary: '결제 API 응답을 unknown으로 받은 뒤 id와 total의 실제 타입을 검사해, 화면이 안전하게 사용할 Payment 객체로 변환합니다.',
    story: '결제 API가 어떤 날에는 null을, 어떤 날에는 id를 숫자로 바꾼 객체를 보냈습니다. 서버가 보낸 JavaScript를 TypeScript가 대신 검사해 주지는 않으므로, 앱 경계에서 먼저 unknown으로 받고 필요한 값만 확인해 봅니다.',
    concept: ['unknown은 확인하기 전까지 바로 사용할 수 없는 타입입니다. fetch<Payment>처럼 적어도 서버 응답이 실제로 Payment인지 검사해 주지는 않습니다.', '필요한 필드가 있는지와 타입이 맞는지를 확인한 뒤, 앱에서 사용할 Payment 객체를 새로 만들어야 합니다.'],
    mission: 'unknown으로 받은 값에서 id와 total을 확인하고 Payment로 변환하세요.',
    goals: ['null, 배열, 오류 객체, 잘못된 id를 거절한다.', 'total이 유한한 숫자인지 확인한다.'],
    hints: ['object이면서 null이 아니고 배열도 아닌지 먼저 확인하세요.', 'id와 total 키가 모두 있는지 확인하세요.', '조건을 만족하지 않으면 Error를 던지세요.'],
    starter: { 'index.ts': `export type Payment = { id: string; total: number };\nexport function toPayment(value: unknown): Payment {\n  return value as Payment;\n}` },
    solution: { 'index.ts': `export type Payment = { id: string; total: number };\nexport function toPayment(value: unknown): Payment {\n  if (typeof value !== 'object' || value === null || Array.isArray(value)\n    || !('id' in value) || !('total' in value)\n    || typeof value.id !== 'string' || value.id.length === 0\n    || typeof value.total !== 'number' || !Number.isFinite(value.total)) {\n    throw new Error('잘못된 결제 응답');\n  }\n  return { id: value.id, total: value.total };\n}` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [tsSource],
    explanation: ['unknown으로 시작하면 누락된 필드와 null을 사용하기 전에 처리하게 됩니다.', '타입 단언이나 fetch<T>는 서버가 보낸 JavaScript를 바꾸지 않습니다. 실제 값 검사가 반드시 필요합니다.'],
  }),
  lesson({
    id: 'b20', chapter: 3, order: 20, title: 'DTO를 화면 모델로 변환하기', navTitle: 'DTO 변환',
    summary: '주문 서버 DTO의 created_at과 null 담당자를 경계에서 변환해, 화면에는 Date와 표시 가능한 담당자 문자열을 전달합니다.',
    story: '서버는 created_at을 문자열로 보내고 담당자가 없으면 null을 보냅니다. 화면은 Date와 “미배정”을 기대하는데 서버 객체를 그대로 퍼뜨리면 모든 컴포넌트가 같은 변환을 반복하게 됩니다. 경계에서 한 번 바꿔 보세요.',
    concept: ['DTO는 서버와 주고받는 형식이고, 화면 모델은 화면이 쓰기 편한 형식입니다. 변환 함수에서 이름과 null 처리 방식을 정하면 API가 바뀌어도 수정할 곳이 줄어듭니다.', '날짜 문자열이 잘못된 경우도 외부 데이터 오류이므로 변환할 때 확인해야 합니다.'],
    mission: 'OrderDto를 화면에서 사용할 OrderCard로 변환하세요.',
    goals: ['created_at을 유효한 Date로 바꾼다.', 'assignee가 null이면 “미배정”으로 바꾼다.'],
    hints: ['new Date로 바꾼 뒤 getTime()이 NaN인지 확인하세요.', 'null 병합 연산자를 사용하세요.', '서버의 DTO를 그대로 반환하지 마세요.'],
    starter: { 'index.ts': `export type OrderDto = { id: string; created_at: string; assignee: string | null };\nexport type OrderCard = { id: string; createdAt: Date; assigneeName: string };\nexport function toOrderCard(dto: OrderDto): OrderCard { throw new Error('TODO'); }` },
    solution: { 'index.ts': `export type OrderDto = { id: string; created_at: string; assignee: string | null };\nexport type OrderCard = { id: string; createdAt: Date; assigneeName: string };\nexport function toOrderCard(dto: OrderDto): OrderCard {\n  const createdAt = new Date(dto.created_at);\n  if (Number.isNaN(createdAt.getTime())) throw new Error('잘못된 날짜');\n  return { id: dto.id, createdAt, assigneeName: dto.assignee ?? '미배정' };\n}` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [tsSource],
    explanation: ['변환 함수가 서버의 이름과 화면의 이름을 만나는 경계가 됩니다.', 'null 처리를 이곳에서 끝내면 여러 컴포넌트가 같은 조건문을 반복하지 않아도 됩니다.'],
  }),
  lesson({
    id: 'b21', chapter: 3, order: 21, title: 'Result 타입으로 성공과 실패 표현하기', navTitle: 'Result<T, E>',
    summary: '동기 입력 파서에서 Result<T, E>로 예상 가능한 성공과 실패를 표현합니다.',
    story: '수량 입력이 비어 있거나 음수인 것은 예상 가능한 사용자 오류입니다. 이런 실패를 예외로 숨기지 말고 Result<number, string>의 ok 구분값으로 반환해 호출자가 성공과 실패를 모두 처리하게 해 봅니다.',
    concept: ['Result<T, E>는 ok가 true일 때 value를, false일 때 error를 제공하는 판별 유니온입니다.', '예상 가능한 입력 실패는 반환값으로 표현하고, 네트워크 단절처럼 별도 복구가 필요한 예외는 throw와 try/catch 정책으로 구분합니다.'],
    mission: '동기 parseQuantity가 성공하면 숫자를, 예상 가능한 입력 실패면 오류 메시지를 담은 Result를 반환하게 하세요.',
    goals: ['성공 결과와 실패 결과에 서로 다른 필드가 있다.', '빈 값과 음수를 실패 결과로 반환한다.'],
    hints: ['ok: true와 ok: false를 두 경우의 구분값으로 쓰세요.', 'Number로 바꾼 뒤 정수인지와 범위를 확인하세요.', '예상 가능한 실패에는 throw 대신 실패 객체를 반환하세요.'],
    starter: { 'index.ts': `export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\nexport function parseQuantity(raw: string): Result<number, string> {\n  return { ok: true, value: 0 };\n}` },
    solution: { 'index.ts': `export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };\nexport function parseQuantity(raw: string): Result<number, string> {\n  if (raw.trim() === '') return { ok: false, error: '0 이상의 정수를 입력하세요.' };\n  const value = Number(raw);\n  if (!Number.isInteger(value) || value < 0) return { ok: false, error: '0 이상의 정수를 입력하세요.' };\n  return { ok: true, value };\n}` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [tsSource, advanced],
    explanation: ['Result를 사용하면 예상 가능한 입력 실패가 함수의 반환 타입에 드러나 호출자가 놓치기 어렵습니다.', '이 함수는 동기 파서이므로 네트워크 예외를 다루지 않습니다. 예상 밖의 예외는 throw하고 경계에서 try/catch로 별도 처리할 수 있습니다.'],
    interview:{question:'예상 가능한 입력 실패와 예외를 언제 반환값과 throw로 나누나요?',answer:'호출자가 정상적인 흐름에서 처리할 수 있는 입력 실패는 Result의 error로 반환하고, 네트워크 단절처럼 별도 복구 정책이 필요한 예상 밖의 실패는 throw와 try/catch로 다룹니다.',points:['Result의 ok 구분값','예상 가능한 실패와 예외의 경계']},
  }),
  lesson({
    id: 'b22', chapter: 3, order: 22, title: '브랜드 타입으로 식별자 구분하기', navTitle: '브랜드 ID',
    summary: 'API에 전달하는 사용자 ID와 주문 ID를 브랜드 타입으로 구분하고 형식도 검사해, 서로 다른 식별자를 잘못 넘기는 호출을 막습니다.',
    story: '주문 상세 API에 사용자 ID를 잘못 전달해 전혀 다른 데이터를 조회했습니다. 두 값이 모두 문자열이라 컴파일러도 막지 못한 실수입니다. ID를 만드는 경계에서 형식을 확인하고, 그 뒤에는 서로 섞이지 않게 해 봅니다.',
    concept: ['브랜드 타입은 같은 string에 “사용자 ID”나 “주문 ID”라는 역할을 붙여 컴파일러가 구분하게 합니다. 실행할 때는 사라지므로 문자열 형식 검사를 대신하지 않습니다.', '외부 문자열을 UserId나 OrderId로 바꾸기 전에 접두사와 빈 값을 확인해야 합니다.'],
    mission: 'UserId와 OrderId를 만드는 함수를 완성하고, 잘못된 ID를 거절하세요.',
    goals: ['UserId와 OrderId를 서로 대입할 수 없다.', '올바르지 않은 접두사는 실행 중에 거절한다.'],
    hints: ['문자열 브랜드 타입만으로도 두 역할을 구분할 수 있습니다.', 'as는 검증을 끝낸 뒤 한 번만 사용하세요.', 'ID가 올바른 접두사로 시작하는지 확인하세요.'],
    starter: { 'index.ts': `export type UserId = string & { readonly __brand: 'UserId' };\nexport type OrderId = string & { readonly __brand: 'OrderId' };\nexport const userId = (value: string): UserId => value as UserId;\nexport const orderId = (value: string): OrderId => value as OrderId;` },
    solution: { 'index.ts': `export type UserId = string & { readonly __brand: 'UserId' };\nexport type OrderId = string & { readonly __brand: 'OrderId' };\nfunction branded<T extends string>(value: string, prefix: string): T {\n  if (!value.startsWith(prefix) || value.length === prefix.length) throw new Error('잘못된 식별자');\n  return value as T;\n}\nexport const userId = (value: string): UserId => branded<UserId>(value, 'usr_');\nexport const orderId = (value: string): OrderId => branded<OrderId>(value, 'ord_');` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [tsSource],
    explanation: ['브랜드 타입은 UserId와 OrderId가 모두 string이라는 사실은 유지하면서, 함수 인자에서 두 역할을 섞지 못하게 합니다.', '브랜드를 붙이는 순간에 형식을 검사해야 외부 입력에도 의미가 생깁니다.'],
    interview: { question: '브랜드 타입만으로 API에서 받은 ID를 안전하다고 할 수 없는 이유는 무엇인가요?', answer: '브랜드는 컴파일할 때만 존재하고 실행할 때는 사라지므로, 외부 문자열의 형식을 직접 검사해야 한다.', points: ['컴파일 시간과 실행 시간을 구분한다.', '값을 브랜드로 바꾸는 경계에서 검사한다.'] },
  }),
];


