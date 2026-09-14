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
    title: 'unknown 외부 데이터를 타입 가드로 안전하게 검증하기', navTitle: 'unknown 가드',
    summary: '결제 API의 unknown 응답값을 직접 검증하고, 유효한 데이터만 Payment 타입으로 좁히는 타입 가드를 작성해 봅니다.',
    story: '결제 API 응답을 Payment 타입으로 단언(Assertion)했으나, 서버 장애로 null이나 에러 객체가 전달되면서 화면이 깨지는 현상이 발생했습니다. 외부에서 들어온 데이터는 타입 선언을 맹신하지 말고 런타임에 객체 여부, 필드 타입, 값의 유효 범위를 꼼꼼히 확인한 후 앱 로직으로 넘겨야 합니다.',
    concept: [
      'unknown 타입은 값을 사용하기 전 반드시 검증하도록 강제합니다. typeof 연산자만으로는 null과 배열을 일반 객체와 구분할 수 없으므로, 객체 여부와 null/배열 여부를 먼저 확인한 뒤 in 연산자로 개별 속성을 검사해야 합니다.',
      '완성 예시인 `isPayment({ id: "pay_1", total: 12000 })`는 true를 반환합니다. id 속성이 비어 있지 않고, total 속성이 0 이상의 유한수이기 때문입니다. 만약 total이 문자열이라면 검증에 실패하여 Payment 타입으로 좁혀지지 않습니다.',
    ],
    workedExample: {
      title: '완성 예시: unknown 값 검증하기',
      code: 'function isName(value: unknown): value is string {\n  return typeof value === "string" && value.trim().length > 0;\n}\n\nif (isName(input)) {\n  input.toUpperCase();\n}',
      result: ['검증을 통과한 조건문 안에서 input 변수는 string 타입으로 안전하게 좁혀집니다.', '단순히 타입 술어(Type Predicate)만 작성하는 것으로는 부족하며, 함수 내부의 실제 로직이 이를 뒷받침해야 합니다.']
    },
    mission: '앞서 배운 원리를 결제 API 응답에 적용해 보세요. isPayment 타입 가드가 올바른 객체만 Payment 타입으로 좁히도록 구현하고, null·배열·빈 id·잘못된 금액을 모두 걸러내야 합니다.',
    goals: ['unknown 객체의 속성에 접근하기 전에 안전하게 타입을 좁힌다.', '타입 검사를 넘어, 런타임에 id와 금액의 유효 범위까지 확인한다.'],
    hints: ['`typeof value === "object"` 조건만으로는 null과 배열을 걸러낼 수 없습니다.', '객체 내부에 id와 total 속성이 존재하는지 확인한 뒤, 각각의 타입을 검사하세요.', 'id는 공백이 아니어야 하며, total은 0 이상의 유한수여야 합니다.'],
    explanation: ['타입 술어 `value is Payment`는 함수 내부의 검증 로직이 완벽할 때만 신뢰할 수 있습니다.', '비슷한 문제를 풀 때 예제 코드를 무작정 복사하지 말고, 다른 필드에도 객체·타입·값 검증 규칙을 일관된 순서로 적용해 보세요.'],
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
    title: '서버 DTO를 도메인 모델로 한곳에서 변환하기', navTitle: 'DTO 변환',
    summary: '서버의 snake_case 날짜 포맷과 nullable한 담당자 데이터를 화면에서 사용하는 Date 객체 및 문자열로 변환하여, 외부 데이터 형식이 앱 전체로 퍼지는 것을 방지합니다.',
    story: '주문 API의 created_at 속성과 담당자(assignee)의 null 값을 화면마다 제각각 처리하다 보니, 날짜 오류나 "미배정" 표시 기준이 파편화되었습니다. DTO와 도메인 모델을 분리하고 변환 로직을 한곳으로 모아 일관된 규칙을 적용해야 합니다.',
    concept: [
      'DTO 타입은 서버와의 통신 형식을, 도메인 모델 타입은 앱 내부에서 신뢰하고 사용하는 형식을 의미합니다. 변환 함수는 단순히 속성 이름만 바꾸는 것이 아니라, 날짜 파싱 실패나 null 처리 같은 예외 상황까지 책임져야 합니다.',
      '완성 예시인 `{ created_at: "2026-09-11T00:00:00Z", assignee: null }`은 유효한 Date 객체와 "미배정" 문자열로 변환됩니다. 만약 created_at을 날짜로 파싱할 수 없다면, Invalid Date 객체를 조용히 넘기지 않고 즉시 에러를 던져야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: API 날짜를 도메인 모델로 변환하기',
      code: 'type UserDto = { joined_at: string };\ntype User = { joinedAt: Date };\n\nfunction toUser(dto: UserDto): User {\n  const joinedAt = new Date(dto.joined_at);\n  if (Number.isNaN(joinedAt.getTime())) throw new Error("잘못된 가입 날짜");\n  return { joinedAt };\n}',
      result: ['서버의 joined_at 문자열을 앱에서 사용할 Date 객체로 변환합니다.', '날짜를 정상적으로 읽을 수 없다면 잘못된 Date 객체를 반환하는 대신 즉시 에러를 발생시킵니다.']
    },
    mission: '주문 DTO에 변환 원리를 적용해 보세요. toOrder 변환 함수가 유효한 Date 객체와 담당자 이름을 반환하도록 구현하고, 파싱할 수 없는 날짜는 명시적으로 에러를 던져 거절하세요.',
    goals: ['서버의 전송 형식(DTO)과 앱 내부 모델의 네이밍 및 값 표현을 분리한다.', '날짜 파싱 실패 및 null 처리에 대한 정책을 변환 계층에서 통합 관리한다.'],
    hints: ['`new Date(dto.created_at)`로 생성한 Date 객체의 getTime() 메서드 결과를 확인하세요.', 'assignee 속성이 null일 때만 "미배정" 문자열로 대체하세요.', '반환되는 객체에는 created_at 대신 createdAt 속성을 사용해야 합니다.'],
    explanation: ['화면 컴포넌트는 검증이 완료된 Order 모델만 전달받으므로, 서버의 네이밍 컨벤션이나 null 처리 규칙을 화면마다 신경 쓸 필요가 없어집니다.', 'API 스펙이 변경되면 이 변환 함수와 테스트 코드만 수정하면 됩니다. 타입 선언만 수정하여 런타임 에러를 덮어두어서는 안 됩니다.'],
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
    title: '예상 가능한 실패를 판별 유니온(Discriminated Union)으로 표현하기', navTitle: 'Result 패턴',
    summary: '사용자의 수량 입력 성공 여부와 예상 가능한 실패를 Result<T, E> 판별 유니온으로 반환하여, 호출하는 쪽에서 두 경우를 빠짐없이 처리하도록 유도합니다.',
    story: '주문 폼의 수량 파서가 빈 문자열이나 소수점 입력을 예외(Exception)로 던지자, 화면 로직이 단순한 입력 오류까지 시스템 장애처럼 처리해 버렸습니다. 예상 가능한 실패는 반환값 자체에 포함시켜 호출부가 상황에 맞는 에러 메시지를 선택하도록 개선해야 합니다.',
    concept: [
      '판별 유니온(Discriminated Union)인 `Result<T, E>`는 ok 속성을 기준으로 성공했을 때의 value와 실패했을 때의 error를 명확히 분리합니다. 호출자는 ok 값을 확인한 후에만 내부 속성에 접근할 수 있어 에러 처리를 누락하기 어렵습니다.',
      '예를 들어 `parseQuantity("3")`은 `{ ok: true, value: 3 }`을 반환하고, `parseQuantity("1.5")`는 `{ ok: false, error: "수량은 0 이상인 정수여야 합니다." }`를 반환합니다. 분기 처리 이후에는 value나 error 속성 중 하나만 안전하게 사용할 수 있습니다. 예외(Exception)는 복구하기 힘든 예상 밖의 시스템 에러를 위해서만 남겨두는 것이 좋습니다.',
    ],
    workedExample: {
      title: '완성 예시: 성공과 실패를 값으로 반환하기',
      code: 'type Result<T> =\n  | { ok: true; value: T }\n  | { ok: false; error: string };\n\nfunction parseId(raw: string): Result<string> {\n  return raw ? { ok: true, value: raw } : { ok: false, error: "ID가 없습니다." };\n}',
      result: ['ok가 true인 조건문 안에서는 value 속성에 안전하게 접근할 수 있습니다.', 'ok가 false인 조건문 안에서는 error 속성에 접근할 수 있습니다.']
    },
    mission: 'parseQuantity 함수가 빈 문자열·소수·음수 입력에는 실패 Result 객체를, 0 이상의 정수에는 성공 Result 객체를 반환하도록 구현해 보세요.',
    goals: ['성공과 실패의 필드를 판별 유니온을 활용해 타입 수준에서 분리한다.', '예상 가능한 입력 오류를 호출부에서 직접 제어할 수 있도록 값으로 반환한다.'],
    hints: ['Result 타입의 두 객체 구성원 모두에 ok 속성을 넣고, 서로 다른 boolean 리터럴 타입(true/false)을 지정하세요.', '입력값이 공백인 경우는 Number 함수로 형변환하기 전에 미리 걸러내야 합니다.', 'Number.isInteger() 함수와 0 이상인 조건을 함께 확인하세요.'],
    explanation: ['ok 속성으로 분기 처리를 하고 나면 value나 error 중 하나로 타입이 정확히 좁혀지므로 불필요한 타입 단언이 사라집니다.', 'Result 패턴을 적용한다고 해서 로깅이 필요한 심각한 시스템 에러까지 단순 문자열 실패로 덮어둘 필요는 없습니다.'],
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
    interview: {
      question: '사용자 입력 오류를 예외(Exception)로 던지지 않고 Result 패턴으로 반환하면 호출부의 책임은 어떻게 달라지나요?',
      answer: '호출부는 ok 값을 분기하여 성공 결과와 에러 메시지를 명시적으로 처리해야 하며, 이를 통해 단순 입력 오류와 예상 밖의 시스템 에러를 분리하여 대응할 수 있습니다.',
      points: ['판별 유니온을 통한 강제 분기 처리 유도', '예상된 실패와 시스템 에러의 명확한 분리']
    },
  }),
  make({
    id: 'ts16.async-awaited', chapter: 3, order: 16,
    title: 'Promise 성공값을 Awaited로 안전하게 추출하기', navTitle: 'Promise와 Awaited',
    summary: '비동기 주문 loader 함수의 반환 타입을 Awaited와 ReturnType으로 추출하여, 함수의 계약(Contract)이 변경되더라도 화면 상태 타입에 자동 반영되도록 구성합니다.',
    story: '주문 loader 함수의 반환 모델 스펙이 변경되었는데, 화면 측 상태 관리에 별도의 하드코딩된 타입을 사용하다 보니 과거의 필드를 계속 참조하는 문제가 발생했습니다. 비동기 함수의 실제 반환 시그니처에서 성공값 타입을 동적으로 추출하고, 오류 경계는 별도로 유지하는 것이 좋습니다.',
    concept: [
      '`Awaited<T>` 유틸리티 타입은 await 연산자가 처리한 후의 최종 성공값 타입을 계산하며, 중첩된 Promise까지 모두 풀어냅니다. `ReturnType`과 조합하면 loader 함수의 타입을 중복해서 정의할 필요가 없습니다.',
      '완성 예시인 `type LoaderValue = Awaited<ReturnType<typeof loadOrder>>`를 살펴보세요. loadOrder 함수가 `Promise<Order>`를 반환한다면, ReturnType이 Promise<Order>를 꺼내고 Awaited가 이를 풀어 최종적으로 Order 타입만 남깁니다. 단, 이 방식은 비동기 reject 사유를 타입으로 좁혀주지 않으므로 catch 블록에서는 여전히 unknown 에러를 직접 좁혀 사용해야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: Promise 내부의 값 타입 추출하기',
      code: 'async function loadName(): Promise<string> {\n  return "Wavy";\n}\n\ntype Name = Awaited<ReturnType<typeof loadName>>;',
      result: ['ReturnType은 loadName 함수의 반환 타입인 Promise<string>을 가져옵니다.', 'Awaited는 그 Promise를 풀어 Name 타입을 string으로 추론하게 만듭니다.']
    },
    mission: 'loader 함수에 동일한 원리를 적용해 보세요. LoaderValue 타입을 반환 시그니처에서 자동으로 계산하도록 수정하고, loadOrder 함수가 실제 주문 데이터를 비동기로 반환하게 변경하세요.',
    goals: ['Promise가 이행(resolve)한 값의 타입을 Awaited로 동적으로 계산한다.', '성공값의 타입과 reject 또는 catch 영역의 unknown 타입 경계를 명확히 구분한다.'],
    hints: ['먼저 `typeof loadOrder`를 사용해 함수의 타입을 가져오세요.', '그 다음 `ReturnType`으로 함수의 Promise 반환 타입을 추출합니다.', '마지막으로 추출된 타입을 `Awaited`로 감싸 최종 성공값 타입을 얻어내세요.'],
    explanation: ['이 패턴을 사용하면 loader 함수의 반환 타입이 바뀔 때 LoaderValue 타입도 동기화되어 타입 불일치를 원천 차단할 수 있습니다.', '주의할 점은 Awaited 유틸리티 타입이 런타임 오류를 검증해 주지는 않으며, 오직 컴파일 타임에 성공값 타입을 추론하기 위한 도구라는 점입니다.'],
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
    title: 'JSON 패치 요청에서 필드 생략과 null 구분하기', navTitle: 'JSON Patch 경계',
    summary: '주문 메모 수정을 요청할 때, 기존 메모를 유지하는 생략(undefined), 새롭게 변경하는 값(string), 메모를 지우는 삭제(null)를 명확히 구분하여 JSON 직렬화 결과를 확인해 봅니다.',
    story: '주문 수정 화면에서 메모를 전혀 건드리지 않았는데 note 속성에 undefined가 할당되면서 서버로 전송되어 메모 삭제 요청과 의미가 혼동되었습니다. 데이터 유지·변경·삭제 의도를 메모리 객체와 JSON 직렬화 양쪽에서 분명히 구분 짓는 변환 경계가 필요합니다.',
    concept: [
      '선택적 속성(Optional Property)은 해당 키 자체가 없을 수 있다는 의미입니다. exactOptionalPropertyTypes 컴파일러 옵션을 활성화하면 `note?: string | null` 속성에 명시적으로 undefined를 할당하는 실수를 막아주고, 키의 생략과 실제 값을 더 엄격히 구분할 수 있습니다.',
      '완성 예시인 `makeOrderPatch(undefined)`는 빈 객체 `{}`를 반환하여 note 키 자체를 만들지 않습니다. 반면 `makeOrderPatch("연락 요망")`은 `{ note: "연락 요망" }`을, `makeOrderPatch(null)`은 `{ note: null }`을 반환합니다. `JSON.stringify()`는 값이 undefined인 속성을 아예 제거하므로 삭제의 신호로 쓸 수 없습니다. 삭제를 원한다면 null 값을 사용하거나 API 스펙에 명시적인 연산을 정의해야 합니다.',
    ],
    workedExample: {
      title: '완성 예시: 데이터 유지와 삭제 의도 구분하기',
      code: 'type ProfilePatch = { bio?: string | null };\n\nconst keep: ProfilePatch = {};\nconst change: ProfilePatch = { bio: "새 소개" };\nconst remove: ProfilePatch = { bio: null };',
      result: ['bio 속성을 아예 생략하면 서버는 기존 값을 유지하라는 의미로 받아들일 수 있습니다.', '문자열은 데이터 변경, null은 삭제 요청으로 구분합니다. null은 JSON으로 직렬화한 후에도 데이터 구조에 남아있습니다.']
    },
    mission: 'undefined가 입력되면 note 키를 생략하고, 문자열과 null 값은 그대로 보존하는 makeOrderPatch 함수를 작성해 보세요. 세 가지 수정 의도가 JSON 포맷에서도 완벽히 구분된다면 성공입니다.',
    goals: ['Optional 키의 완전한 생략과 명시적으로 입력된 undefined 값을 구분한다.', 'null을 통한 삭제 신호가 JSON 직렬화 이후에도 제대로 유지되는지 확인한다.'],
    hints: ['OrderPatch 타입의 note 속성은 `string | null` 타입의 선택적 속성입니다.', '전달된 값이 undefined일 때는 note 키를 포함하지 않은 빈 객체를 반환하세요.', 'null 값이 들어오면 조건문에서 버리지 말고 note 속성에 그대로 할당하세요.'],
    explanation: ['Object.hasOwn() 메서드를 사용해 객체 내부에 note 키가 실제로 존재하는지 확인하고, JSON 문자열을 통해 null 값이 보존되는지도 교차 검증해 볼 수 있습니다.', 'Partial과 같은 유틸리티 타입은 타입 허용 범위를 조작할 뿐 직렬화 정책까지 해결해 주지는 않습니다. 따라서 별도의 변환 함수와 런타임 테스트가 반드시 동반되어야 합니다.'],
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
    interview: {
      question: 'note 속성에 undefined가 할당된 객체를 JSON API 통신 시 "필드 생략" 외의 다른 신호로 사용할 수 없는 이유는 무엇인가요?',
      answer: '자바스크립트 객체를 JSON.stringify()로 직렬화하면 값이 undefined인 속성은 문자열에서 완전히 제거되기 때문에, 애초에 키를 만들지 않은 경우와 구분이 불가능해지기 때문입니다.',
      points: ['메모리 객체 상태와 JSON 직렬화 표현의 근본적인 차이점 이해', '데이터 삭제 시 null 값이나 명시적인 상태 변경 연산을 활용해야 하는 이유']
    },
  }),
];