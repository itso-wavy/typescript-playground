import type { Lesson } from '../../shared/contracts.js';

const checkedAt = '2026-09-11';
const compilerVersion = '7.0.2';

const inference = { title: 'TypeScript Handbook: Type Inference', url: 'https://www.typescriptlang.org/docs/handbook/type-inference.html' };
const literalTypes = { title: 'TypeScript Handbook: Literal Types', url: 'https://www.typescriptlang.org/docs/handbook/literal-types.html' };
const satisfiesOperator = { title: 'TypeScript 4.9: The satisfies Operator', url: 'https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator' };
const objectTypes = { title: 'TypeScript Handbook: Object Types', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html' };
const everydayTypes = { title: 'TypeScript Handbook: Everyday Types', url: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html' };
const narrowing = { title: 'TypeScript Handbook: Narrowing', url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html' };

type LessonDraft = Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision'>;

function lesson(data: LessonDraft): Lesson {
  return { ...data, kind: 'practice', checkedAt, compilerVersion, revision: 1 };
}

export const lessons: Lesson[] = [
  lesson({
    id: 'ts01.inference-literals', chapter: 1, order: 1, title: '타입 추론과 리터럴 타입', navTitle: '추론과 리터럴',
    summary: '설정 객체에 허용된 값만 입력하고, 각 속성의 정확한 값도 타입에 남기는 방법을 배웁니다.',
    story: '배포 환경에는 "development"와 "production"만 사용할 수 있어야 합니다. 하지만 현재 코드는 임의의 문자열을 허용하여 preview에 "staging"을 입력해도 오류가 발생하지 않습니다. 먼저 기능 플래그 예제로 `as const`와 `satisfies`의 역할을 살펴본 뒤, 동일한 방식으로 배포 설정 객체를 올바르게 개선해 봅니다.',
    concept: [
      'const channel = "stable"처럼 선언하면 변수의 타입은 "stable"로 고정됩니다. 그러나 객체 속성은 값이 변경될 수 있으므로 기본적으로 일반 string 타입으로 추론됩니다. 객체 리터럴 뒤에 `as const`를 붙이면 각 속성이 정확한 리터럴 타입으로 유지되며 수정할 수 없게 됩니다.',
      '`as const`만으로는 값이 특정 타입 규칙을 만족하는지 검증할 수 없습니다. 이때 `satisfies` 연산자를 사용하면 객체의 실제 값을 지정한 타입과 대조해 검사하면서도, 각 속성이 지닌 고유의 구체적인 타입을 그대로 보존할 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: 기능 플래그 값 제한하기',
      code: 'type FeatureState = "on" | "off";\n\nconst featureFlags = {\n  checkout: "on",\n  search: "off",\n} as const satisfies Record<"checkout" | "search", FeatureState>;',
      result: [
        'as const 단언을 통해 checkout 속성이 일반 string이 아니라 "on" 리터럴 타입으로 유지되며 값 변경이 차단됩니다.',
        'satisfies 연산자는 각 속성값이 FeatureState 범위 내에 있는지 검사합니다. "enabled" 같은 허용되지 않은 값을 넣으면 타입 오류가 발생합니다.',
        '객체에 Record 타입을 직접 지정하면 값 검사는 가능하지만 checkout 속성의 타입이 FeatureState로 넓어져 구체적인 리터럴 타입이 사라집니다.',
      ],
    },
    mission: 'environments 객체를 수정해 보세요. preview의 "staging"을 "development"로 바꾸고, app과 preview에 Environment 타입이 허용하는 값만 들어가도록 제한하세요. 완성 후 app의 타입은 "production", preview의 타입은 "development" 리터럴 타입으로 유지되어야 합니다.',
    goals: ['const와 let에서의 타입 추론 차이 확인하기', 'as const를 이용해 읽기 전용 리터럴 타입 구성하기', 'satisfies로 설정 객체의 값 유효성 검사하기'],
    hints: ['기능 플래그 완성 예제와 environments 객체의 구조를 비교해 보세요.', 'Environment 타입이 허용하는 값은 "development"와 "production"입니다.', '객체 뒤에 as const를 붙여 리터럴 타입을 보존한 뒤 satisfies 연산자로 키와 값을 검증하세요.'],
    explanation: ['environments.app의 타입은 넓은 string이 아니라 "production"으로 추론되며, preview 역시 "development" 리터럴 타입으로 유지됩니다.', 'satisfies는 소스 코드에 작성된 객체를 정적으로 검사합니다. 외부 환경 변수나 API 응답으로 들어오는 값은 런타임에 별도로 검증해야 합니다.'],
    starter: { 'index.ts': 'export type Environment = "development" | "production";\nexport const environments: Record<string, string> = {\n  app: "production",\n  preview: "staging",\n};\n' },
    solution: { 'index.ts': 'export type Environment = "development" | "production";\nexport const environments = {\n  app: "production",\n  preview: "development",\n} as const satisfies Record<"app" | "preview", Environment>;\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [inference, literalTypes, satisfiesOperator], minutes: 6,
  }),
  lesson({
    id: 'ts02.tuple-readonly', chapter: 1, order: 2, title: '튜플과 readonly로 페이지 커서 고정하기', navTitle: '튜플과 readonly',
    summary: '페이지 번호와 다음 커서처럼 순서와 의미가 정해진 데이터를 다룹니다. readonly 튜플을 사용하여 원소의 타입, 순서, 길이를 고정합니다.',
    story: '페이지네이션 API는 현재 페이지 번호와 다음 커서를 한 쌍으로 반환합니다. 이를 일반 배열로 다루면 첫 번째 칸에 잘못된 문자열이 들어가거나 임의로 세 번째 값이 추가되는 실수를 막기 어렵습니다. 이번 레슨에서는 PageCursor 타입을 활용해 두 칸의 위치와 각 원소의 타입을 엄격하게 고정합니다.',
    concept: [
      '일반 배열은 동일한 타입의 값이 여러 개 올 때 사용합니다. 반면 튜플 타입은 각 인덱스 위치의 데이터 타입과 전체 길이를 정확히 정의합니다. readonly 키워드는 읽기 전용 수식어로, 원소 값의 재할당과 push 등의 변경 메서드 호출을 방지합니다.',
      'PageCursor 타입에 readonly [number, string | null]을 지정하면 첫 번째 원소는 페이지 번호, 두 번째 원소는 다음 커서라는 구조가 타입 시스템에 명확히 드러납니다. 일반 배열(number | string | null)[] 형태로는 이러한 위치와 길이의 제약을 보장할 수 없습니다.',
    ],
    workedExample: {
      title: '완성 예시: 페이지 커서 고정하기',
      code: 'type Cursor = readonly [page: number, nextCursor: string | null];\n\nconst cursor: Cursor = [1, "next-2"];\nconst nextPage = cursor[0] + 1;\n\n// cursor[0] = 2; // 오류: readonly 튜플은 요소를 수정할 수 없습니다.',
      result: [
        'cursor 변수의 첫 번째 원소는 number, 두 번째 원소는 string | null 타입으로 안전하게 관리됩니다.',
        'cursor[0]에 1을 더해 다음 페이지 번호인 2를 계산할 수 있습니다. readonly는 읽기 동작은 허용하되 원소 변경만 막습니다.',
        '지정된 규격과 다른 길이나 순서의 데이터를 대입하면 튜플 타입 불일치로 컴파일 오류가 발생합니다.',
      ],
    },
    mission: 'PageCursor 타입을 읽기 전용 두 칸 튜플로 수정하세요. nextPage 함수는 이 readonly 입력을 받아 처리해야 합니다. 반환값이 다음 페이지 번호와 새 커서를 담은 올바른 튜플 형태이면 완료됩니다.',
    goals: ['일반 배열과 위치가 고정된 튜플 타입의 차이 이해하기', 'readonly 튜플을 통해 API 반환값의 무결성 유지하기'],
    hints: ['PageCursor 타입의 첫 번째 요소에는 page 역할을 하는 number 타입이 들어갑니다.', '두 번째 요소에는 nextCursor 역할을 하는 string | null 타입이 들어갑니다.', 'nextPage 함수의 반환 타입 역시 PageCursor 타입이어야 합니다.'],
    explanation: ['nextPage 함수에 [1, null]과 "cursor-2"를 전달하면 결과로 [2, "cursor-2"]가 반환되며 각 원소의 타입도 안전하게 유지됩니다.', 'readonly 키워드는 튜플 내부의 중첩 객체까지 재귀적으로 불변으로 만들지는 않으며, 이 예제에서는 튜플 원소의 대입과 추가를 막는 용도로 사용됩니다.'],
    starter: { 'index.ts': 'export type PageCursor = (number | string | null)[];\nexport function nextPage(cursor: PageCursor, nextCursor: string | null): PageCursor {\n  cursor.push(nextCursor);\n  return cursor;\n}\n' },
    solution: { 'index.ts': 'export type PageCursor = readonly [page: number, nextCursor: string | null];\nexport function nextPage(cursor: PageCursor, nextCursor: string | null): PageCursor {\n  return [cursor[0] + 1, nextCursor];\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [objectTypes], minutes: 6,
  }),
  lesson({
    id: 'ts03.top-bottom-types', chapter: 1, order: 3, title: 'any·unknown·void·never 구분하기', navTitle: 'any·unknown·void·never',
    summary: 'JSON 파싱 결과와 함수의 종료 방식을 구분합니다. 상황에 알맞은 any, unknown, void, never 타입을 각각 적용합니다.',
    story: '주문 명령을 JSON 문자열로부터 읽어옵니다. 이때 파싱 결과의 type 속성을 검증 없이 곧바로 사용하면 잘못된 형식의 입력을 놓치기 쉽습니다. 또한 로그만 출력하는 함수와 예외를 던지는 함수는 종료 방식이 다릅니다. 이번 레슨에서는 외부 입력값과 함수 반환 타입을 실제 실행 흐름에 맞게 바로잡습니다.',
    concept: [
      'any 타입은 타입 검사를 전면 우회합니다. 반면 unknown 타입은 값을 구체적으로 확인하기 전까지 속성 접근이나 연산을 엄격히 제한합니다. void는 반환값을 사용하지 않는 함수의 반환 타입이며, never는 정상적으로 반환되지 않는(예: 에러를 던지는) 코드의 반환 타입입니다.',
      'parseJson 함수의 결과는 unknown으로 지정하고, 로깅 함수인 report는 void를 반환하며, 예외를 던지는 assertNever 함수는 never를 반환하도록 구성합니다. 이후 switch 문의 모든 분기를 빠짐없이 처리했는지 assertNever로 컴파일 단계에서 확인합니다.',
    ],
    workedExample: {
      title: '완성 예시: 반환 방식에 맞는 타입 쓰기',
      code: 'function report(message: string): void {\n  console.log(message);\n}\n\nfunction fail(message: string): never {\n  throw new Error(message);\n}\n\nreport("저장 완료"); // 반환값을 사용하지 않습니다.\n// fail("저장 실패"); // 호출 시 예외를 발생시킵니다.',
      result: [
        'report 함수는 로그를 남기고 호출자에게 반환하는 값이 없으므로 반환 타입이 void입니다.',
        'fail 함수는 예외를 던져 정상 종료되지 않으므로 반환 타입이 never입니다.',
        'unknown은 함수의 종료 방식을 나타내는 것이 아니라, 사용 전 검증이 필요한 안전한 입력값 타입입니다.',
      ],
    },
    mission: 'parseJson 함수의 반환 타입을 unknown으로 수정하고, report 함수에는 void, assertNever 함수에는 never 반환 타입을 지정하세요. describeAction 함수가 "save"와 "cancel" 명령을 모두 처리하도록 완성하세요.',
    goals: ['any 타입과 unknown 타입의 검사 범위 비교하기', 'void 타입과 never 타입을 함수의 실제 종료 방식에 맞게 활용하기'],
    hints: ['parseJson의 결과는 사용하기 전에 타입 확인 과정을 거쳐야 합니다.', 'report 함수는 메시지를 출력하고 별도의 값을 반환하지 않습니다.', 'describeAction의 default 분기에서 action 매개변수가 never 타입으로 좁혀지는지 확인하세요.'],
    explanation: ['parseJson의 결과는 unknown 타입이므로 호출부는 속성을 읽기 전 반드시 실제 값을 검증해야 합니다. describeAction 함수는 OrderAction 타입의 모든 명령을 누락 없이 처리합니다.', 'void 함수는 호출자에게 유효한 값을 주지 않으며, never 함수는 호출자에게 정상적으로 제어권을 돌려주지 않습니다.'],
    starter: { 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport function parseJson(text: string): any { return JSON.parse(text); }\nexport function report(message: string) { console.log(message); }\nexport function assertNever(value: unknown) { throw new Error("처리하지 않은 명령: " + String(value)); }\nexport function describeAction(action: OrderAction): string {\n  switch (action.type) {\n    case "save": return "주문 저장";\n    default: return "알 수 없는 명령";\n  }\n}\n' },
    solution: { 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport function parseJson(text: string): unknown { return JSON.parse(text) as unknown; }\nexport function report(message: string): void { console.log(message); }\nexport function assertNever(value: never): never { throw new Error("처리하지 않은 명령: " + String(value)); }\nexport function describeAction(action: OrderAction): string {\n  switch (action.type) {\n    case "save": return "주문 저장";\n    case "cancel": return "주문 취소";\n    default: return assertNever(action);\n  }\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [everydayTypes, narrowing], minutes: 7,
  }),
  lesson({
    id: 'ts04.models-alias-interface', chapter: 1, order: 4, title: '타입 별칭과 인터페이스로 주문 모델 나누기', navTitle: '별칭과 인터페이스',
    summary: '주문 상태와 주문 객체를 각 특성에 맞는 방식으로 선언합니다. 타입 별칭은 값의 목록(유니온)에, 인터페이스는 확장이 필요한 객체 구조에 사용합니다.',
    story: '주문 화면과 수정 API가 공통의 주문 데이터를 다룹니다. status 속성에는 "draft"와 "confirmed" 값만 지정할 수 있어야 합니다. 또한 Order 타입은 공통 id 속성을 지닌 Entity 타입을 상속(확장)받아야 합니다. 이번 레슨에서는 데이터의 성격에 따라 올바른 타입 선언 방식을 선택합니다.',
    concept: [
      '타입 별칭은 OrderStatus처럼 문자열 유니온이나 복합 타입을 정의할 때 유용합니다. 반면 인터페이스는 객체의 속성 구조를 정의할 때 적합하며, extends 키워드를 통해 Entity 인터페이스의 속성을 Order 인터페이스에 간편하게 상속할 수 있습니다.',
      '값의 고정된 목록은 타입 별칭으로 표현하고, 확장 가능한 객체 구조는 인터페이스로 선언합니다. 이를 통해 잘못된 status 값 할당을 방지하고, Order 객체를 공통 id가 요구되는 곳에 안전하게 전달할 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: 값 목록과 객체 구조 나누기',
      code: 'type Role = "user" | "admin";\n\ninterface User {\n  id: string;\n}\n\ninterface Admin extends User {\n  role: "admin";\n}\n\nconst admin: Admin = { id: "u1", role: "admin" };',
      result: [
        'Role 타입은 허용된 문자열 집합을 나타내므로 타입 별칭이 가장 알맞습니다.',
        'Admin 인터페이스는 User 인터페이스의 id 속성을 물려받아 id와 role 속성을 모두 요구합니다.',
        'admin 객체는 Admin 타입이면서 User가 요구하는 id 속성도 포함하므로 User를 받는 코드와 호환됩니다.',
      ],
    },
    mission: 'OrderStatus 타입을 "draft" | "confirmed" 유니온으로 정의하세요. Order 인터페이스는 Entity 인터페이스를 확장해야 하며, OrderUpdate 타입의 quantity와 status 속성은 선택(optional) 항목으로 지정하세요.',
    goals: ['문자열 유니온 정의에 타입 별칭 활용하기', '공통 객체 속성을 인터페이스 상속으로 구현하기'],
    hints: ['OrderStatus 타입에는 두 가지 허용 문자열만 포함되어야 합니다.', 'Order 인터페이스의 extends 대상을 확인하세요.', 'OrderUpdate 타입은 orderId 외의 필드를 선택 사항으로 받습니다.'],
    explanation: ['Order 타입은 id, itemName, quantity, status 속성을 지닙니다. OrderUpdate 타입에는 수정 API에 필요한 항목들만 선택적으로 포함됩니다.', '타입 별칭과 인터페이스 모두 객체를 표현할 수 있으나, 이 코드에서는 제한된 값 목록에 타입 별칭을, 객체 확장에는 인터페이스를 사용합니다.'],
    starter: { 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = string;\nexport type Order = { itemName: string; quantity: number; status: string };\nexport interface OrderUpdate { orderId: string; quantity: number; status: string }\n' },
    solution: { 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = "draft" | "confirmed";\nexport interface Order extends Entity { itemName: string; quantity: number; status: OrderStatus }\nexport type OrderUpdate = { orderId: string; quantity?: number; status?: OrderStatus };\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [objectTypes, everydayTypes], minutes: 6,
  }),
  lesson({
    id: 'ts05.unions-narrowing', chapter: 1, order: 5, title: '유니온 좁히기로 결제 결과 표시하기', navTitle: '유니온 좁히기',
    summary: '카드 결제, 계좌 이체, 진행 중 상태 문자열을 하나의 함수에서 처리합니다. typeof 연산자와 판별자 속성을 이용해 타입을 좁힌 뒤 필요한 속성에 접근합니다.',
    story: '결제 화면에는 카드 결제 결과와 계좌 이체 결과, 혹은 처리 중 상태를 나타내는 문자열이 유니온으로 들어옵니다. 모든 경우에 무조건 last4 속성을 읽으려 하면 계좌 이체 데이터일 때 UI 오류가 발생합니다. receipt 함수가 현재 값의 종류를 정확히 판별하여 알맞은 문자열을 반환하도록 수정합니다.',
    concept: [
      '유니온 타입은 여러 타입 중 하나가 될 수 있는 가능성을 나타냅니다. typeof 연산자나 판별자(Discriminant) 속성을 비교하면 TypeScript가 런타임 분기에 맞춰 해당 블록의 타입을 정밀하게 좁혀줍니다.',
      '먼저 value가 string인지 확인하고, 객체만 남은 상황에서 kind 속성을 비교해 카드 결제인지 계좌 이체인지 판별합니다. 이를 통해 각 타입에만 존재하는 속성(last4나 bank)에 안전하게 접근할 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: 결제 결과 좁히기',
      code: 'type Result = string | { kind: "card"; last4: string };\n\nfunction label(result: Result): string {\n  if (typeof result === "string") return result;\n  if (result.kind === "card") return "카드 끝자리 " + result.last4;\n  return "결제 결과 없음";\n}',
      result: [
        'typeof result === "string" 검사를 통과한 분기에서는 result가 문자열이므로 그대로 반환할 수 있습니다.',
        '이후 분기에서는 객체만 남고 kind 속성 검사를 통해 카드 결제 객체임이 보장되므로 last4 속성을 안전하게 읽습니다.',
        '유니온 구성원 간에 공통되지 않은 속성을 검증 없이 접근하면 타입 오류가 발생하므로 반드시 타입을 좁혀야 합니다.',
      ],
    },
    mission: 'PaymentResponse 타입에 Payment 유니온과 requestId 속성을 교차 타입(&)으로 결합하세요. receipt 함수에서 문자열을 그대로 반환하고, kind가 "card"이면 last4를, "bank"이면 bank 속성을 사용해 문구를 완성하세요.',
    goals: ['유니온 타입과 교차 타입을 조합하여 결제 응답 모델 표현하기', 'typeof와 판별자 속성으로 현재 값의 타입 좁히기'],
    hints: ['PaymentResponse 타입에는 Payment와 { requestId: string }의 결합이 필요합니다.', 'receipt 함수의 시작부에서 value가 string인지 먼저 판별하세요.', '객체 분기에서는 kind 속성값을 확인하여 각 결제 수단별로 처리하세요.'],
    explanation: ['receipt 함수는 문자열, 카드 결제 객체, 계좌 이체 객체를 각각 올바르게 분기 처리합니다. last4와 bank 속성은 각 분기 내에서만 안전하게 읽힙니다.', 'in 연산자 등을 활용해서도 속성 존재 여부로 타입을 좁힐 수 있으며, 본 예제에서는 kind 판별자 속성을 활용합니다.'],
    starter: { 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = Payment;\nexport function receipt(value: PaymentResponse | string): string {\n  return "카드 " + value.last4;\n}\n' },
    solution: { 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = Payment & { requestId: string };\nexport function receipt(value: PaymentResponse | string): string {\n  if (typeof value === "string") return value;\n  if (value.kind === "card") return "카드 끝자리 " + value.last4;\n  return "계좌 이체 " + value.bank;\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [narrowing, objectTypes], minutes: 7,
  }),
  lesson({
    id: 'ts06.structural-typing', chapter: 1, order: 6, title: '구조적 타이핑과 초과 속성 검사 구분하기', navTitle: '구조적 타이핑',
    summary: '기존 이벤트 객체가 지닌 추가 속성은 그대로 유지하고, 새 객체 리터럴 작성 시 발생하는 키 오타는 초과 속성 검사를 통해 찾아냅니다.',
    story: '감사 로그를 처리하는 log 함수는 id와 action 속성만 사용합니다. 하지만 이미 저장된 이벤트 객체에는 createdAt이나 actor 같은 추가 속성이 함께 포함되어 있습니다. 이러한 추가 속성은 굳이 제거할 필요가 없습니다. 반면 새로 작성한 객체의 actoin 속성은 action의 오타입니다. 두 상황을 구분하여 로그 호출 코드를 바로잡습니다.',
    concept: [
      '구조적 타이핑(Structural Typing)은 객체가 요구되는 최소한의 속성을 갖추었는지 확인합니다. savedEvent처럼 id와 action을 포함하는 객체는 더 많은 속성을 가지고 있어도 Audit 타입을 받는 log 함수에 안전하게 전달될 수 있습니다. 단, 객체 리터럴을 함수에 직접 전달할 때는 초과 속성 검사가 추가로 동작합니다.',
      '완성 예시에서 savedEvent는 추가 속성이 있음에도 문제없이 전달되며, 객체 리터럴 내의 오타(actoin)는 컴파일러의 초과 속성 검사에 의해 오류로 감지됩니다.',
    ],
    workedExample: {
      title: '완성 예시: 추가 속성과 키 오타 구분하기',
      code: 'type Audit = { id: string; action: string };\n\nfunction log(event: Audit): string {\n  return event.action;\n}\n\nconst event = { id: "e1", action: "save", createdAt: 1700000000 };\nlog(event);\nlog({ id: "e2", action: "cancel" });',
      result: [
        'event 변수는 Audit 타입이 요구하는 id와 action 속성을 만족하므로 createdAt 속성이 더 있어도 log 함수에 전달 가능합니다.',
        '새 객체 리터럴 역시 올바른 action 속성명을 사용하면 요구 구조를 충족합니다.',
        '초과 속성 검사는 코드에 직접 작성한 객체 리터럴의 오타를 잡는 정적 검사 도구이며, 외부에서 수신한 동적 데이터의 무결성까지 보장하지는 않습니다.',
      ],
    },
    mission: 'savedEvent 객체의 추가 속성은 유지하되, 새 객체 리터럴에 있는 actoin 속성 오타를 action으로 수정하세요. savedAction과 newAction 변수가 모두 정상적으로 문자열 결과를 반환하면 완료입니다.',
    goals: ['필요한 속성을 포함한 기존 객체를 함수에 안전하게 전달하기', '객체 리터럴 작성 시 발생하는 키 오타 감지하기'],
    hints: ['Audit 타입이 실제로 요구하는 속성은 id와 action입니다.', 'savedEvent의 추가 필드들은 log 함수 호출을 방해하지 않습니다.', '새 객체 리터럴의 키 이름을 Audit 선언부와 대조해 보세요.'],
    explanation: ['savedEvent는 추가 필드가 존재하지만 필수 속성을 갖추고 있어 log 함수에 전달할 수 있습니다. 객체 리터럴의 오타는 컴파일러가 사전에 잡아냅니다.', '초과 속성 검사는 런타임 데이터 검증을 대체하지 않으므로 외부 입력은 별도의 검증 과정을 거쳐야 합니다.'],
    starter: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit): string { return event.action; }\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", actoin: "cancel" });\n' },
    solution: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit): string { return event.action; }\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", action: "cancel" });\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [objectTypes], minutes: 6,
    interview: {
      question: '초과 속성 검사를 통과한 Audit 타입 객체가 API 응답 등 외부 데이터에서도 안전하다고 보장할 수 있을까요?',
      answer: '보장할 수 없습니다. 초과 속성 검사는 작성 시점의 객체 리터럴 오타를 잡기 위한 정적 검사이며, 구조적 타이핑은 필드의 호환성만 확인합니다. 실행 중에 들어오는 외부 API 데이터는 unknown 타입으로 받은 뒤 별도의 런타임 검증을 거쳐야 합니다.',
      points: ['구조적 타입 호환성', '객체 리터럴 초과 속성 검사의 한계', '외부 입력에 대한 런타임 검증 필요성'],
    },
  }),
];