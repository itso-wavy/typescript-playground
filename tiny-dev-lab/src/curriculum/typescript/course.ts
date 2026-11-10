import type { CourseDefinition, EvidenceAxis } from '../../shared/contracts.js';

const axes: EvidenceAxis[] = ['understanding', 'application', 'explanation'];
const outputByEvidencePrefix = {
  model: 'out.ts-model-foundation', function: 'out.ts-function-contract', boundary: 'out.ts-runtime-boundary',
  module: 'out.ts-module-environment', calculation: 'out.ts-type-calculation', handoff: 'out.ts-framework-handoff',
  capstone: 'out.ts-order-capstone', abstract: 'out.ts-abstract-contract', enum: 'out.ts-enum-choice',
  variance: 'out.ts-function-variance', infer: 'out.ts-infer-distribution', template: 'out.ts-template-branding',
} as const;

type EvidencePrefix = keyof typeof outputByEvidencePrefix;

const evidenceIds = (prefix: EvidencePrefix) => axes.map((axis) => `ev.${prefix}-${axis}`);
const requiredEvidence = (prefix: EvidencePrefix) => Object.fromEntries(
  axes.map((axis) => [axis, [`ev.${prefix}-${axis}`]]),
) as Record<EvidenceAxis, string[]>;
const expected = (normal: string, failure: string, boundary: string) => ({ normal: [normal], failure: [failure], boundary: [boundary] });

const evidence = (Object.entries(outputByEvidencePrefix) as [EvidencePrefix, string][]).flatMap(([prefix, outputId]) => [
  { id: `ev.${prefix}-understanding`, axis: 'understanding' as const, outputId, description: '개념·작동 원리와 보장 범위를 설명한다.' },
  { id: `ev.${prefix}-application`, axis: 'application' as const, outputId, description: 'starter를 수정해 정상 결과와 실패 처리를 구현한다.' },
  { id: `ev.${prefix}-explanation`, axis: 'explanation' as const, outputId, description: '선택 근거, 대안, 한계와 재검증 방법을 현재 코드로 설명한다.' },
]);

export const course: CourseDefinition = {
  schemaVersion: 'curriculum-harness/v1',
  courseId: 'typescript.foundation',
  version: '2.0.0',
  audience: {
    description: 'JavaScript의 함수·객체·배열·모듈과 React 컴포넌트의 기본 사용을 알고, 타입 별칭·인터페이스·기본 함수 표기를 접한 뒤 TypeScript를 실제 웹 개발 경계에 적용하려는 wavy를 대상으로 합니다.',
    prerequisites: [
      'JavaScript 함수, 객체, 배열, 모듈 문법을 사용해 코드를 작성할 수 있다.',
      'npm 프로젝트에서 파일을 수정하고 실행 결과와 오류 메시지를 확인할 수 있다.',
      'React 컴포넌트와 props의 기본 사용법을 알고 있다.',
    ],
  },
  completionOutcomes: [
    'API·저장소·사용자 입력을 unknown으로 받고 실제 값 검증 뒤 앱 모델로 변환한다.',
    '모델·함수·수정 요청·모듈의 타입 관계를 제네릭, 유니온, 유틸리티 타입과 좁히기로 표현한다.',
    'strict 설정과 모듈·선언 파일 경계의 오류를 읽고 타입 선언과 런타임 검증의 보장 범위를 설명한다.',
    'React·Node·HTTP·NestJS 과정이 소비할 타입 계약을 전달하고 API 변경을 변환 경계에서 흡수한다.',
    '타입 표현의 선택, 가능한 대안, 한계, 실패 입력과 검증 방법을 현재 코드 근거로 짧게 설명한다.',
  ],
  flow: [
    { id: 'type-models', title: '타입 모델의 기초', rationale: '진단 뒤에 리터럴, 모델, 유니온과 구조적 대입을 먼저 익혀 이후 함수와 외부 데이터가 무엇을 약속하는지 읽을 공통 언어를 만듭니다.', outcomeRefs: [1, 2], lessonIds: ['ts01.inference-literals', 'ts02.tuple-readonly', 'ts03.top-bottom-types', 'ts04.models-alias-interface', 'ts05.unions-narrowing', 'ts06.structural-typing'] },
    { id: 'function-relations', title: '함수와 타입 관계', rationale: '입력과 결과의 관계를 제네릭과 유틸리티 타입으로 표현한 다음에야 모델 변경이 여러 호출부에 안전하게 전달되는 이유를 확인할 수 있습니다.', outcomeRefs: [1, 4], lessonIds: ['ts07.function-contracts', 'ts08.generic-basics', 'ts09.generic-constraints', 'ts10.generic-models', 'ts11.utility-update-contract', 'ts12.conditional-response'] },
    { id: 'runtime-boundaries', title: '런타임 경계와 비동기', rationale: '정적 타입만으로는 외부 JSON과 수정 요청의 실제 모양을 보장할 수 없으므로 검증, 변환, 실패 표현, 비동기 결과와 Patch 직렬화를 연결합니다.', outcomeRefs: [0, 1, 2], lessonIds: ['ts13.unknown-guard', 'ts14.dto-to-domain', 'ts15.result-failure', 'ts16.async-awaited', 'ts17.patch-json-boundary'] },
    { id: 'language-environment', title: '클래스·설정·모듈', rationale: '실제 프로젝트의 컴파일 설정과 모듈 경계를 이해한 뒤 클래스, 데코레이터, 선언 파일이 타입 검사와 런타임에서 각각 무엇을 하는지 구분합니다.', outcomeRefs: [2, 4], lessonIds: ['ts18.class-value-type', 'ts19.abstract-contract', 'ts20.decorator-boundary', 'ts21.enum-or-const-object', 'ts22.strict-baseline', 'ts23.function-variance', 'ts24.script-module-boundary', 'ts25.declaration-file', 'ts26.package-contract'] },
    { id: 'type-calculation', title: '타입 계산 심화', rationale: '기본 모델과 모듈 경계를 만든 뒤 필요한 곳에서만 매핑, infer, 문자열 계산, 브랜드 타입을 사용해 복잡성의 이득과 비용을 함께 판단합니다.', outcomeRefs: [1, 4], lessonIds: ['ts27.mapped-errors', 'ts28.infer-and-distribution', 'ts29.template-key-remap', 'ts30.brand-at-boundary'] },
    { id: 'framework-handoff', title: '프레임워크 인수인계', rationale: 'React·Node·HTTP·NestJS의 사용법을 중복해 가르치지 않고, 다음 과정이 소비할 DTO·props·포트 계약과 타입/값 import 경계를 명확히 전달합니다.', outcomeRefs: [3], lessonIds: ['ts31.framework-contract-handoff', 'ts32.node-module-handoff'] },
    { id: 'order-capstone', title: '주문 흐름 종합 실습', rationale: '검증, 화면 모델 변환, API 변경 흡수, 설계 설명을 하나의 주문 흐름에 재사용해 코드 통과와 별개로 세 숙달 축을 누적 확인합니다.', outcomeRefs: [0, 3, 4], lessonIds: ['ts33.capstone-validate', 'ts34.capstone-map-display', 'ts35.capstone-change', 'ts36.capstone-decision'] },
  ],
  practicePlan: {
    minimum: 36,
    maximum: 36,
    rationale: '핵심 30개는 도착점에 필요한 모델·경계·모듈·전달 계약을 순서대로 증명하고, 선택 심화 6개는 실제 문제에서 확장할 수 있게 남깁니다. 각 단계의 결과를 다음 단계와 종합 실습에서 다시 사용하므로 수만 맞춘 독립 예제가 아닙니다.',
    decision: 'approved',
  },
  harness: {
    capabilities: [
      { id: 'ts.model-foundation', description: '리터럴, 모델, 유니온과 구조적 대입으로 앱의 데이터 약속을 작성하고 설명한다.', classification: 'core', classificationRationale: '모든 이후 타입 계약을 읽고 수정하는 공통 언어다.', prerequisiteCapabilityIds: [], outputIds: ['out.ts-model-foundation'], requiredEvidence: requiredEvidence('model') },
      { id: 'ts.function-contract', description: '함수·콜백·제네릭으로 입력, 결과, 키의 관계를 보존한다.', classification: 'core', classificationRationale: '화면·서버 양쪽의 재사용 API가 의존한다.', prerequisiteCapabilityIds: ['ts.model-foundation'], outputIds: ['out.ts-function-contract'], requiredEvidence: requiredEvidence('function') },
      { id: 'ts.runtime-boundary', description: 'unknown 외부 값을 검증하고 실패를 표현해 안정된 앱 모델과 Patch로 바꾼다.', classification: 'core', classificationRationale: 'API·저장소·사용자 입력이 타입 선언만으로 안전해지지 않는다.', prerequisiteCapabilityIds: ['ts.model-foundation', 'ts.function-contract'], outputIds: ['out.ts-runtime-boundary'], requiredEvidence: requiredEvidence('boundary') },
      { id: 'ts.module-environment', description: 'strict 설정, 모듈, 선언 파일과 데코레이터의 타입·실행 경계를 구분한다.', classification: 'core', classificationRationale: '실제 TypeScript 프로젝트를 안전하게 설정하고 의존성을 소비하는 전제다.', prerequisiteCapabilityIds: ['ts.model-foundation'], outputIds: ['out.ts-module-environment'], requiredEvidence: requiredEvidence('module') },
      { id: 'ts.type-calculation', description: '모델 변경을 따라가는 매핑 타입과 제한된 조건부 계산을 적용한다.', classification: 'core', classificationRationale: '수정 계약과 오류 모델이 모델 변화에 안전하게 따라가야 한다.', prerequisiteCapabilityIds: ['ts.function-contract'], outputIds: ['out.ts-type-calculation'], requiredEvidence: requiredEvidence('calculation') },
      { id: 'ts.framework-handoff', description: 'React·Node·HTTP·NestJS 과정이 소비할 타입 계약과 타입/값 모듈 경계를 제공한다.', classification: 'core', classificationRationale: 'TypeScript 과정의 결과가 다음 스택의 실제 입력이 된다.', prerequisiteCapabilityIds: ['ts.runtime-boundary', 'ts.module-environment'], outputIds: ['out.ts-framework-handoff'], requiredEvidence: requiredEvidence('handoff') },
      { id: 'ts.change-isolation', description: 'API 필드 변경을 검증·변환 경계에서 흡수하고 선택의 근거와 한계를 설명한다.', classification: 'core', classificationRationale: '과정 도착점의 통합 적용과 논리적 설명을 함께 증명한다.', prerequisiteCapabilityIds: ['ts.runtime-boundary', 'ts.framework-handoff'], outputIds: ['out.ts-order-capstone'], requiredEvidence: requiredEvidence('capstone') },
      { id: 'ts.abstract-contract', description: '공통 구현이 있을 때만 추상 클래스를 계약으로 선택한다.', classification: 'optional', classificationRationale: '일상 앱 모델에 항상 필요한 추상화는 아니다.', prerequisiteCapabilityIds: ['ts.module-environment'], outputIds: ['out.ts-abstract-contract'], requiredEvidence: requiredEvidence('abstract') },
      { id: 'ts.enum-choice', description: 'enum, 문자열 유니온, as const 객체의 실행 결과와 비용을 비교한다.', classification: 'optional', classificationRationale: '상태 모델의 선택 폭을 넓히지만 수료 핵심은 아니다.', prerequisiteCapabilityIds: ['ts.model-foundation'], outputIds: ['out.ts-enum-choice'], requiredEvidence: requiredEvidence('enum') },
      { id: 'ts.function-variance', description: '콜백 매개변수의 대입 가능 범위를 strictFunctionTypes 기준으로 설명한다.', classification: 'optional', classificationRationale: '공개 API와 라이브러리 콜백에서 주로 필요한 심화다.', prerequisiteCapabilityIds: ['ts.function-contract'], outputIds: ['out.ts-function-variance'], requiredEvidence: requiredEvidence('variance') },
      { id: 'ts.infer-distribution', description: 'infer와 분산 조건부 타입을 제한적으로 작성하고 분산을 막는 이유를 설명한다.', classification: 'optional', classificationRationale: '라이브러리 타입을 읽고 작성하는 심화 능력이다.', prerequisiteCapabilityIds: ['ts.type-calculation'], outputIds: ['out.ts-infer-distribution'], requiredEvidence: requiredEvidence('infer') },
      { id: 'ts.template-branding', description: '키 재매핑·브랜드 타입을 실제 경계 문제에만 적용하고 비용을 설명한다.', classification: 'optional', classificationRationale: '강한 타입 계산과 ID 구분은 조건부 확장이다.', prerequisiteCapabilityIds: ['ts.type-calculation', 'ts.runtime-boundary'], outputIds: ['out.ts-template-branding'], requiredEvidence: requiredEvidence('template') },
    ],
    outputs: [
      { id: 'out.ts-model-foundation', capabilityIds: ['ts.model-foundation'], lessonIds: ['ts01.inference-literals', 'ts02.tuple-readonly', 'ts03.top-bottom-types', 'ts04.models-alias-interface', 'ts05.unions-narrowing', 'ts06.structural-typing'], outcomeRefs: [1, 2], expected: expected('안전한 주문·결제 모델이 컴파일된다.', '잘못된 상태와 객체 키가 타입 오류가 된다.', '구조적 타이핑은 외부 값 검증을 대신하지 않는다고 설명한다.'), evidenceIds: evidenceIds('model'), reusedByOutputIds: ['out.ts-function-contract', 'out.ts-runtime-boundary'] },
      { id: 'out.ts-function-contract', capabilityIds: ['ts.function-contract'], lessonIds: ['ts07.function-contracts', 'ts08.generic-basics', 'ts09.generic-constraints', 'ts10.generic-models', 'ts11.utility-update-contract', 'ts12.conditional-response'], outcomeRefs: [1, 4], expected: expected('입력과 결과의 타입 관계가 호출부까지 유지된다.', '없는 키와 잘못된 수정 필드가 거부된다.', '조건부 타입은 런타임 분기가 아니라고 설명한다.'), evidenceIds: evidenceIds('function'), reusedByOutputIds: ['out.ts-runtime-boundary', 'out.ts-type-calculation'] },
      { id: 'out.ts-runtime-boundary', capabilityIds: ['ts.runtime-boundary'], lessonIds: ['ts13.unknown-guard', 'ts14.dto-to-domain', 'ts15.result-failure', 'ts16.async-awaited', 'ts17.patch-json-boundary'], outcomeRefs: [0, 1, 2], expected: expected('검증된 DTO와 Patch만 다음 단계로 전달된다.', 'null·잘못된 id·소수 수량이 명시적 실패가 된다.', 'undefined 생략과 null 의도를 JSON 경계에서 구분한다.'), evidenceIds: evidenceIds('boundary'), reusedByOutputIds: ['out.ts-framework-handoff', 'out.ts-order-capstone'] },
      { id: 'out.ts-module-environment', capabilityIds: ['ts.module-environment'], lessonIds: ['ts18.class-value-type', 'ts20.decorator-boundary', 'ts22.strict-baseline', 'ts24.script-module-boundary', 'ts25.declaration-file', 'ts26.package-contract'], outcomeRefs: [2, 4], expected: expected('strict 모듈 환경에서 타입/값 import와 최소 선언을 구분한다.', '설정·선언과 맞지 않는 사용이 타입 오류가 된다.', '데코레이터가 런타임 검증을 보장하지 않는다고 설명한다.'), evidenceIds: evidenceIds('module'), reusedByOutputIds: ['out.ts-framework-handoff'] },
      { id: 'out.ts-type-calculation', capabilityIds: ['ts.type-calculation'], lessonIds: ['ts27.mapped-errors'], outcomeRefs: [1, 4], expected: expected('모델 변경을 따라가는 FieldErrors를 만든다.', '존재하지 않는 필드 오류가 거부된다.', '계산 타입의 적용 범위를 설명한다.'), evidenceIds: evidenceIds('calculation'), reusedByOutputIds: ['out.ts-order-capstone'] },
      { id: 'out.ts-framework-handoff', capabilityIds: ['ts.framework-handoff'], lessonIds: ['ts31.framework-contract-handoff', 'ts32.node-module-handoff'], outcomeRefs: [3], expected: expected('React props, DTO, HTTP 포트가 같은 타입 계약을 소비한다.', '타입/값 import와 외부 JSON을 잘못 섞으면 거부된다.', 'NestJS의 애플리케이션 책임은 다음 과정에 남긴다.'), evidenceIds: evidenceIds('handoff'), reusedByOutputIds: ['out.ts-order-capstone'] },
      { id: 'out.ts-order-capstone', capabilityIds: ['ts.change-isolation'], lessonIds: ['ts33.capstone-validate', 'ts34.capstone-map-display', 'ts35.capstone-change', 'ts36.capstone-decision'], outcomeRefs: [0, 3, 4], expected: expected('유효 주문이 화면 모델로 변환되고 API 변경 뒤에도 표시 계약이 유지된다.', '잘못된 API 값이 화면에 닿기 전에 실패한다.', '검증·변환·NestJS handoff의 선택 근거와 한계를 설명한다.'), evidenceIds: evidenceIds('capstone'), reusedByOutputIds: [] },
      { id: 'out.ts-abstract-contract', capabilityIds: ['ts.abstract-contract'], lessonIds: ['ts19.abstract-contract'], outcomeRefs: [4], expected: expected('공통 구현이 있는 저장소 계약을 비교한다.', '공통 구현이 없는 추상화의 문제를 드러낸다.', '추상 클래스가 필요한 조건을 설명한다.'), evidenceIds: evidenceIds('abstract'), reusedByOutputIds: [] },
      { id: 'out.ts-enum-choice', capabilityIds: ['ts.enum-choice'], lessonIds: ['ts21.enum-or-const-object'], outcomeRefs: [4], expected: expected('상태 상수를 안전한 표현으로 만든다.', '허용되지 않은 상태가 거부된다.', 'enum과 대안의 런타임 비용을 비교한다.'), evidenceIds: evidenceIds('enum'), reusedByOutputIds: [] },
      { id: 'out.ts-function-variance', capabilityIds: ['ts.function-variance'], lessonIds: ['ts23.function-variance'], outcomeRefs: [2, 4], expected: expected('안전한 renderRow 콜백 계약을 만든다.', '더 좁은 입력만 받는 콜백이 거부된다.', '함수 매개변수 대입 규칙을 설명한다.'), evidenceIds: evidenceIds('variance'), reusedByOutputIds: [] },
      { id: 'out.ts-infer-distribution', capabilityIds: ['ts.infer-distribution'], lessonIds: ['ts28.infer-and-distribution'], outcomeRefs: [1, 4], expected: expected('함수와 유니온 구조에서 필요한 타입을 꺼낸다.', '분산 결과가 요구와 다른 경우를 드러낸다.', '튜플로 분산을 막는 이유를 설명한다.'), evidenceIds: evidenceIds('infer'), reusedByOutputIds: [] },
      { id: 'out.ts-template-branding', capabilityIds: ['ts.template-branding'], lessonIds: ['ts29.template-key-remap', 'ts30.brand-at-boundary'], outcomeRefs: [1, 4], expected: expected('제한된 키 재매핑과 검증된 OrderId를 만든다.', '잘못된 키와 검증 전 ID가 거부된다.', '조합 폭발과 브랜드 타입의 한계를 설명한다.'), evidenceIds: evidenceIds('template'), reusedByOutputIds: [] },
    ],
    evidence,
    diagnostics: [
      { lessonId: 'd1', capabilityIds: ['ts.model-foundation'], remediationOutputIds: ['out.ts-model-foundation'], includedInCompletion: false },
      { lessonId: 'd2', capabilityIds: ['ts.model-foundation'], remediationOutputIds: ['out.ts-model-foundation'], includedInCompletion: false },
      { lessonId: 'd3', capabilityIds: ['ts.runtime-boundary'], remediationOutputIds: ['out.ts-model-foundation', 'out.ts-runtime-boundary'], includedInCompletion: false },
      { lessonId: 'd4', capabilityIds: ['ts.model-foundation'], remediationOutputIds: ['out.ts-model-foundation'], includedInCompletion: false },
    ],
    lessonClassification: {
      core: ['ts01.inference-literals', 'ts02.tuple-readonly', 'ts03.top-bottom-types', 'ts04.models-alias-interface', 'ts05.unions-narrowing', 'ts06.structural-typing', 'ts07.function-contracts', 'ts08.generic-basics', 'ts09.generic-constraints', 'ts10.generic-models', 'ts11.utility-update-contract', 'ts12.conditional-response', 'ts13.unknown-guard', 'ts14.dto-to-domain', 'ts15.result-failure', 'ts16.async-awaited', 'ts17.patch-json-boundary', 'ts18.class-value-type', 'ts20.decorator-boundary', 'ts22.strict-baseline', 'ts24.script-module-boundary', 'ts25.declaration-file', 'ts26.package-contract', 'ts27.mapped-errors', 'ts31.framework-contract-handoff', 'ts32.node-module-handoff', 'ts33.capstone-validate', 'ts34.capstone-map-display', 'ts35.capstone-change', 'ts36.capstone-decision'],
      optional: ['ts19.abstract-contract', 'ts21.enum-or-const-object', 'ts23.function-variance', 'ts28.infer-and-distribution', 'ts29.template-key-remap', 'ts30.brand-at-boundary'],
    },
    handoffs: [
      { id: 'handoff.ts-react', toCourseId: 'react.foundation', providedCapabilityIds: ['ts.model-foundation', 'ts.function-contract', 'ts.framework-handoff'], requiredCapabilityIds: ['ts.model-foundation', 'ts.function-contract'], transferredOutputIds: ['out.ts-framework-handoff', 'out.ts-order-capstone'] },
      { id: 'handoff.ts-node-http', toCourseId: 'node.http', providedCapabilityIds: ['ts.runtime-boundary', 'ts.module-environment', 'ts.framework-handoff'], requiredCapabilityIds: ['ts.runtime-boundary', 'ts.module-environment'], transferredOutputIds: ['out.ts-framework-handoff', 'out.ts-order-capstone'] },
      { id: 'handoff.ts-nest', toCourseId: 'nestjs.foundation', providedCapabilityIds: ['ts.runtime-boundary', 'ts.framework-handoff', 'ts.change-isolation'], requiredCapabilityIds: ['ts.runtime-boundary', 'ts.framework-handoff'], transferredOutputIds: ['out.ts-framework-handoff', 'out.ts-order-capstone'] },
    ],
  },
};
