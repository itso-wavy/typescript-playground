import type { Lesson } from '../../shared/contracts.js';

const typescriptModules = {
  title: 'TypeScript Handbook: Modules reference',
  url: 'https://www.typescriptlang.org/docs/handbook/modules/reference.html#import-type',
};
const nodeModules = {
  title: 'Node.js API: Modules',
  url: 'https://nodejs.org/api/modules.html',
};
const narrowing = {
  title: 'TypeScript Handbook: Narrowing',
  url: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
};
const checkedAt = '2026-09-11';
const minutesByOrder: Record<number, 5 | 6 | 7> = { 31: 6, 32: 6, 33: 7, 34: 7, 35: 7, 36: 7 };

const make = (data: Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision' | 'minutes'>): Lesson => ({
  ...data,
  kind: 'practice',
  checkedAt,
  compilerVersion: '7.0.2',
  revision: 1,
  minutes: minutesByOrder[data.order],
});

const orderModel = `export type ApiOrder = {
  id: string;
  title: string;
  quantity: number;
  editable: boolean;
};`;

const firstResponse = `export const initialResponse: unknown = {
  id: 'ord_1', title: '키보드', quantity: 2, editable: true,
};`;

const validateStarter = `import type { ApiOrder } from './model.js';

export function parseApiOrder(_value: unknown): ApiOrder {
  throw new Error('TODO');
}`;

const validateV1Solution = `import type { ApiOrder } from './model.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseApiOrder(value: unknown): ApiOrder {
  if (!isRecord(value)
    || typeof value.id !== 'string' || !value.id.startsWith('ord_')
    || typeof value.title !== 'string' || value.title.trim().length === 0
    || typeof value.quantity !== 'number' || !Number.isInteger(value.quantity) || value.quantity < 0
    || typeof value.editable !== 'boolean') {
    throw new Error('잘못된 주문 API 응답');
  }
  return { id: value.id, title: value.title, quantity: value.quantity, editable: value.editable };
}`;

const viewStarter = `import type { ApiOrder } from './model.js';

export type OrderAction =
  | { type: 'edit'; id: string }
  | { type: 'cancel'; id: string };

export type OrderViewModel = { id: string; title: string; quantityLabel: string; canEdit: boolean };
export type OrderViewProps = { order: OrderViewModel; onAction: (action: OrderAction) => void };

export function toOrderViewModel(_order: ApiOrder): OrderViewModel {
  throw new Error('TODO');
}`;

const viewSolution = `import type { ApiOrder } from './model.js';

export type OrderAction =
  | { type: 'edit'; id: string }
  | { type: 'cancel'; id: string };

export type OrderViewModel = { id: string; title: string; quantityLabel: string; canEdit: boolean };
export type OrderViewProps = { order: OrderViewModel; onAction: (action: OrderAction) => void };

export function toOrderViewModel(order: ApiOrder): OrderViewModel {
  return {
    id: order.id,
    title: order.title,
    quantityLabel: '수량 ' + order.quantity,
    canEdit: order.editable,
  };
}`;

const compatibleResponse = `export const versionedResponses: readonly unknown[] = [
  { id: 'ord_1', title: '키보드', quantity: 2, editable: true },
  { id: 'ord_2', title: '마우스', units: 1, editable: false },
];`;

const validateCompatibleSolution = `import type { ApiOrder } from './model.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validQuantity(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function parseApiOrder(value: unknown): ApiOrder {
  if (!isRecord(value)
    || typeof value.id !== 'string' || !value.id.startsWith('ord_')
    || typeof value.title !== 'string' || value.title.trim().length === 0
    || typeof value.editable !== 'boolean') {
    throw new Error('잘못된 주문 API 응답');
  }
  const hasQuantity = Object.hasOwn(value, 'quantity');
  const hasUnits = Object.hasOwn(value, 'units');
  if (hasQuantity === hasUnits) throw new Error('주문 수량 필드가 모호합니다');
  const quantity = hasQuantity ? value.quantity : value.units;
  if (!validQuantity(quantity)) throw new Error('잘못된 주문 수량');
  return { id: value.id, title: value.title, quantity, editable: value.editable };
}`;

export const lessons: Lesson[] = [
  make({
    id: 'ts31.framework-contract-handoff', chapter: 6, order: 31,
    title: 'React와 NestJS에 넘길 주문 계약 분리하기', navTitle: '프레임워크 계약 전달',
    summary: 'React 화면 props·행동과 NestJS가 소비할 생성·수정 DTO를 한 모듈에 선언하고, 타입 import와 실행 값을 분리합니다.',
    story: '주문 화면은 버튼 행동을 알아야 하고 서버는 요청 DTO를 알아야 합니다. 두 과정이 같은 계약을 읽되, 타입만 필요한 파일이 실행 모듈을 끌어오지 않도록 모듈 경계를 명확히 만들어야 합니다.',
    concept: [
      'OrderViewProps 타입과 OrderAction 타입은 React 과정이 화면과 이벤트에 적용할 계약입니다. CreateOrderDto 타입과 UpdateOrderDto 타입은 NestJS 과정이 요청 경계에서 검증할 모양의 출발점입니다.',
      'DTO 타입 선언은 실제 HTTP 요청을 검증하지 않습니다. 값으로 쓰는 orderActionTypes 상수만 일반 import로 가져오고, 나머지 계약은 import type 구문으로 가져와 JavaScript 출력에서 제거합니다.',
    ],
    mission: '공유 계약에서 실행 값과 타입을 분리해 주문 화면과 요청 함수가 같은 DTO를 안전하게 사용하도록 완성하세요.',
    goals: [
      'OrderViewProps·OrderAction·CreateOrderDto·UpdateOrderDto를 타입 전용 import로 사용한다.',
      '실행 시 필요한 orderActionTypes만 값 import로 남긴다.',
    ],
    hints: [
      '타입 이름을 가져오는 import 문에 type 키워드를 붙이세요.',
      'orderActionTypes 상수는 배열 값을 읽으므로 일반 import가 필요합니다.',
      '수정 DTO에는 생성 DTO의 필드 중 바꿀 수 있는 값만 선택적으로 담으세요.',
    ],
    starter: {
      'contracts.ts': `export type OrderAction = { type: 'edit'; id: string } | { type: 'cancel'; id: string };
export type OrderViewProps = { order: { id: string; title: string; quantity: number }; onAction: (action: OrderAction) => void };
export type CreateOrderDto = { title: string; quantity: number };
export type UpdateOrderDto = Partial<CreateOrderDto>;
export const orderActionTypes = ['edit', 'cancel'] as const;`,
      'index.ts': `import { orderActionTypes, OrderViewProps, CreateOrderDto, UpdateOrderDto } from './contracts.js';

export const canDispatch = (type: string) => orderActionTypes.includes(type as (typeof orderActionTypes)[number]);
export const viewProps = (order: OrderViewProps['order'], onAction: OrderViewProps['onAction']): OrderViewProps => ({ order, onAction });
export const createDto = (title: string, quantity: number): CreateOrderDto => ({ title, quantity });
export const updateDto = (title: string): UpdateOrderDto => ({ title });`,
    },
    solution: {
      'contracts.ts': `export type OrderAction = { type: 'edit'; id: string } | { type: 'cancel'; id: string };
export type OrderViewProps = { order: { id: string; title: string; quantity: number }; onAction: (action: OrderAction) => void };
export type CreateOrderDto = { title: string; quantity: number };
export type UpdateOrderDto = Partial<CreateOrderDto>;
export const orderActionTypes = ['edit', 'cancel'] as const;`,
      'index.ts': `import { orderActionTypes } from './contracts.js';
import type { CreateOrderDto, OrderViewProps, UpdateOrderDto } from './contracts.js';

export const canDispatch = (type: string) => orderActionTypes.includes(type as (typeof orderActionTypes)[number]);
export const viewProps = (order: OrderViewProps['order'], onAction: OrderViewProps['onAction']): OrderViewProps => ({ order, onAction });
export const createDto = (title: string, quantity: number): CreateOrderDto => ({ title, quantity });
export const updateDto = (title: string): UpdateOrderDto => ({ title });`,
    },
    editableFiles: ['index.ts'], mode: 'typecheck', sources: [typescriptModules],
    explanation: [
      'React와 NestJS가 같은 타입 파일을 읽더라도 두 프레임워크의 책임은 분리됩니다. 화면은 props와 행동을 소비하고, 서버는 DTO를 실제 요청 검증 파이프라인에 연결합니다.',
      '타입 선언은 컴파일 계약입니다. Controller 데코레이터나 DTO 타입만으로는 네트워크에서 들어온 unknown 타입의 값을 안전하게 만들 수 없으므로 런타임 검증은 다음 경계에 남겨 둡니다.',
    ],
  }),
  make({
    id: 'ts32.node-module-handoff', chapter: 6, order: 32,
    title: 'Node와 HTTP 사이의 주문 조회 포트 만들기', navTitle: 'Node·HTTP 계약 전달',
    summary: 'Node 모듈의 타입 선언과 HTTP 응답 포트를 구분하고, 다음 Node·HTTP 과정이 구현할 fetchOrders 경계를 만듭니다.',
    story: '브라우저 fetch를 바로 호출한 코드가 Node 작업에서도 재사용되면서 테스트와 오류 처리가 어려워졌습니다. HTTP 응답을 읽는 최소 포트를 선언하고, 응답 본문은 아직 검증되지 않은 unknown으로 다음 단계에 넘겨 보세요.',
    concept: [
      'node:fs/promises처럼 Node가 제공하는 모듈의 타입은 import type 구문으로 가져올 수 있습니다. 이 레슨은 파일 I/O를 구현하지 않고 Node 과정이 이어받을 타입 경계만 확인합니다.',
      'HTTP가 성공 상태를 돌려도 json 메서드가 반환한 값의 필드 모양은 보장되지 않습니다. fetchOrders 함수는 전송 실패만 처리하고, 본문 검증은 ts33의 parseApiOrder 함수에 맡깁니다.',
    ],
    mission: 'FetchPort 타입을 import type 구문으로 가져오고, HTTP 실패를 거절하며 성공 본문을 unknown 타입으로 반환하는 fetchOrders 함수를 완성하세요.',
    goals: [
      'Node 모듈 타입과 HTTP 포트 타입을 실행 import 없이 소비한다.',
      '성공 응답의 json 메서드 결과를 unknown 타입으로 유지해 다음 검증 경계에 전달한다.',
    ],
    hints: [
      'FetchPort와 ReadTextFile은 값이 아니라 타입입니다.',
      'response.ok 속성이 false이면 json 메서드를 호출하기 전에 오류를 내세요.',
      'json 메서드가 돌려주는 값에 타입 단언을 붙이지 마세요.',
    ],
    starter: {
      'ports.ts': `export type ReadTextFile = (path: string, encoding: 'utf8') => Promise<string>;
export type HttpResponse = { ok: boolean; status: number; json(): Promise<unknown> };
export type FetchPort = (input: string) => Promise<HttpResponse>;`,
      'index.ts': `import { FetchPort, ReadTextFile } from './ports.js';

export type NodePorts = { readTextFile: ReadTextFile; fetch: FetchPort };
export async function fetchOrders(_fetch: FetchPort): Promise<unknown> {
  throw new Error('TODO');
}`,
    },
    solution: {
      'ports.ts': `export type ReadTextFile = (path: string, encoding: 'utf8') => Promise<string>;
export type HttpResponse = { ok: boolean; status: number; json(): Promise<unknown> };
export type FetchPort = (input: string) => Promise<HttpResponse>;`,
      'index.ts': `import type { FetchPort, ReadTextFile } from './ports.js';

export type NodePorts = { readTextFile: ReadTextFile; fetch: FetchPort };
export async function fetchOrders(fetch: FetchPort): Promise<unknown> {
  const response = await fetch('/orders');
  if (!response.ok) throw new Error('주문 조회 실패: ' + response.status);
  return response.json();
}`,
    },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [nodeModules, typescriptModules],
    explanation: [
      '포트는 실제 fetch 함수나 Node 파일 모듈을 대체하기 위한 작은 계약입니다. Node·HTTP 과정은 이 포트에 시간 초과, 헤더, 재시도 같은 전송 정책을 추가할 수 있습니다.',
      '여기서 unknown 타입을 유지해야 ts33이 실제 JSON 필드를 검사할 수 있습니다. HTTP 성공은 전달 성공일 뿐 주문 데이터의 유효성을 뜻하지 않습니다.',
    ],
  }),
  make({
    id: 'ts33.capstone-validate', chapter: 7, order: 33,
    title: '주문 API 응답을 런타임에서 검증하기', navTitle: '주문 응답 검증',
    summary: 'unknown 타입의 주문 응답을 실제로 검사해 화면과 다음 변환 단계가 사용할 ApiOrder 타입으로 바꿉니다.',
    story: 'ts32의 HTTP 포트는 응답 본문을 unknown 타입으로 넘겼습니다. 이제 null 값, 오류 객체, 잘못된 id 속성, 소수 수량이 화면까지 닿지 않도록 주문 API 경계에서 값을 하나씩 확인합니다.',
    concept: [
      'ApiOrder 타입은 코드를 작성할 때의 약속입니다. parseApiOrder 함수는 네트워크에서 받은 실제 값이 그 약속을 만족하는지 검사하는 별도 단계입니다.',
      '이 파일은 다음 ts34–ts36에도 그대로 이어집니다. 다음 레슨의 시작 코드에는 현재 검증을 마친 파일이 포함되므로 중간 단계에서도 전체 주문 흐름을 실행할 수 있습니다.',
    ],
    mission: 'parseApiOrder 함수를 완성해 올바른 주문만 ApiOrder 타입으로 반환하고 잘못된 응답은 거절하세요.',
    goals: [
      'null·배열·오류 객체와 잘못된 id를 거절한다.',
      'quantity 속성이 0 이상의 정수이고 editable 속성이 boolean 타입일 때만 반환한다.',
    ],
    hints: [
      '먼저 null 값이 아닌 일반 객체인지 확인하세요.',
      'Record<string, unknown> 타입으로 좁힌 뒤 각 속성을 검사하세요.',
      'Number.isInteger와 0 이상 조건을 함께 확인하세요.',
    ],
    starter: { 'api.ts': firstResponse, 'model.ts': orderModel, 'validate.ts': validateStarter, 'index.ts': `export { parseApiOrder } from './validate.js';` },
    solution: { 'api.ts': firstResponse, 'model.ts': orderModel, 'validate.ts': validateV1Solution, 'index.ts': `export { parseApiOrder } from './validate.js';` },
    editableFiles: ['validate.ts'], mode: 'runtime', sources: [narrowing],
    explanation: [
      'unknown 타입을 ApiOrder 타입으로 단언하면 오류 값이 타입 검사만 통과한 채 화면으로 흘러갑니다. 검사 뒤 새 객체를 반환하면 허용한 값과 규칙이 변환 경계에 드러납니다.',
      '이 단계의 검증 결과는 다음 레슨에서 화면 모델로 바꿀 입력입니다. 직접 API 응답을 표시하지 않기 때문에 API 모양 변경도 한 경계에 모을 수 있습니다.',
    ],
  }),
  make({
    id: 'ts34.capstone-map-display', chapter: 7, order: 34,
    title: '검증된 주문을 화면 계약으로 바꾸기', navTitle: '주문 화면 모델',
    summary: 'ts33의 검증기를 그대로 사용해 ApiOrder 타입을 React 표시 props가 소비할 OrderViewModel 타입으로 변환합니다.',
    story: '화면이 API의 quantity 속성과 editable 속성을 그대로 알면 응답 변화가 컴포넌트마다 퍼집니다. 검증된 주문을 화면 전용 quantityLabel 속성과 canEdit 속성으로 바꾸고, React 과정이 소비할 props 계약을 한 곳에 둡니다.',
    concept: [
      '이 시작 코드는 ts33의 api.ts·model.ts·validate.ts 해결본을 모두 포함합니다. parseApiOrder 함수가 만든 ApiOrder 타입만 toOrderViewModel 함수의 입력으로 받으므로 외부 응답은 화면에 직접 도달하지 않습니다.',
      'OrderViewProps 타입은 React 컴포넌트가 받을 데이터와 행동의 모양입니다. React 컴포넌트를 작성하는 일은 React 과정에 남기고, 여기서는 안전한 입력 계약만 전달합니다.',
    ],
    mission: 'ApiOrder 타입을 OrderViewModel 타입으로 바꾸고, 화면이 사용할 quantityLabel 속성과 canEdit 속성을 채우세요.',
    goals: [
      'ts33의 parseApiOrder 결과만 화면 변환 함수에 전달한다.',
      'API 필드 대신 화면 전용 quantityLabel과 canEdit을 제공한다.',
    ],
    hints: [
      'view.ts 파일은 model.ts 파일의 ApiOrder 타입을 import type 구문으로만 가져옵니다.',
      'quantityLabel 속성은 수량 숫자 앞에 "수량 "을 붙인 문자열입니다.',
      'editable 속성은 canEdit 속성으로 이름을 바꿔 화면 계약을 읽기 쉽게 만드세요.',
    ],
    starter: {
      'api.ts': firstResponse, 'model.ts': orderModel, 'validate.ts': validateV1Solution,
      'view.ts': viewStarter,
      'index.ts': `export { parseApiOrder } from './validate.js';
export { toOrderViewModel } from './view.js';
export type { OrderAction, OrderViewModel, OrderViewProps } from './view.js';`,
    },
    solution: {
      'api.ts': firstResponse, 'model.ts': orderModel, 'validate.ts': validateV1Solution,
      'view.ts': viewSolution,
      'index.ts': `export { parseApiOrder } from './validate.js';
export { toOrderViewModel } from './view.js';
export type { OrderAction, OrderViewModel, OrderViewProps } from './view.js';`,
    },
    editableFiles: ['view.ts'], mode: 'runtime', sources: [typescriptModules],
    explanation: [
      '검증 모델과 화면 모델을 나누면 화면은 API의 원래 키 이름을 알 필요가 없습니다. 표시 문구나 편집 가능 여부가 바뀌어도 변환 함수와 props 계약에서 영향을 찾을 수 있습니다.',
      '이 단계는 ts33 검증 결과를 재사용합니다. 다음 ts35는 화면 모델을 바꾸지 않고 API의 quantity·units 차이만 검증 경계에서 흡수합니다.',
    ],
  }),
  make({
    id: 'ts35.capstone-change', chapter: 7, order: 35,
    title: 'quantity 변경을 변환 경계에서 흡수하기', navTitle: 'API 변경 흡수',
    summary: 'API가 quantity 대신 units를 보내도 ts34의 화면 계약을 유지하도록 검증·변환 경계에서 두 버전을 정규화합니다.',
    story: '주문 API가 새 응답에서 quantity 속성을 units 속성으로 바꿨지만, 배포 중에는 두 응답이 섞여 들어옵니다. 화면 파일을 고치지 않고 parseApiOrder 함수 한 곳에서 두 형식을 구분해 기존 OrderViewModel 타입을 보호해 보세요.',
    concept: [
      'ts34의 model.ts·view.ts 파일과 화면 export를 그대로 유지합니다. 바뀌는 곳은 unknown 타입의 API 응답을 안정된 ApiOrder 타입으로 만드는 validate.ts 파일 하나입니다.',
      'quantity 속성과 units 속성이 함께 있으면 어느 값이 진짜인지 알 수 없습니다. 호환성 코드는 두 버전 중 정확히 하나만 허용하고, 수량의 정수·범위 검증은 두 형식에 똑같이 적용합니다.',
    ],
    mission: 'parseApiOrder 함수가 quantity 속성 또는 units 속성 하나를 받아 안정된 quantity 속성으로 정규화하도록 고치세요.',
    goals: [
      '이전 quantity 속성과 새 units 속성의 응답을 모두 화면 모델로 전달한다.',
      '수량 키가 없거나 둘 다 있거나 유효하지 않으면 명시적으로 거절한다.',
    ],
    hints: [
      'Object.hasOwn으로 각 수량 키가 실제로 있는지 확인하세요.',
      '두 키의 존재 여부가 같으면 둘 다 없거나 둘 다 있는 경우입니다.',
      '선택한 값을 ApiOrder 타입의 안정된 quantity 속성에 넣으세요.',
    ],
    starter: {
      'api.ts': compatibleResponse, 'model.ts': orderModel, 'validate.ts': validateV1Solution, 'view.ts': viewSolution,
      'index.ts': `export { parseApiOrder } from './validate.js';
export { toOrderViewModel } from './view.js';
export type { OrderAction, OrderViewModel, OrderViewProps } from './view.js';`,
    },
    solution: {
      'api.ts': compatibleResponse, 'model.ts': orderModel, 'validate.ts': validateCompatibleSolution, 'view.ts': viewSolution,
      'index.ts': `export { parseApiOrder } from './validate.js';
export { toOrderViewModel } from './view.js';
export type { OrderAction, OrderViewModel, OrderViewProps } from './view.js';`,
    },
    editableFiles: ['validate.ts'], mode: 'runtime', sources: [narrowing],
    explanation: [
      '새 API 키를 화면까지 전파하지 않고 parseApiOrder 함수에서 안정된 quantity 속성으로 정규화했습니다. 따라서 ts34의 toOrderViewModel 함수와 React props는 두 API 버전에서 같은 모델을 받습니다.',
      '무조건 둘 중 하나를 우선하면 모호한 응답을 숨길 수 있습니다. 키가 둘 다 있거나 없을 때 실패하게 만들고 정상·실패 사례를 함께 회귀 검사해야 합니다.',
    ],
  }),
  make({
    id: 'ts36.capstone-decision', chapter: 7, order: 36,
    title: '주문 경계 설계를 근거와 한계로 설명하기', navTitle: '경계 설계 설명',
    summary: '검증·변환·PATCH 의도와 React·NestJS의 책임을 현재 코드와 실패 사례에 연결해 짧은 설계 판단으로 설명합니다.',
    story: '팀원이 “DTO 타입과 Controller 데코레이터가 있으니 화면에서도 API 값을 바로 써도 된다”고 말합니다. ts33–ts35의 코드와 실패 입력을 근거로, 어느 경계가 무엇을 책임지는지 NestJS 과정에 전달할 판단을 정리해야 합니다.',
    concept: [
      '이 시작 코드는 ts35의 호환 검증기와 ts34의 화면 변환기를 모두 포함합니다. handoff.ts 파일에는 경계별 책임을 기록하고, 면접 답변에서는 그 선택의 근거·대안·한계·검증 방법을 설명합니다.',
      'TypeScript 타입, React props, NestJS DTO는 모두 유용한 계약이지만 네트워크에서 들어온 값을 검사하지는 않습니다. unknown 타입의 값은 런타임 검증 파이프라인과 도메인 변환을 거친 뒤에만 화면으로 보냅니다.',
    ],
    mission: 'NestJS 전달 체크를 완성하고 현재 코드의 검증 경계, 화면 책임, DTO 한계를 다섯 문장 이내로 설명하세요.',
    goals: [
      'unknown 타입 입력의 런타임 검증과 화면 표시 책임을 서로 다른 경계에 둔다.',
      'PATCH 요청에서 속성 생략과 값 변경의 의도를 구분하고, DTO 타입만으로 보장되지 않는 범위를 설명한다.',
    ],
    hints: [
      'runtimeValidation 속성이 나타내는 책임은 Controller 데코레이터가 아니라 검증 파이프라인과 변환 경계가 맡습니다.',
      'React는 검증된 OrderViewProps 타입의 값을 표시하고 API JSON을 직접 파싱하지 않습니다.',
      'PATCH 요청에서 undefined 값의 생략과 null 값 또는 명시적 변경 연산의 의도는 별도 계약으로 설명하세요.',
    ],
    starter: {
      'api.ts': compatibleResponse, 'model.ts': orderModel, 'validate.ts': validateCompatibleSolution, 'view.ts': viewSolution,
      'handoff.ts': `export type NestBoundaryHandoff = {
  runtimeValidation: 'validation-pipeline';
  reactResponsibility: 'render-validated-props';
  patchIntent: 'omit-undefined-use-explicit-null-or-operation';
};

export const nestBoundaryHandoff: NestBoundaryHandoff = {
  runtimeValidation: 'TODO',
  reactResponsibility: 'TODO',
  patchIntent: 'TODO',
};`,
      'index.ts': `export { parseApiOrder } from './validate.js';
export { toOrderViewModel } from './view.js';
export { nestBoundaryHandoff } from './handoff.js';`,
    },
    solution: {
      'api.ts': compatibleResponse, 'model.ts': orderModel, 'validate.ts': validateCompatibleSolution, 'view.ts': viewSolution,
      'handoff.ts': `export type NestBoundaryHandoff = {
  runtimeValidation: 'validation-pipeline';
  reactResponsibility: 'render-validated-props';
  patchIntent: 'omit-undefined-use-explicit-null-or-operation';
};

export const nestBoundaryHandoff: NestBoundaryHandoff = {
  runtimeValidation: 'validation-pipeline',
  reactResponsibility: 'render-validated-props',
  patchIntent: 'omit-undefined-use-explicit-null-or-operation',
};`,
      'index.ts': `export { parseApiOrder } from './validate.js';
export { toOrderViewModel } from './view.js';
export { nestBoundaryHandoff } from './handoff.js';`,
    },
    editableFiles: ['handoff.ts'], mode: 'typecheck', sources: [typescriptModules, narrowing],
    explanation: [
      '이 레슨의 자동 검사는 전달 체크가 현재 파일과 모순되지 않는지만 확인합니다. 설계 판단의 완성 여부는 아래 설명 평가로 확인합니다. 현재 코드의 근거 없이 일반론만 반복한 답변은 통과하지 않습니다.',
      'NestJS 과정은 이 결과를 Controller·DI·DTO 검증 파이프라인에 적용합니다. TypeScript 과정은 데코레이터 자체가 검증을 수행한다고 가르치지 않습니다. DTO·검증 정책이나 모듈 형식이 바뀌면 전달 내용을 다시 확인해야 합니다.',
    ],
    interview: {
      question: 'ts33–ts35의 주문 흐름을 근거로, API가 quantity 속성을 units 속성으로 바꾸었을 때 왜 unknown 타입의 응답을 검증·변환 경계에서 처리해야 하는지 설명하세요. 현재 코드의 근거 하나, 가능한 대안 하나와 그 한계, 타입만으로 보장되지 않는 범위, 실패 입력과 재검증 방법을 포함하세요.',
      answer: 'parseApiOrder 함수가 unknown 타입의 응답을 검사한 뒤 안정된 quantity 속성을 가진 ApiOrder 타입으로 정규화하므로, toOrderViewModel 함수와 React props는 두 API 버전에서 바뀌지 않는다. 화면에서 quantity 속성과 units 속성을 분기하는 방법도 가능하지만 API 의존성이 여러 컴포넌트로 퍼진다. DTO 타입과 Controller 데코레이터만으로 네트워크 JSON의 실제 값, 정수 범위, 두 수량 키가 함께 있는 모호한 응답을 검증할 수 없으므로 런타임 검증이 필요하다. null 값, 잘못된 "ord_" 접두사의 id 속성, 소수·음수 수량, 두 수량 키가 함께 있거나 모두 없는 응답을 거절하는 테스트와 두 정상 버전의 화면 모델 회귀 검사를 실행한다. PATCH 계약에서는 undefined 값의 생략과 null 값 또는 명시적 변경 연산의 의도를 별도로 확인한다.',
      points: [
        '결론: 검증·정규화 경계 하나에서 API 변경을 흡수하고 화면 계약을 유지한다고 설명한다.',
        '코드 근거: parseApiOrder와 toOrderViewModel의 역할 분리를 현재 파일 이름 또는 함수 이름으로 연결한다.',
        '대안과 한계: 화면에서 API 버전을 분기하는 대안을 제시하고 의존성 확산 또는 중복의 한계를 설명한다.',
        '타입의 한계: DTO 타입·데코레이터가 실제 JSON 값과 수량 규칙을 검증하지 못함을 구분한다.',
        '실패와 검증: null, 잘못된 id, 범위 밖 수량, 누락·중복 수량 키와 정상 두 버전의 회귀 검사를 제시한다.',
      ],
    },
  }),
];
