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
    story: '배포 환경에는 "development"와 "production"만 사용할 수 있어야 합니다. 그런데 지금 코드는 어떤 문자열이든 허용합니다. preview에 "staging"을 적어도 오류가 나지 않습니다. 먼저 기능 플래그 예제로 as const와 satisfies가 하는 일을 살펴봅니다. 그런 다음 같은 방법으로 배포 설정을 고쳐 봅니다.',
    concept: [
      'const channel = "stable"처럼 작성하면 channel 변수의 타입은 "stable"입니다. 하지만 객체의 속성은 나중에 바뀔 수 있어서 보통 string 타입으로 추론됩니다. 객체 뒤에 as const를 붙이면 각 속성의 타입도 "stable"처럼 정확한 값으로 남고, 속성을 바꿀 수 없게 됩니다.',
      'as const만 붙여서는 그 값이 허용된 값인지 알 수 없습니다. 이 검사가 필요할 때 satisfies를 사용합니다. satisfies는 객체의 값을 검사하면서도 각 속성의 정확한 타입을 그대로 남깁니다. Record<K, V>에서 K는 허용할 키의 타입이고 V는 각 키에 들어갈 값의 타입입니다.',
    ],
    workedExample: {
      title: '완성 예시: 기능 플래그 값 제한하기',
      code: 'type FeatureState = "on" | "off";\n\nconst featureFlags = {\n  checkout: "on",\n  search: "off",\n} as const satisfies Record<"checkout" | "search", FeatureState>;',
      result: [
        'as const 단언을 사용하면 checkout 속성이 string이 아니라 "on" 리터럴 타입으로 유지되고, 속성도 바꿀 수 없게 됩니다.',
        'satisfies 연산자는 각 속성값이 FeatureState에 포함되는지 확인합니다. 예를 들어 "enabled"를 입력하면 타입 오류가 납니다.',
        '객체에 Record 타입을 직접 붙여도 값은 검사할 수 있습니다. 다만 checkout 속성의 타입이 "on"이 아니라 FeatureState로 넓어집니다. as FeatureState처럼 타입을 단언하면 잘못된 값도 통과할 수 있습니다.',
      ],
    },
    mission: '이제 environments 객체를 고쳐 보세요. preview의 "staging"을 "development"로 바꾸고, app과 preview에 Environment가 허용한 값만 들어가게 만드세요. 완성한 뒤 app의 타입은 "production", preview의 타입은 "development"로 남아야 합니다.',
    goals: ['const와 let에서 타입이 어떻게 다르게 추론되는지 확인하기', 'as const로 읽기 전용 리터럴 타입 만들기', 'satisfies로 설정 객체의 값 검사하기'],
    hints: ['기능 플래그 완성 예제와 environments 객체의 구조를 나란히 비교해 보세요.', 'Environment 타입에서 허용하는 값은 "development"와 "production"입니다.', '객체 뒤에 as const 단언을 붙여 리터럴 타입을 유지한 다음, satisfies 연산자로 키와 값을 확인하세요.'],
    explanation: ['environments.app의 타입은 넓은 string이 아니라 "production"입니다. preview도 "development" 리터럴 타입으로 유지됩니다.', 'satisfies는 코드에 직접 작성한 객체를 검사합니다. 환경 변수나 API에서 받은 값은 실행 중에 별도로 검증해야 합니다.'],
    starter: { 'index.ts': 'export type Environment = "development" | "production";\nexport const environments: Record<string, string> = {\n  app: "production",\n  preview: "staging",\n};\n' },
    solution: { 'index.ts': 'export type Environment = "development" | "production";\nexport const environments = {\n  app: "production",\n  preview: "development",\n} as const satisfies Record<"app" | "preview", Environment>;\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [inference, literalTypes, satisfiesOperator], minutes: 6,
  }),
  lesson({
    id: 'ts02.tuple-readonly', chapter: 1, order: 2, title: '튜플과 readonly로 페이지 커서 고정하기', navTitle: '튜플과 readonly',
    summary: '페이지 번호와 다음 커서처럼 위치가 정해진 값을 다룹니다. readonly 튜플을 사용해 원소의 순서와 개수를 고정합니다.',
    story: '페이지 API는 현재 페이지 번호와 다음 커서를 한 쌍으로 반환합니다. 일반 배열로 선언하면 첫 번째 칸에 문자열을 넣을 수 있습니다. 세 번째 값을 추가하는 실수도 막지 못합니다. 이번 레슨에서는 PageCursor 타입으로 두 칸의 위치와 값 타입을 고정합니다.',
    concept: [
      '배열은 같은 종류의 값을 여러 개 다룰 때 사용합니다. 튜플 타입은 각 위치의 값 타입과 전체 길이를 정합니다. readonly 키워드는 읽기 전용 수식어라서 원소 대입과 push 메서드 호출을 막습니다.',
      'PageCursor 타입처럼 readonly [page: number, nextCursor: string | null]을 쓰면 첫 번째 원소는 페이지 번호이고 두 번째 원소는 다음 커서라는 뜻이 타입에 드러납니다. page와 nextCursor는 타입의 원소 라벨이라서 문서와 오류 메시지를 돕지만, 실행 중 값이나 객체 키를 만들지는 않습니다. 일반 (number | string | null)[] 배열에서는 위치와 길이를 보장할 수 없습니다.',
    ],
    workedExample: {
      title: '완성 예시: 페이지 커서 고정하기',
      code: 'type Cursor = readonly [page: number, nextCursor: string | null];\n\nconst cursor: Cursor = [1, "next-2"];\nconst nextPage = cursor[0] + 1;\n\n// cursor[0] = 2; // 오류: readonly 튜플은 수정할 수 없습니다. ',
      result: [
        'cursor 변수의 첫 번째 원소는 number 타입이고 두 번째 원소는 string | null 타입입니다.',
        'cursor[0]을 1 더하면 다음 페이지 번호인 2가 됩니다. readonly는 읽기를 막지 않고 원소 변경만 막습니다.',
        '두 칸이 아닌 값을 넣거나 원소 순서를 바꾸면 튜플 타입과 맞지 않아 오류가 납니다.',
      ],
    },
    mission: 'PageCursor 타입을 읽기 전용 두 칸 튜플로 수정하세요. nextPage 함수는 readonly 입력을 받아야 합니다. 반환값이 다음 페이지 번호와 새 커서를 담으면 완료입니다.',
    goals: ['일반 배열과 위치가 정해진 튜플 타입 구분하기', 'readonly 튜플로 API 결과의 원소 변경 막기'],
    hints: ['PageCursor 타입의 첫 번째 칸은 page 라벨이 붙은 number 타입입니다. page는 실행 중 값이 아니라 원소의 의미를 설명하는 라벨입니다.', '두 번째 칸은 nextCursor 라벨이 붙은 string | null 타입입니다.', 'nextPage 함수의 반환 타입도 PageCursor 타입이어야 합니다.'],
    explanation: ['nextPage 함수에 [1, null] 값과 "cursor-2" 값을 전달합니다. 결과는 [2, "cursor-2"]입니다. 각 위치의 타입도 유지됩니다.', 'readonly 키워드는 튜플 안의 중첩 객체까지 불변으로 만들지 않습니다. 이 코드에서는 튜플 원소의 대입과 추가만 막습니다.'],
    starter: { 'index.ts': 'export type PageCursor = (number | string | null)[];\nexport function nextPage(cursor: PageCursor, nextCursor: string | null): PageCursor {\n  cursor.push(nextCursor);\n  return cursor;\n}\n' },
    solution: { 'index.ts': 'export type PageCursor = readonly [page: number, nextCursor: string | null];\nexport function nextPage(cursor: PageCursor, nextCursor: string | null): PageCursor {\n  return [cursor[0] + 1, nextCursor];\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [objectTypes], minutes: 6,
  }),
  lesson({
    id: 'ts03.top-bottom-types', chapter: 1, order: 3, title: 'any·unknown·void·never 구분하기', navTitle: 'any·unknown·void·never',
    summary: 'JSON 파싱 결과와 함수의 종료 방식을 구분합니다. any, unknown, void, never 타입을 각 코드 상황에 맞게 사용합니다.',
    story: '주문 명령을 JSON 문자열에서 읽습니다. 파싱 결과의 type 속성을 바로 사용하면 잘못된 입력을 놓칠 수 있습니다. 로그를 남기는 함수와 오류를 던지는 함수도 종료 방식이 다릅니다. 이번 레슨에서는 외부 값과 함수 반환 타입을 실제 동작에 맞게 구분합니다.',
    concept: [
      'any 타입은 타입 검사를 우회합니다. unknown 타입은 값을 확인하기 전까지 속성 사용을 막습니다. void 타입은 report 함수처럼 호출자가 반환값을 사용하지 않는 함수의 반환 타입입니다. never 타입은 assertNever 함수처럼 정상적으로 반환하지 않는 코드의 반환 타입입니다.',
      '완성 예시에서는 기존 코드의 any 값을 parseJson을 거쳐 unknown으로 바꿉니다. unknown 값은 가드 함수로 확인한 뒤에만 사용합니다. isSupportTicket의 value is SupportTicket은 타입 술어이며, true 분기에서 unknown 값을 SupportTicket으로 좁힙니다. report 함수는 void를 반환하고, assertNever 함수는 never를 반환합니다. switch 문의 모든 경우를 처리했는지도 assertNever로 확인합니다.',
    ],
    workedExample: {
      title: '완성 예시: 외부 티켓의 모든 경우 안전하게 처리하기',
      code: 'type SupportTicket =\n  | { kind: "open"; id: string }\n  | { kind: "closed"; id: string; closedAt: string };\n\nfunction parseJson(text: string): unknown {\n  return JSON.parse(text) as unknown;\n}\n\nfunction isSupportTicket(value: unknown): value is SupportTicket {\n  if (typeof value !== "object" || value === null) return false;\n  if (!("kind" in value) || !("id" in value) || typeof value.id !== "string") return false;\n\n  return value.kind === "open"\n    || (value.kind === "closed" && "closedAt" in value && typeof value.closedAt === "string");\n}\n\nfunction report(message: string): void {\n  console.log(message);\n}\n\nfunction assertNever(value: never): never {\n  throw new Error("처리하지 않은 티켓: " + JSON.stringify(value));\n}\n\nfunction describeTicket(ticket: SupportTicket): string {\n  switch (ticket.kind) {\n    case "open":\n      return "접수 " + ticket.id;\n    case "closed":\n      return "완료 " + ticket.id + " (" + ticket.closedAt + ")";\n    default:\n      return assertNever(ticket);\n  }\n}\n\nconst legacyJson: any = \'{"kind":"open","id":"t1"}\';\nconst parsed: unknown = parseJson(legacyJson);\nif (isSupportTicket(parsed)) report(describeTicket(parsed));',
      result: [
        'legacyJson의 any는 어떤 속성도 허용하지만, parseJson 결과를 unknown으로 받으면 isSupportTicket 가드를 통과하기 전에는 티켓 속성을 읽을 수 없습니다.',
        'isSupportTicket은 id와 kind를 검사하고, "closed" 티켓에는 closedAt 문자열도 검사합니다. report 함수는 로그만 남기고 호출자에게 값을 돌려주지 않으므로 반환 타입이 void입니다. switch 문은 kind 속성으로 ticket을 "open" 또는 "closed" 티켓으로 좁힙니다.',
        'default 분기에 도달하면 ticket은 never가 됩니다. 이후 새 티켓 종류를 유니온에 추가하고 분기를 빠뜨리면 assertNever 호출이 타입 오류를 보여 줍니다.',
      ],
    },
    mission: 'parseJson 함수의 반환 타입을 unknown 타입으로 수정하세요. report 함수에는 void 반환 타입을 지정하세요. assertNever 함수에는 never 반환 타입을 지정하세요. describeAction 함수가 "save"와 "cancel" 명령을 모두 처리하면 완료입니다.',
    goals: ['any 타입과 unknown 타입의 검사 범위 비교하기', 'void 타입과 never 타입을 함수의 실제 종료 방식에 맞게 사용하기'],
    hints: ['parseJson 함수의 결과는 사용 전에 확인해야 합니다.', 'report 함수는 메시지를 출력하고 값을 반환하지 않습니다.', 'describeAction 함수의 default 분기에서 action 매개변수가 never 타입인지 확인하세요.'],
    explanation: ['parseJson 함수의 결과는 unknown 타입입니다. 호출한 코드는 속성을 읽기 전에 실제 값을 확인해야 합니다. describeAction 함수는 OrderAction 타입의 두 명령을 모두 처리합니다.', 'void 타입 함수는 호출자에게 사용할 값을 주지 않습니다. never 타입 함수는 정상적으로 호출자에게 돌아오지 않습니다.'],
    starter: { 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport function parseJson(text: string): any { return JSON.parse(text); }\nexport function report(message: string) { console.log(message); }\nexport function assertNever(value: unknown) { throw new Error("처리하지 않은 명령: " + String(value)); }\nexport function describeAction(action: OrderAction): string {\n  switch (action.type) {\n    case "save": return "주문 저장";\n    default: return "알 수 없는 명령";\n  }\n}\n' },
    solution: { 'index.ts': 'export type OrderAction = { type: "save" } | { type: "cancel" };\nexport function parseJson(text: string): unknown { return JSON.parse(text) as unknown; }\nexport function report(message: string): void { console.log(message); }\nexport function assertNever(value: never): never { throw new Error("처리하지 않은 명령: " + String(value)); }\nexport function describeAction(action: OrderAction): string {\n  switch (action.type) {\n    case "save": return "주문 저장";\n    case "cancel": return "주문 취소";\n    default: return assertNever(action);\n  }\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [everydayTypes, narrowing], minutes: 7,
  }),
  lesson({
    id: 'ts04.models-alias-interface', chapter: 1, order: 4, title: '타입 별칭과 인터페이스로 주문 모델 나누기', navTitle: '별칭과 인터페이스',
    summary: '주문 상태와 주문 객체를 서로 다른 방식으로 선언합니다. 타입 별칭은 문자열 유니온에, 인터페이스는 확장할 객체에 사용합니다.',
    story: '주문 화면과 수정 API가 주문 데이터를 함께 사용합니다. status 속성에는 "draft"와 "confirmed" 값만 들어가야 합니다. Order 타입은 공통 id 속성을 가진 Entity 타입을 확장해야 합니다. 이번 레슨에서는 값 목록과 객체 구조에 맞는 선언 방식을 선택합니다.',
    concept: [
      '타입 별칭은 DeliveryStatus와 DeliveryRole처럼 문자열 유니온이나 조합된 타입에 이름을 붙일 때 사용합니다. 인터페이스는 객체의 속성을 선언할 때 사용합니다. extends 키워드를 사용하면 Entity 인터페이스의 속성을 Shipment 인터페이스에서 이어받을 수 있습니다.',
      'ShipmentUpdate의 status?: DeliveryStatus와 assignedRole?: DeliveryRole에서 물음표는 해당 속성을 생략할 수 있다는 뜻입니다. 속성을 제공하면 선언한 타입과 맞아야 합니다. 완성 예시에서는 값 목록을 타입 별칭으로, 확장할 Shipment와 부분 수정용 ShipmentUpdate를 인터페이스로 선언합니다.',
    ],
    workedExample: {
      title: '완성 예시: 배송 상태와 수정 모델 나누기',
      code: 'type DeliveryStatus = "ready" | "shipped";\ntype DeliveryRole = "warehouse" | "driver";\n\ninterface Entity {\n  id: string;\n}\n\ninterface Shipment extends Entity {\n  recipient: string;\n  status: DeliveryStatus;\n  assignedRole: DeliveryRole;\n}\n\ninterface ShipmentUpdate {\n  shipmentId: string;\n  status?: DeliveryStatus;\n  assignedRole?: DeliveryRole;\n}\n\nconst dispatchUpdate: ShipmentUpdate = {\n  shipmentId: "s1",\n  status: "shipped",\n};',
      result: [
        'DeliveryStatus와 DeliveryRole은 각각 status와 assignedRole 속성에 실제로 쓰이며, 허용된 문자열 목록만 표현하므로 타입 별칭이 알맞습니다.',
        'Shipment 인터페이스는 Entity의 id를 물려받아 공통 식별자를 포함합니다.',
        'dispatchUpdate는 ShipmentUpdate의 assignedRole을 생략했습니다. 선택 속성은 생략할 수 있지만, status를 제공했으므로 DeliveryStatus에 있는 "shipped"를 사용해야 합니다.',
      ],
    },
    mission: 'OrderStatus 타입을 "draft" | "confirmed" 유니온으로 수정하세요. Order 인터페이스는 Entity 인터페이스를 확장해야 합니다. OrderUpdate 타입의 quantity 속성과 status 속성은 선택 항목이어야 합니다.',
    goals: ['문자열 유니온에 타입 별칭 사용하기', '공통 객체 속성을 인터페이스로 확장하기'],
    hints: ['OrderStatus 타입에는 두 문자열 값만 들어갑니다.', 'Order 인터페이스의 extends 대상에서 공통 id 속성을 확인하세요.', 'OrderUpdate 타입은 orderId 속성만 필수로 받습니다.'],
    explanation: ['Order 타입에는 id, itemName, quantity, status 속성이 있습니다. OrderUpdate 타입에는 수정 API가 받는 속성만 있습니다.', '타입 별칭과 인터페이스는 모두 객체를 표현할 수 있습니다. 이 코드에서는 닫힌 문자열 목록에 타입 별칭을 사용합니다. 객체 확장에는 인터페이스를 사용합니다.'],
    starter: { 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = string;\nexport type Order = { itemName: string; quantity: number; status: string };\nexport interface OrderUpdate { orderId: string; quantity: number; status: string }\n' },
    solution: { 'index.ts': 'export interface Entity { id: string }\nexport type OrderStatus = "draft" | "confirmed";\nexport interface Order extends Entity { itemName: string; quantity: number; status: OrderStatus }\nexport interface OrderUpdate { orderId: string; quantity?: number; status?: OrderStatus }\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [objectTypes, everydayTypes], minutes: 6,
  }),
  lesson({
    id: 'ts05.unions-narrowing', chapter: 1, order: 5, title: '유니온 좁히기로 결제 결과 표시하기', navTitle: '유니온 좁히기',
    summary: '카드 결제, 계좌 이체, 처리 중 문자열을 한 함수에서 다룹니다. typeof 연산자와 kind 속성으로 값을 좁힌 뒤 필요한 속성을 읽습니다.',
    story: '결제 화면에는 카드 결과와 계좌 이체 결과가 들어옵니다. 처리 중에는 안내 문자열이 들어옵니다. 모든 결과에서 last4 속성을 읽으면 계좌 이체일 때 화면이 멈춥니다. receipt 함수가 현재 값의 종류를 확인한 뒤 알맞은 문구를 반환하도록 수정합니다.',
    concept: [
      '유니온 타입은 여러 타입 중 하나를 나타냅니다. 교차 타입은 여러 객체 조건을 함께 적용합니다. typeof 연산자와 판별자 속성 비교는 실행 중인 값을 확인하고, TypeScript는 확인 결과에 맞춰 해당 분기의 타입을 좁힙니다.',
      '완성 예시에서 먼저 shipmentLabel의 value 매개변수가 string 타입인지 확인합니다. 문자열이 아니면 ShipmentResponse 객체만 남고, method 속성으로 "courier"와 "pickup" 배송을 구분합니다. 각 분기에서는 그 배송 방식에만 있는 속성을 안전하게 읽을 수 있습니다.',
    ],
    workedExample: {
      title: '완성 예시: 배송 결과 좁히기',
      code: 'type Shipment =\n  | { method: "courier"; trackingNumber: string }\n  | { method: "pickup"; storeName: string };\n\ntype ShipmentResponse = Shipment & { requestId: string };\ntype ShipmentLabel = string | ShipmentResponse;\n\nfunction shipmentLabel(value: ShipmentLabel): string {\n  if (typeof value === "string") return value;\n\n  switch (value.method) {\n    case "courier":\n      return "택배 " + value.trackingNumber;\n    case "pickup":\n      return "매장 수령 " + value.storeName;\n  }\n}',
      result: [
        'typeof value === "string" 조건을 통과한 분기에서는 value가 문자열이므로 그대로 반환할 수 있습니다.',
        '"courier" 분기에서는 value가 택배 배송으로 좁혀져 trackingNumber를 읽고, "pickup" 분기에서는 매장 수령으로 좁혀져 storeName을 읽습니다.',
        'Shipment와 requestId를 교차 타입으로 묶은 ShipmentResponse의 두 객체 분기는 requestId를 함께 가집니다. 유니온의 각 구성원에 없는 속성은 먼저 값을 좁힌 뒤 읽어야 합니다.',
      ],
    },
    mission: 'PaymentResponse 타입에 Payment 타입과 requestId 속성을 함께 적용하세요. receipt 함수는 문자열을 그대로 반환해야 합니다. kind 속성 값이 "card"이면 last4 속성을 사용하세요. "bank"이면 bank 속성을 사용하세요.',
    goals: ['유니온 타입과 교차 타입으로 결제 응답 표현하기', 'typeof 연산자와 kind 속성으로 현재 값 좁히기'],
    hints: ['PaymentResponse 타입에는 Payment 타입과 { requestId: string } 타입이 모두 필요합니다.', 'receipt 함수에서 먼저 value 매개변수가 string 타입인지 확인하세요.', '객체 분기에서는 kind 속성 값과 "card" 문자열을 비교하세요.'],
    explanation: ['receipt 함수는 문자열, 카드 객체, 계좌 객체를 각각 처리합니다. last4 속성과 bank 속성은 해당 결제 분기에서만 읽습니다.', 'in 연산자도 속성 존재 여부로 타입을 좁힐 수 있습니다. 이 코드에는 kind 판별자 속성이 있으므로 "card"와 "bank" 값을 직접 비교합니다.'],
    starter: { 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = Payment;\nexport function receipt(value: PaymentResponse | string): string {\n  return "카드 " + value.last4;\n}\n' },
    solution: { 'index.ts': 'export type CardPayment = { kind: "card"; last4: string };\nexport type BankPayment = { kind: "bank"; bank: string };\nexport type Payment = CardPayment | BankPayment;\nexport type PaymentResponse = Payment & { requestId: string };\nexport function receipt(value: PaymentResponse | string): string {\n  if (typeof value === "string") return value;\n  if (value.kind === "card") return "카드 끝자리 " + value.last4;\n  return "계좌 이체 " + value.bank;\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [narrowing, objectTypes], minutes: 7,
  }),
  lesson({
    id: 'ts06.structural-typing', chapter: 1, order: 6, title: '구조적 타이핑과 초과 속성 검사 구분하기', navTitle: '구조적 타이핑',
    summary: '기존 이벤트 객체의 추가 속성은 유지합니다. 새 객체 리터럴의 속성 이름 오타는 초과 속성 검사로 찾습니다.',
    story: '감사 로그의 log 함수는 id 속성과 action 속성만 사용합니다. 저장된 이벤트에는 createdAt 속성과 actor 속성도 있습니다. 이 추가 속성은 지울 필요가 없습니다. 반면 새 객체의 actoin 속성은 action 속성의 오타입니다. 두 경우를 구분해 로그 호출을 수정합니다.',
    concept: [
      '구조적 타이핑은 객체에 필요한 속성이 있는지 확인합니다. 완성 예시의 savedArticle처럼 id와 title을 가진 객체는 ArticlePreview 타입을 받는 renderPreview 함수에 전달할 수 있습니다. 다른 속성이 더 있어도 괜찮습니다. 새 객체 리터럴을 바로 전달하면 초과 속성 검사도 실행됩니다.',
      '완성 예시에서 savedArticle은 추가 속성을 가진 채 renderPreview에 전달됩니다. 반면 직접 쓴 객체 리터럴의 titel은 ArticlePreview에 없는 이름이라 오류가 납니다. title로 고치면 필요한 구조를 갖추게 됩니다.',
    ],
    workedExample: {
      title: '완성 예시: 기사 미리보기의 추가 속성과 키 오타 구분하기',
      code: 'type ArticlePreview = { id: string; title: string };\n\nfunction renderPreview(article: ArticlePreview): string {\n  return article.title;\n}\n\nconst savedArticle = {\n  id: "a1",\n  title: "타입 안전성",\n  publishedAt: "2026-09-14",\n};\n\nrenderPreview(savedArticle);\n// renderPreview({ id: "a2", titel: "초안" }); // 오류: title의 오타\nrenderPreview({ id: "a2", title: "초안" });',
      result: [
        'savedArticle에는 ArticlePreview에 필요한 id와 title이 있으므로 publishedAt이 더 있어도 renderPreview에 전달할 수 있습니다.',
        'renderPreview에 직접 전달한 객체 리터럴의 titel은 title의 오타라 초과 속성 검사에서 오류가 납니다. title로 고치면 필요한 구조를 만족합니다.',
        '초과 속성 검사는 코드에 직접 쓴 객체 리터럴의 키 오타를 찾는 정적 검사이며, 외부에서 받은 값의 안전성을 보장하지는 않습니다.',
      ],
    },
    mission: 'savedEvent 변수의 추가 속성은 유지하세요. 새 객체 리터럴의 actoin 속성을 action 속성으로 수정하세요. savedAction 변수와 newAction 변수가 모두 문자열 값을 받으면 완료입니다.',
    goals: ['필요한 속성을 가진 기존 객체를 함수에 전달하기', '새 객체 리터럴의 속성 이름 오타 찾기'],
    hints: ['Audit 타입에 필요한 속성은 id 속성과 action 속성입니다.', 'savedEvent 변수의 createdAt 속성과 actor 속성은 log 함수 호출을 막지 않습니다.', '새 객체 리터럴의 속성 이름을 Audit 타입 선언과 비교하세요.'],
    explanation: ['savedEvent 변수에는 추가 속성이 있지만 Audit 타입에 필요한 속성도 있습니다. 따라서 log 함수에 전달할 수 있습니다. 새 객체 리터럴의 actoin 속성 오타는 컴파일러가 찾습니다.', '초과 속성 검사는 API 응답의 실제 값을 검사하지 않습니다. API 응답은 unknown 타입으로 받은 뒤 가드 함수나 파서 함수로 확인해야 합니다.'],
    starter: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit): string { return event.action; }\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", actoin: "cancel" });\n' },
    solution: { 'index.ts': 'export type Audit = { id: string; action: string };\nexport function log(event: Audit): string { return event.action; }\nconst savedEvent = { id: "e1", action: "save", createdAt: 1700000000, actor: "u1" };\nexport const savedAction = log(savedEvent);\nexport const newAction = log({ id: "e2", action: "cancel" });\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [objectTypes], minutes: 6,
    interview: {
      question: '초과 속성 검사를 통과한 Audit 타입이 API에서 받은 값도 안전하다고 보장할까요?',
      answer: '보장하지 않습니다. 초과 속성 검사는 작성 시점의 객체 리터럴 오타를 잡고, 구조적 타이핑은 필요한 필드의 정적 호환성을 봅니다. 실행 중 들어오는 API 값은 unknown에서 실제 모양을 따로 검증해야 합니다.',
      points: ['구조적 타입 호환성', '객체 리터럴의 초과 속성 검사', '외부 입력의 런타임 검증'],
    },
  }),
];
