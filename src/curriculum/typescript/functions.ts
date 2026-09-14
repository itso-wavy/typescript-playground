import type { Lesson } from '../../shared/contracts.js';

const checkedAt = '2026-09-11';
const compilerVersion = '7.0.2';

const functions = { title: 'TypeScript Handbook: More on Functions', url: 'https://www.typescriptlang.org/docs/handbook/2/functions.html' };
const generics = { title: 'TypeScript Handbook: Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html' };
const objectTypes = { title: 'TypeScript Handbook: Object Types', url: 'https://www.typescriptlang.org/docs/handbook/2/objects.html' };
const keyofTypes = { title: 'TypeScript Handbook: Keyof Type Operator', url: 'https://www.typescriptlang.org/docs/handbook/2/keyof-types.html' };
const indexedAccess = { title: 'TypeScript Handbook: Indexed Access Types', url: 'https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html' };
const utilityTypes = { title: 'TypeScript Handbook: Utility Types', url: 'https://www.typescriptlang.org/docs/handbook/utility-types.html' };
const conditionalTypes = { title: 'TypeScript Handbook: Conditional Types', url: 'https://www.typescriptlang.org/docs/handbook/2/conditional-types.html' };

type LessonDraft = Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision'>;

function lesson(data: LessonDraft): Lesson {
  return { ...data, kind: 'practice', checkedAt, compilerVersion, revision: 1 };
}

export const lessons: Lesson[] = [
  lesson({
    id: 'ts07.function-contracts', chapter: 2, order: 7, title: '함수와 콜백의 입출력 계약 작성하기', navTitle: '함수와 콜백 계약',
    summary: '매개변수와 반환값, 선택 매개변수, 콜백 시그니처를 연결해 가격 목록을 화면용 문자열로 바꾸는 함수 계약을 작성합니다.',
    story: '상품 가격 목록을 화면 문구로 바꾸는 함수가 여러 페이지에서 쓰입니다. format 콜백 매개변수를 unknown으로 두면 호출할 때마다 값을 확인해야 합니다. limit 매개변수를 항상 요구하면 전체 목록을 바꾸는 호출도 번거롭습니다. 함수 선언에 콜백이 받는 값과 반환하는 값, 생략 가능한 매개변수를 드러내야 합니다.',
    concept: [
      '함수 타입은 매개변수와 반환값 사이의 계약입니다. 콜백 시그니처도 `(value: number, index: number) => string`처럼 입력과 결과를 적습니다. 선택 매개변수에는 `?`를 붙이고, 구현에서는 그 값이 undefined일 때의 동작을 처리해야 합니다.',
      '완성 예시인 `function apply(value: number, format: (value: number) => string): string`을 보세요. format 콜백은 숫자를 받아 문자열을 만듭니다. `apply(1000, value => value.toLocaleString())`의 결과는 string입니다. 반환 타입이 이 관계를 보존하므로 숫자에 맞지 않는 콜백은 컴파일 단계에서 거절됩니다.',
    ],
    workedExample: { title: '완성 예시: 값을 문자열로 바꾸는 콜백', code: 'function apply(\n  value: number,\n  format: (value: number) => string,\n): string {\n  return format(value);\n}\n\napply(1000, value => value.toLocaleString());', result: ['format 콜백은 number를 받아 string을 반환해야 합니다.', 'apply 함수의 결과도 string으로 정해집니다.'] },
    mission: '이제 같은 원리를 가격 목록에 적용하세요. formatPrices 함수가 readonly number 배열과 문자열을 반환하는 format 콜백을 받고, 선택적인 limit 매개변수가 있으면 앞부분만 변환하도록 시그니처와 구현을 완성하세요.',
    goals: ['함수의 매개변수와 반환값 타입을 명시한다', '콜백 계약과 선택 매개변수의 실행 동작을 함께 구현한다'],
    hints: ['format 콜백은 price와 index 매개변수를 number로 받고 string을 반환합니다.', 'limit 매개변수 이름 뒤에 `?`를 붙이면 호출자가 생략할 수 있습니다.', 'limit 값이 undefined이면 prices 배열 전체를, 숫자이면 slice한 앞부분을 변환하세요.'],
    explanation: ['`formatPrices([1000, 2000], price => price + "원")`은 string[]을 반환하며 limit 매개변수를 생략해도 됩니다.', '콜백 반환 타입을 unknown으로 두면 결과 배열도 문자열 배열로 안전하게 사용할 수 없습니다. 매개변수와 반환값의 관계를 구체적으로 선언해야 합니다.'],
    starter: { 'index.ts': 'export function formatPrices(\n  prices: number[],\n  format: (price: unknown) => unknown,\n  limit: number,\n): unknown[] {\n  return prices.slice(0, limit).map(format);\n}\n' },
    solution: { 'index.ts': 'export function formatPrices(\n  prices: readonly number[],\n  format: (price: number, index: number) => string,\n  limit?: number,\n): string[] {\n  const selected = limit === undefined ? prices : prices.slice(0, limit);\n  return selected.map(format);\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [functions], minutes: 7,
  }),
  lesson({
    id: 'ts08.generic-basics', chapter: 2, order: 8, title: '제네릭으로 배열의 타입 관계 보존하기', navTitle: '제네릭 기본',
    summary: 'first 함수와 mapItems 함수에서 입력 원소 타입을 결과와 콜백에 연결해, 하나의 구현으로 여러 배열의 구체적인 타입을 보존합니다.',
    story: '검색 결과의 첫 항목을 고르고 목록을 화면 모델로 바꾸는 유틸리티를 사용자와 주문 양쪽에서 재사용합니다. unknown 또는 any를 쓰면 호출 직후 타입 정보를 다시 확인해야 합니다. 호출 때 들어온 배열 원소 타입과 콜백이 만든 결과 타입이 반환값까지 이어지도록 두 함수를 고칩니다.',
    concept: [
      '제네릭 타입 매개변수는 호출 때 들어온 타입 사이의 관계에 이름을 붙입니다. `first<T>`의 T는 입력 배열 원소 타입과 반환 타입을 연결합니다. `mapItems<T, U>`의 T와 U는 변환 전후의 서로 다른 원소 타입을 연결합니다.',
      '완성 예시인 `identity<T>(value: T): T`에 "order"를 넣으면 결과는 string으로 추론되고, 1을 넣으면 number로 추론됩니다. 하나의 구현을 재사용하면서도 any처럼 타입 정보를 버리지 않습니다. 빈 배열의 첫 값처럼 실행 중 없을 수 있는 결과는 `T | undefined`로 표현해야 합니다.',
    ],
    workedExample: { title: '완성 예시: 입력 타입을 결과까지 유지하기', code: 'function identity<T>(value: T): T {\n  return value;\n}\n\nconst name = identity("order");\nconst count = identity(1);', result: ['name 변수는 string, count 변수는 number로 추론됩니다.', 'any와 달리 호출할 때 들어온 타입 정보가 반환값에도 남습니다.'] },
    mission: '이제 같은 원리를 배열 도구에 적용하세요. first 함수는 빈 배열을 고려해 `T | undefined`를 반환하고, mapItems 함수는 입력 T와 콜백 결과 U를 보존해 `U[]`를 반환하게 만드세요.',
    goals: ['제네릭 타입 매개변수로 입력과 반환값을 연결한다', '변환 전후 타입이 다른 콜백에 두 제네릭 매개변수를 사용한다'],
    hints: ['first 함수의 items 매개변수는 `readonly T[]`이고 반환값은 `T | undefined`입니다.', 'mapItems 함수의 project 콜백은 T를 받아 U를 반환합니다.', 'mapItems 함수가 반환하는 배열의 원소 타입은 U입니다.'],
    explanation: ['숫자 배열에 first 함수를 호출하면 결과는 `number | undefined`입니다. 주문 객체를 이름으로 바꾸는 mapItems 함수의 결과는 `string[]`으로 유지됩니다.', '제네릭은 배열 값의 실제 유효성을 검사하지 않습니다. 외부 응답은 unknown 경계에서 별도로 검증해야 합니다.'],
    starter: { 'index.ts': 'export function first(items: unknown[]): unknown { return items[0]; }\nexport function mapItems(items: unknown[], project: (item: unknown) => unknown): unknown[] {\n  return items.map(project);\n}\n' },
    solution: { 'index.ts': 'export function first<T>(items: readonly T[]): T | undefined { return items[0]; }\nexport function mapItems<T, U>(items: readonly T[], project: (item: T) => U): U[] {\n  return items.map(project);\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [generics, functions], minutes: 7,
  }),
  lesson({
    id: 'ts09.generic-constraints', chapter: 2, order: 9, title: '제약과 키 관계로 필드 선택 지키기', navTitle: '제약·keyof·T[K]',
    summary: '제네릭 제약으로 필요한 최소 필드를 요구하고, keyof와 T[K]로 선택한 객체 키와 반환값의 타입을 정확히 연결합니다.',
    story: '사용자와 주문의 캐시 키는 모두 id 속성으로 만들 수 있고, 테이블의 열 선택 함수는 모델마다 다른 키를 읽습니다. 객체를 object 타입으로 받거나 key 매개변수를 string으로 받으면 필요한 속성을 읽지 못하거나 오타가 통과합니다. 함수가 요구하는 최소 구조와 실제 키, 그 키의 값 타입을 연결합니다.',
    concept: [
      '`T extends { id: string }` 제네릭 제약은 객체가 적어도 문자열 id 속성을 가져야 한다는 뜻입니다. `keyof T` 타입 연산자는 T의 키 유니온을 만들고, `K extends keyof T` 제약은 실제 키만 받게 합니다. 인덱스 접근 타입 `T[K]`는 선택한 키의 값 타입을 계산합니다.',
      '완성 예시인 `getField<T, K extends keyof T>(record: T, key: K): T[K]`를 보세요. `getField({ name: "Wavy", age: 20 }, "name")`의 결과는 string입니다. "missing"은 keyof 연산자가 만든 키 목록에 없어서 거절됩니다. 반환 타입을 unknown으로 넓힐 필요가 없습니다.',
    ],
    workedExample: { title: '완성 예시: 선택한 키의 값 타입 돌려주기', code: 'function getField<T, K extends keyof T>(\n  record: T,\n  key: K,\n): T[K] {\n  return record[key];\n}\n\nconst name = getField({ name: "Wavy", age: 20 }, "name");', result: ['key 매개변수에는 record 객체에 실제로 있는 키만 전달할 수 있습니다.', '"name"을 선택했으므로 name 변수는 string 타입입니다.'] },
    mission: '이제 같은 관계를 공통 도구에 적용하세요. cacheKey 함수는 string id 속성이 있는 객체만 받고, selectField 함수는 실제 키만 받아 그 키에 해당하는 `T[K]` 값을 반환하게 만드세요.',
    goals: ['extends로 함수가 필요한 최소 객체 구조를 표현한다', 'keyof와 인덱스 접근 타입 T[K]로 키와 값의 관계를 유지한다'],
    hints: ['cacheKey 함수의 T에는 적어도 `id: string` 제약이 필요합니다.', 'selectField 함수의 K 타입 매개변수는 `keyof T` 범위 안에 있어야 합니다.', 'selectField 함수의 반환 타입과 구현 속 record[key] 접근 결과는 모두 `T[K]`입니다.'],
    explanation: ['사용자와 주문 객체가 id 속성만 가지면 cacheKey 함수를 재사용할 수 있습니다. selectField 함수의 결과는 선택한 필드의 실제 타입으로 추론됩니다.', '제네릭 제약은 id 값이 데이터베이스에 실제로 존재하는지 확인하지 않습니다. 타입 관계와 런타임 데이터 검증의 범위를 구분해야 합니다.'],
    starter: { 'index.ts': 'export function cacheKey(item: object): string { return "item:" + (item as { id: string }).id; }\nexport function selectField(record: object, key: string): unknown {\n  return (record as Record<string, unknown>)[key];\n}\n' },
    solution: { 'index.ts': 'export function cacheKey<T extends { id: string }>(item: T): string { return "item:" + item.id; }\nexport function selectField<T, K extends keyof T>(record: T, key: K): T[K] {\n  return record[key];\n}\n' },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [generics, keyofTypes, indexedAccess], minutes: 7,
  }),
  lesson({
    id: 'ts10.generic-models', chapter: 2, order: 10, title: '제네릭 모델로 페이지 응답 재사용하기', navTitle: '제네릭 Page',
    summary: 'items의 원소만 달라지는 페이지 응답을 Page<T>로 정의해 사용자와 주문 API가 같은 구조를 중복 없이 공유하게 만듭니다.',
    story: '사용자 목록 API와 주문 목록 API는 모두 items 배열과 nextCursor 속성을 보내지만 항목의 모양만 다릅니다. 응답 타입을 두 번 복사하면 커서 규칙이 바뀔 때 한쪽만 수정될 수 있습니다. 공통 구조는 한 번 선언하고 각 API가 자신의 원소 타입을 넣게 만듭니다.',
    concept: [
      '제네릭 타입 별칭이나 인터페이스는 반복되는 구조에서 달라지는 타입만 매개변수로 받습니다. `Page<User>`의 items 속성은 `User[]`이고 `Page<Order>`의 items 속성은 `Order[]`입니다. nextCursor 속성의 계약은 한곳에서 공유합니다.',
      '완성 예시인 `type Page<T> = { items: T[]; nextCursor?: string }`에서 T 자리에 User를 넣으면 items는 `User[]`가 됩니다. nextCursor 속성은 다음 페이지가 없을 때 생략할 수 있습니다. 타입 매개변수는 실제 서버 응답을 변환하지 않으므로 네트워크에서 받은 JSON은 런타임에서 검증해야 합니다.',
    ],
    workedExample: { title: '완성 예시: 같은 응답 구조 재사용하기', code: 'type Box<T> = { value: T };\n\nconst nameBox: Box<string> = { value: "Wavy" };\nconst countBox: Box<number> = { value: 3 };', result: ['Box의 구조는 한 번만 작성합니다.', 'T에 넣은 타입에 따라 value 속성의 타입이 달라집니다.'] },
    mission: '이제 사용자와 주문 목록이 함께 쓸 수 있도록 Page 타입을 제네릭 모델로 고치세요. items 속성은 `T[]`이고 다음 페이지가 없을 때 nextCursor 속성을 생략할 수 있게 표현하세요.',
    goals: ['제네릭 타입 모델로 반복되는 응답 구조를 재사용한다', '항목 타입과 선택적인 다음 커서의 역할을 구분한다'],
    hints: ['Page 타입 이름 뒤에 타입 매개변수 T를 선언하세요.', 'items 속성의 타입은 unknown[]이 아니라 `T[]`입니다.', 'nextCursor 속성은 페이지 끝에서 없을 수 있으므로 선택적 속성으로 둘 수 있습니다.'],
    explanation: ['`Page<User>`와 `Page<Order>`는 구조를 공유하면서 items 배열 원소의 타입을 정확히 유지합니다.', '선택적 nextCursor 속성은 키 자체가 생략될 수 있다는 계약입니다. API가 null을 보낸다면 그 의미를 타입에 별도로 포함해야 합니다.'],
    starter: { 'index.ts': 'export type Page = {\n  items: unknown[];\n  nextCursor: string;\n};\n' },
    solution: { 'index.ts': 'export type Page<T> = {\n  items: T[];\n  nextCursor?: string;\n};\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [generics, objectTypes], minutes: 5,
  }),
  lesson({
    id: 'ts11.utility-update-contract', chapter: 2, order: 11, title: '유틸리티 타입으로 수정 범위 제한하기', navTitle: '유틸리티 타입',
    summary: 'Pick, Omit, Partial, Record의 선택 기준을 비교하고, 프로필 수정 요청과 필드별 오류가 모델의 허용 키만 따르게 만듭니다.',
    story: '프로필 화면은 displayName과 bio 속성만 바꿀 수 있습니다. 수정 요청에 id, role, createdAt 속성까지 들어가면 서버 소유 필드를 덮어쓸 위험이 생깁니다. 오류 응답도 허용한 입력 필드만 키로 가져야 합니다. 기존 모델을 복사하지 않고 화면이 소유한 범위를 좁혀 두 계약을 만듭니다.',
    concept: [
      'Pick 유틸리티 타입은 허용할 키를 고르고, Omit 유틸리티 타입은 제외할 키를 뺍니다. Partial 유틸리티 타입은 모든 속성을 선택적으로 만들고, Record 유틸리티 타입은 키 집합마다 같은 값 타입을 연결합니다. 공개 수정 API처럼 허용 필드가 적고 중요할 때는 Pick의 허용 목록이 새 서버 필드의 우발적 노출을 막는 데 유리합니다.',
      '완성 예시인 `type UpdateUser = Partial<Pick<User, "name">>`은 name 속성만 선택적으로 받습니다. User 타입에 role 속성이 추가되어도 UpdateUser 타입에는 자동으로 들어오지 않습니다. `Partial<Record<keyof UpdateUser, string[]>>`는 오류가 있는 수정 필드에만 메시지 배열을 보낼 수 있게 합니다.',
    ],
    workedExample: { title: '완성 예시: 수정 가능한 필드만 고르기', code: 'type User = { id: string; name: string; role: string };\ntype UpdateUser = Partial<Pick<User, "name">>;\n\nconst update: UpdateUser = { name: "Wavy" };', result: ['Pick은 User 타입에서 name 속성만 고릅니다.', 'Partial은 고른 속성을 선택 사항으로 만듭니다. id와 role은 UpdateUser에 넣을 수 없습니다.'] },
    mission: '이제 같은 원리를 프로필 계약에 적용하세요. EditableProfile 타입은 displayName과 bio 속성만 고르고, UpdateProfile 타입은 두 속성을 선택적으로 받으며, FieldErrors 타입은 허용 필드별 읽기 전용 오류 목록만 받게 만드세요.',
    goals: ['Pick과 Omit 중 수정 API에 맞는 키 선택 방식을 판단한다', 'Partial과 Record로 부분 수정과 필드별 오류 계약을 만든다'],
    hints: ['EditableProfile 타입은 `Pick<Profile, "displayName" | "bio">`로 만들 수 있습니다.', 'UpdateProfile 타입은 EditableProfile 타입의 모든 속성을 선택적으로 만듭니다.', 'FieldErrors 타입은 `keyof EditableProfile`을 키로 하는 Record를 만들고 오류가 없는 키를 생략할 수 있어야 합니다.'],
    explanation: ['UpdateProfile 타입에는 id, role, createdAt 속성이 들어갈 수 없습니다. FieldErrors 타입도 displayName과 bio 이외의 키를 거절합니다.', '이 타입은 클라이언트의 실수를 줄이지만 권한 검사를 대신하지 않습니다. 서버는 수정 권한과 실제 입력값을 별도로 검증해야 합니다.'],
    starter: { 'index.ts': 'export interface Profile {\n  id: string; displayName: string; bio: string; role: "user" | "admin"; createdAt: string;\n}\nexport type EditableProfile = Profile;\nexport type UpdateProfile = Profile;\nexport type FieldErrors = Record<string, string[]>;\n' },
    solution: { 'index.ts': 'export interface Profile {\n  id: string; displayName: string; bio: string; role: "user" | "admin"; createdAt: string;\n}\nexport type EditableProfile = Pick<Profile, "displayName" | "bio">;\nexport type UpdateProfile = Partial<EditableProfile>;\nexport type FieldErrors = Partial<Record<keyof EditableProfile, readonly string[]>>;\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [utilityTypes], minutes: 7,
  }),
  lesson({
    id: 'ts12.conditional-response', chapter: 2, order: 12, title: '조건부 타입으로 요청별 응답 계산하기', navTitle: '조건부 응답',
    summary: '검색 요청의 모양에 따라 문서 하나 또는 문서 배열을 선택하는 조건부 타입을 작성하고, 타입 계산과 JavaScript 분기를 구분합니다.',
    story: '검색 API는 id로 조회하면 문서 하나를, query로 검색하면 문서 배열을 반환합니다. 호출부가 항상 둘의 유니온을 받으면 매번 같은 확인을 반복하고, 잘못된 가정도 늦게 발견합니다. 요청 타입과 예상 응답 타입의 관계를 한곳에서 계산해 각 호출이 정확한 결과를 알게 만듭니다.',
    concept: [
      '조건부 타입 `T extends U ? X : Y`는 T가 U 조건을 만족하는지에 따라 타입을 계산합니다. ById 요청 타입에는 Document 타입을, Query 요청 타입에는 `Document[]` 타입을 연결하면 호출부가 요청 모양으로 결과 타입을 알 수 있습니다.',
      '완성 예시인 `type SearchResult<T extends SearchRequest> = T extends ById ? Document : Document[]`에서 `SearchResult<ById>`는 Document이고 `SearchResult<Query>`는 `Document[]`입니다. 조건부 타입은 컴파일 중에 사라지는 타입 계산입니다. 실제 search 함수가 id 속성이 있는 요청과 query 속성이 있는 요청을 구분해 다른 값을 반환하려면 JavaScript의 if 문 또는 in 연산자 분기도 구현해야 합니다.',
    ],
    workedExample: { title: '완성 예시: 조건에 따라 타입 선택하기', code: 'type Item<T> = T extends string ? { text: T } : { value: T };\n\ntype TextItem = Item<string>;\ntype NumberItem = Item<number>;', result: ['T가 string 타입이면 { text: string }을 선택합니다.', '그렇지 않으면 { value: T }를 선택합니다. 이 계산은 컴파일할 때만 일어납니다.'] },
    mission: '이제 SearchResult<T> 타입이 ById 요청에는 Document 하나를, Query 요청에는 Document 배열을 선택하도록 조건부 타입을 완성하세요.',
    goals: ['조건부 타입으로 입력 모양과 결과 타입의 관계를 계산한다', '컴파일 시 타입 계산과 실행 시 JavaScript 분기를 구분한다'],
    hints: ['T 타입 매개변수가 ById 타입을 만족하는지를 조건으로 검사하세요.', '조건이 참일 때의 타입은 Document입니다.', '조건이 거짓일 때의 타입은 `Document[]`입니다.'],
    explanation: ['`SearchResult<ById>`는 Document이고 `SearchResult<Query>`는 `Document[]`이므로 호출부에서 불필요한 유니온 확인이 줄어듭니다.', '실제 API가 선언과 다른 값을 보내면 이 타입은 알아채지 못합니다. 외부 응답은 unknown으로 받은 뒤 런타임에서 검증해야 합니다.'],
    starter: { 'index.ts': 'export type ById = { id: string };\nexport type Query = { query: string };\nexport type SearchRequest = ById | Query;\nexport type Document = { id: string; title: string };\nexport type SearchResult<T extends SearchRequest> = Document | Document[];\n' },
    solution: { 'index.ts': 'export type ById = { id: string };\nexport type Query = { query: string };\nexport type SearchRequest = ById | Query;\nexport type Document = { id: string; title: string };\nexport type SearchResult<T extends SearchRequest> = T extends ById ? Document : Document[];\n' },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [conditionalTypes], minutes: 6,
  }),
];
