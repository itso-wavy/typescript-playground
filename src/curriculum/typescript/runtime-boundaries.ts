import type { Lesson } from '../../shared/contracts.js';

const checkedAt = '2026-09-11';
const narrowing = { title: 'TypeScript Handbook: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };
const utilityTypes = { title: 'TypeScript Handbook: Utility Types', url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html' };
const exactOptional = { title: 'TSConfig: exactOptionalPropertyTypes', url: 'https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html' };
const minutesByOrder: Record<number, 6 | 7> = { 13: 7, 14: 7, 15: 6, 16: 6, 17: 7 };
const make = (data: Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision' | 'minutes'>): Lesson => ({
  ...data,
  kind: 'practice',
  checkedAt,
  compilerVersion: '7.0.2',
  revision: 1,
  minutes: minutesByOrder[data.order],
});

export const lessons: Lesson[] = [
  make({
    id: 'ts13.unknown-guard', chapter: 3, order: 13,
    title: "unknown 외부 값을 타입 가드로 검증하기", navTitle: "unknown 가드",
    summary: "결제 API에서 들어온 unknown 값을 직접 확인하고, 검증을 통과한 값만 Payment 타입으로 좁히는 타입 가드를 작성합니다.",
    story: "결제 API의 응답을 Payment 타입이라고 선언했지만 장애 때 null과 오류 객체가 들어와 금액 화면이 깨졌습니다. 외부 값의 선언을 믿지 말고 객체 여부, 필드 타입, 값 범위를 실행 중에 확인한 뒤 앱 코드로 넘겨야 합니다.",
    concept: [
      "unknown 타입은 값을 사용하기 전에 확인하도록 강제합니다. typeof 연산자만으로는 null과 배열을 객체에서 제외할 수 없습니다. 객체인지, null이 아닌지, 배열이 아닌지를 먼저 확인한 뒤 in 연산자와 각 속성 검사를 이어 갑니다.",
      "완성 예시인 `isPayment({ id: \"pay_1\", total: 12000 })`는 true입니다. id 속성이 비어 있지 않고 total 속성이 0 이상인 유한 수이기 때문입니다. total 속성이 문자열이면 false가 되어 Payment 타입으로 좁혀지지 않습니다.",
    ],
    workedExample: { title: "완성 예시: unknown 값 확인하기", code: 'function isName(value: unknown): value is string {\n  return typeof value === "string" && value.trim().length > 0;\n}\n\nconst input: unknown = "Wavy";\n\nif (isName(input)) {\n  input.toUpperCase();\n}', result: ["외부 입력을 담은 input 변수는 검사를 통과한 분기에서 string 타입으로 좁혀집니다.", "타입 술어만 적는 것으로는 부족합니다. isName 함수 안의 실제 검사가 그 주장을 뒷받침해야 합니다."] },
    mission: "이제 같은 원리를 결제 응답에 적용하세요. isPayment 타입 가드가 올바른 객체만 Payment 타입으로 좁히고, null·배열·빈 id 속성·잘못된 금액을 거절하게 고치세요.",
    goals: ["unknown 객체를 속성 접근 전에 안전하게 좁힌다.", "타입뿐 아니라 id와 total 속성의 유효 범위도 실행 중에 검사한다."],
    hints: ["`typeof value === \"object\"` 조건만으로는 null과 배열을 제외할 수 없습니다.", "id와 total 속성이 객체에 있는지 확인한 뒤 각 속성의 타입을 검사하세요.", "id 속성은 공백이 아니어야 하고 total 속성은 0 이상인 유한 수여야 합니다."],
    explanation: ["타입 술어 `value is Payment`는 검사 코드가 보장한 범위 안에서만 신뢰할 수 있습니다.", "유사 문제에서는 완성 예시를 복사하지 말고, 다른 필드에도 객체·타입·값 규칙을 같은 순서로 적용하세요."],
    starter: { 'index.ts': `export type Payment = { id: string; total: number };
export function isPayment(value: unknown): value is Payment {
  return typeof value === 'object';
}
` },
    solution: { 'index.ts': `export type Payment = { id: string; total: number };
export function isPayment(value: unknown): value is Payment {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && 'id' in value && typeof value.id === 'string' && value.id.trim().length > 0
    && 'total' in value && typeof value.total === 'number'
    && Number.isFinite(value.total) && value.total >= 0;
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [narrowing],
  }),
  make({
    id: 'ts14.dto-to-domain', chapter: 3, order: 14,
    title: "서버 DTO를 도메인 모델로 한곳에서 변환하기", navTitle: "DTO 변환",
    summary: "서버의 snake_case 날짜와 null일 수 있는 담당자 값을 화면이 쓰는 Date와 문자열 모델로 한 경계에서 변환해 외부 형식이 앱 전체로 번지지 않게 합니다.",
    story: "주문 API의 created_at 속성과 null 담당자 값을 화면마다 제각각 바꾸자 날짜 오류 처리와 \"미배정\" 표시가 달라졌습니다. DTO와 도메인 모델을 분리하고 변환 지점을 하나로 모아 같은 규칙을 재사용합니다.",
    concept: [
      "DTO 타입은 서버 전송 형식을, 도메인 모델 타입은 앱이 믿고 사용하는 형식을 나타냅니다. 변환 함수는 속성 이름만 바꾸지 않고 날짜 파싱 실패와 null 처리 규칙까지 책임집니다.",
      "완성 예시인 `{ id: \"ord_1\", created_at: \"2026-09-11T00:00:00Z\", assignee: null }`은 id 속성을 유지하면서 유효한 Date 객체와 \"미배정\" 문자열로 바뀝니다. created_at 속성의 날짜 문자열을 파싱할 수 없으면 Invalid Date 객체를 숨기지 않고 오류를 던집니다.",
    ],
    workedExample: { title: "완성 예시: API 날짜를 앱 모델로 바꾸기", code: 'type UserDto = { id: string; joined_at: string };\ntype User = { id: string; joinedAt: Date };\n\nfunction toUser(dto: UserDto): User {\n  const joinedAt = new Date(dto.joined_at);\n  if (Number.isNaN(joinedAt.getTime())) throw new Error("잘못된 가입 날짜");\n  return { id: dto.id, joinedAt };\n}', result: ["dto 매개변수의 id 속성은 유지하고, joined_at 속성의 문자열은 앱에서 사용할 Date 값으로 바꿉니다.", "날짜를 읽을 수 없으면 잘못된 Date를 넘기지 않고 즉시 오류를 냅니다."] },
    mission: "이제 같은 원리를 주문 DTO에 적용하세요. toOrder 변환 함수에서 id 속성을 유지하고 유효한 Date 객체와 담당자 이름을 만들며, 파싱할 수 없는 날짜는 명시적으로 거절하세요.",
    goals: ["전송 형식과 앱 모델의 이름 및 값 표현을 분리한다.", "날짜 파싱 실패와 null일 수 있는 필드의 정책을 변환 경계에 둔다."],
    hints: ["`new Date(dto.created_at)`로 만든 Date 객체의 getTime 메서드 결과를 확인하세요.", "assignee 속성이 null일 때만 \"미배정\" 문자열로 바꾸세요.", "반환 객체에는 created_at 속성 대신 createdAt 속성을 넣으세요."],
    explanation: ["화면은 검증된 Order 모델만 받으므로 서버 속성 이름과 null 처리 규칙을 반복해서 알 필요가 없습니다.", "API 필드가 바뀌면 이 변환 함수와 경계 테스트를 고치면 됩니다. 타입 선언만 바꿔 런타임 오류를 숨겨서는 안 됩니다."],
    starter: { 'index.ts': `export type OrderDto = { id: string; created_at: string; assignee: string | null };
export type Order = { id: string; createdAt: Date; assigneeName: string };
export function toOrder(dto: OrderDto): Order {
  return dto as unknown as Order;
}
` },
    solution: { 'index.ts': `export type OrderDto = { id: string; created_at: string; assignee: string | null };
export type Order = { id: string; createdAt: Date; assigneeName: string };
export function toOrder(dto: OrderDto): Order {
  const createdAt = new Date(dto.created_at);
  if (Number.isNaN(createdAt.getTime())) throw new Error('잘못된 주문 날짜');
  return { id: dto.id, createdAt, assigneeName: dto.assignee ?? '미배정' };
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [narrowing],
  }),
  make({
    id: 'ts15.result-failure', chapter: 3, order: 15,
    title: "예상 가능한 실패를 판별 유니온으로 표현하기", navTitle: "Result 실패",
    summary: "사용자 수량 입력의 성공과 예상 가능한 실패를 Result<T, E> 판별 유니온으로 반환해 호출자가 두 경우를 빠짐없이 처리하게 합니다.",
    story: "주문 폼의 수량 파서가 빈 문자열과 소수를 모두 예외로 던지자 화면 코드가 정상적인 입력 오류까지 장애처럼 처리했습니다. 예상 가능한 실패를 반환값에 포함해 호출부가 메시지를 선택하도록 만듭니다.",
    concept: [
      "판별 유니온 `Result<T, E>`는 ok 판별 속성을 기준으로 성공의 value 속성과 실패의 error 속성을 분리합니다. 호출자는 ok 속성을 확인한 뒤에만 해당 속성에 접근할 수 있어 실패 처리를 빼먹기 어렵습니다.",
      "완성 예시인 `parseQuantity(\"3\")`은 `{ ok: true, value: 3 }`을 반환합니다. `parseQuantity(\"1.5\")`는 `{ ok: false, error: \"수량은 0 이상인 정수여야 합니다.\" }`를 반환합니다. ok 속성의 리터럴 값이 두 객체를 구분하므로 분기 뒤에는 value 또는 error 속성만 안전하게 사용할 수 있습니다. 예외는 복구하기 어려운 예상 밖 실패에 남겨 둘 수 있습니다.",
    ],
    workedExample: { title: "완성 예시: 성공과 실패를 값으로 돌려주기", code: 'type Result<T> =\n  | { ok: true; value: T }\n  | { ok: false; error: string };\n\nfunction parseId(raw: string): Result<string> {\n  return raw ? { ok: true, value: raw } : { ok: false, error: "ID가 없습니다." };\n}', result: ["ok 속성이 true인 분기에서는 value 속성을 사용할 수 있습니다.", "ok 속성이 false인 분기에서는 error 속성을 사용할 수 있습니다."] },
    mission: "먼저 `Result<T, E>` 타입을 `{ ok: true; value: T } | { ok: false; error: E }` 판별 유니온으로 고치세요. 이어서 parseQuantity 함수가 빈 값·소수·음수에는 실패 Result 값을, 0 이상인 정수에는 성공 Result 값을 반환하게 구현하세요.",
    goals: ["성공과 실패의 필드를 판별 유니온으로 분리한다.", "예상 입력 오류를 호출자가 처리할 수 있는 값으로 반환한다."],
    hints: ["Result 타입의 두 구성원에 같은 ok 속성과 서로 다른 boolean 리터럴 값을 사용하세요.", "raw 매개변수의 공백 입력은 Number 함수로 바꾸기 전에 별도로 거절하세요.", "Number.isInteger 함수와 0 이상 조건을 함께 확인하세요."],
    explanation: ["ok 속성으로 분기한 뒤에는 value 또는 error 속성이 정확히 좁혀져 불필요한 단언이 사라집니다.", "Result 타입을 사용해도 로그가 필요한 시스템 오류까지 모두 문자열 실패로 삼킬 필요는 없습니다."],
    starter: { 'index.ts': `export type Result<T, E> = { ok: boolean; value?: T; error?: E };
export function parseQuantity(raw: string): Result<number, string> {
  return { ok: true, value: Number(raw) };
}
` },
    solution: { 'index.ts': `export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export function parseQuantity(raw: string): Result<number, string> {
  if (raw.trim() === '') return { ok: false, error: '수량을 입력하세요.' };
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0
    ? { ok: true, value }
    : { ok: false, error: '수량은 0 이상인 정수여야 합니다.' };
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [narrowing],
    interview: { question: "사용자 입력 오류를 예외 대신 Result로 돌려주면 호출부의 책임이 어떻게 달라지나요?", answer: "호출부가 ok 속성을 분기해 성공 값과 오류 메시지를 명시적으로 처리해야 하며, 예상 밖 시스템 오류와 구분할 수 있습니다.", points: ["판별 유니온의 강제 분기", "예상 실패와 시스템 오류의 구분"] },
  }),
  make({
    id: 'ts16.async-awaited', chapter: 3, order: 16,
    title: "Promise 성공값을 Awaited로 연결하기", navTitle: "Promise와 Awaited",
    summary: "비동기 주문 loader 함수의 Promise 성공값을 Awaited와 ReturnType으로 계산해 함수 계약 변경이 화면 상태 타입에도 자동으로 반영되게 합니다.",
    story: "주문 loader 함수의 반환 모델이 바뀌었는데 화면 상태가 별도 타입을 복사해 두어 오래된 필드를 계속 사용했습니다. 비동기 함수의 실제 반환 시그니처에서 성공값 타입을 계산하고 오류 경계는 별도로 유지합니다.",
    concept: [
      "Awaited 유틸리티 타입 `Awaited<T>`는 await가 처리한 뒤의 성공값 타입을 계산하며 중첩 Promise도 풀어냅니다. ReturnType 유틸리티 타입과 함께 쓰면 loader 함수의 타입을 다시 적지 않아도 됩니다.",
      "완성 예시인 `type LoaderValue = Awaited<ReturnType<typeof loadOrder>>`를 보세요. loadOrder 함수의 반환 타입이 `Promise<Order>`이면 LoaderValue 타입은 Order입니다. ReturnType이 함수 반환 타입을 꺼내고 Awaited가 Promise를 푼 결과입니다. 이 계산은 reject 이유를 안전한 오류 타입으로 바꾸지 않으므로 catch 절에서는 여전히 unknown 값을 좁혀야 합니다.",
    ],
    workedExample: { title: "완성 예시: Promise 안의 값 타입 꺼내기", code: 'async function loadFeatureFlags(): Promise<{ betaSearch: boolean }> {\n  return { betaSearch: true };\n}\n\ntype FeatureFlags = Awaited<ReturnType<typeof loadFeatureFlags>>;', result: ["ReturnType은 기능 설정을 불러오는 loadFeatureFlags 함수의 Promise 반환 타입을 얻습니다.", "Awaited는 Promise를 풀어 FeatureFlags 타입을 `{ betaSearch: boolean }`로 만듭니다."] },
    mission: "loadOrder 함수의 반환 타입을 `Promise<Order>`로 바꾸고, LoaderValue 타입 별칭을 `Awaited<ReturnType<typeof loadOrder>>`로 수정하세요.",
    goals: ["Promise가 이행한 값의 타입을 Awaited로 계산한다.", "성공값 타입과 reject 또는 catch의 unknown 경계를 구분한다."],
    hints: ["먼저 `typeof loadOrder`로 함수 타입을 얻으세요.", "ReturnType 유틸리티 타입으로 loadOrder 함수의 Promise 반환 타입을 꺼내세요.", "그 결과를 Awaited 유틸리티 타입으로 감싸 성공값 타입을 얻으세요."],
    explanation: ["loadOrder 함수의 반환 타입을 바꾸면 LoaderValue 타입도 함께 바뀌어 복사된 모델의 불일치를 줄입니다.", "유사 문제에서도 Awaited 유틸리티 타입은 실행 중 오류를 검증하는 도구가 아니라 컴파일 시 성공값 타입을 계산하는 도구임을 구분하세요."],
    starter: { 'index.ts': `export type Order = { id: string; total: number };
export async function loadOrder(): Promise<unknown> {
  return { id: 'ord_1', total: 12000 };
}
export type LoaderValue = unknown;
` },
    solution: { 'index.ts': `export type Order = { id: string; total: number };
export async function loadOrder(): Promise<Order> {
  return { id: 'ord_1', total: 12000 };
}
export type LoaderValue = Awaited<ReturnType<typeof loadOrder>>;
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [utilityTypes],
  }),
  make({
    id: 'ts17.patch-json-boundary', chapter: 3, order: 17,
    title: "JSON 수정 요청에서 생략과 null 구분하기", navTitle: "JSON Patch 경계",
    summary: "주문 메모를 유지하는 생략, 문자열로 바꾸는 값, 지우는 null을 서로 다른 요청으로 만들고 JSON 직렬화 결과까지 확인합니다.",
    story: "주문 수정 화면에서 메모를 건드리지 않았는데 note 속성에 undefined를 넣었습니다. 이 속성은 JSON.stringify 함수로 직렬화할 때 제거되어 note 키를 처음부터 생략한 요청과 같은 JSON이 됩니다. 메모 유지·변경·삭제를 객체와 JSON 양쪽에서 분명히 구분하는 작은 변환 경계를 작성합니다.",
    concept: [
      "선택적 속성은 키가 없을 수 있다는 뜻입니다. exactOptionalPropertyTypes 컴파일러 옵션을 사용하면 `note?: string | null` 속성에 명시적인 undefined 값을 넣는 실수를 막고, 키의 생략과 실제 값을 더 정확히 구분합니다.",
      "완성 예시인 `makeOrderPatch(undefined)`는 `{}`를 반환하므로 note 키가 없습니다. `makeOrderPatch(\"배송 전 연락\")`은 `{ note: \"배송 전 연락\" }`을, `makeOrderPatch(null)`은 `{ note: null }`을 반환합니다. JSON.stringify 함수는 undefined 속성을 제거하므로 별도의 삭제 신호가 될 수 없습니다. 삭제가 필요하면 null 값이나 API가 정한 명시적 연산을 계약에 포함해야 합니다.",
    ],
    workedExample: { title: "완성 예시: 유지와 삭제 구분하기", code: 'type ProfilePatch = { bio?: string | null };\n\nconst keep: ProfilePatch = {};\nconst change: ProfilePatch = { bio: "새 소개" };\nconst remove: ProfilePatch = { bio: null };', result: ["bio 속성을 생략하면 기존 값을 유지한다는 뜻으로 사용할 수 있습니다.", "문자열은 변경, null은 삭제 요청으로 구분할 수 있습니다. null은 JSON으로 바꿔도 남습니다."] },
    mission: "OrderPatch 타입의 note 속성을 선택적인 `string | null`로 고치고, undefined 입력에서는 note 키를 생략하며 문자열과 null 값은 그대로 보존하는 makeOrderPatch 함수를 작성하세요. 세 수정 의도가 JSON에서도 정확히 구분되면 완료입니다.",
    goals: ["선택적 속성 키의 생략과 명시적인 undefined 값을 구분한다.", "null 삭제 신호가 JSON 직렬화 뒤에도 유지되는지 확인한다."],
    hints: ["OrderPatch 타입의 note 속성은 선택적인 `string | null`입니다.", "note 매개변수가 undefined일 때는 note 키를 만들지 말고 빈 객체를 반환하세요.", "null 값은 조건에서 버리지 말고 note 속성값으로 그대로 넣으세요."],
    explanation: ["Object.hasOwn 함수로 메모리 객체에 note 키가 있는지 확인하고, JSON 문자열에 null 값이 남는지도 검증할 수 있습니다.", "Partial 같은 타입 계산은 허용 키를 제한하지만 직렬화 정책까지 실행해 주지는 않습니다. 변환 함수와 런타임 테스트가 필요합니다."],
    starter: { 'index.ts': `export type OrderPatch = { note?: string | undefined };
export function makeOrderPatch(note: string | null | undefined): OrderPatch {
  return { note };
}
` },
    solution: { 'index.ts': `export type OrderPatch = { note?: string | null };
export function makeOrderPatch(note: string | null | undefined): OrderPatch {
  return note === undefined ? {} : { note };
}
` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [exactOptional],
    interview: { question: "note 속성에 undefined 값을 넣은 객체를 JSON API에서 필드 생략과 다른 신호로 쓸 수 없는 이유는 무엇인가요?", answer: "일반 객체를 JSON.stringify 함수로 직렬화하면 undefined 속성이 제거되어 키를 만들지 않은 경우와 같은 결과가 되기 때문입니다.", points: ["메모리 객체와 JSON 표현의 차이", "null 값 또는 명시적 연산 계약"] },
  }),
];
