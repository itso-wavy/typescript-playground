# TypeScript 과정 하네스 평가

- 평가일: 2026-09-11
- 기준: `docs/superpowers/specs/2026-09-11-fullstack-curriculum-harness-design.md`
- 평가 대상: `src/curriculum/*.ts`의 실습 36개와 `src/curriculum/course.ts`, 관련 검사 코드
- 제외: 과거 평가서, 외부 목차, 이전 결론
- 최종 판정: **revise**

## 판정 요약

현재 과정은 대상 학습자, 관찰 가능한 수료 행동, 개별 코드 실습과 타입·런타임 검사를 갖고 있다. 그러나 하네스가 요구하는 capability ownership, 선수 능력 계약과 handoff, 세 숙달 축의 유효 증거, 진단 보완 경로, core/optional 분류, output의 정상·실패·경계 계약, 실행 환경, 전문 리뷰 policy가 없다. 따라서 현재 구조는 개별 실습 카탈로그로는 작동하지만 하네스 수료 과정으로는 승인할 수 없다.

| 항목 | 판정 | 현재 근거 |
| --- | --- | --- |
| 대상 학습자 | PASS | JavaScript·npm·React 기초를 전제로 명시한다. `src/curriculum/course.ts:4-10` |
| 관찰 가능한 도착점 | PASS | 여섯 수료 행동과 단계별 연결이 있다. `src/curriculum/course.ts:12-26` |
| TS 과정 책임 범위 | FAIL | 클래스/데코레이터 실습과 strict 설정 자체를 구성·검증하는 output이 없다. |
| capability ownership | FAIL | `ownerCourseId`, capability registry, classification이 없다. |
| 선수 능력·handoff | FAIL | `prerequisiteCapabilityIds`, handoff, version constraint가 없다. |
| output·증거 계약 | FAIL | `Output.expected`, evidence ID, environment ID가 없다. |
| 이해·적용·설명 수료 증거 | FAIL | 개념 설명과 코드 통과는 있으나 학습자 이해·설명 평가 증거가 없다. |
| 진단·보완 | FAIL | 진단은 선택 사항이며 remediation output·waiver policy가 없다. |
| 전문 검토·독립 검증 | FAIL | review policy, blocking, fallback, independent verifier가 없다. |

개별 코드 통과 상태는 저장된다. `src/learning/LessonPage.tsx:158-184` 다만 이는 과정 capability의 세 숙달 축을 입증하는 evidence registry가 아니다. 선택 interview도 답변을 저장하거나 채점하지 않는다. `src/learning/ReviewPanel.tsx:15-27`

## 대상과 도착점

대상 정의는 현재 출발점과 맞는다. TypeScript 기본 문법을 아는 학습자를 전제로 제네릭, 안전한 외부 경계, React 계약, 모듈 타입 문제와 주문 데이터 흐름을 다룬다. `src/curriculum/course.ts:4-26`

하네스의 TS 책임은 안전한 모델링, 타입 관계, 클래스·모듈·strict 설정, 런타임 경계와 후속 과정에 전달할 계약이다. 현재는 제네릭·타입 변환·외부 경계·React·모듈 타입을 다루지만 클래스/데코레이터와 strict 설정 output이 빠져 있어 과정 책임 전체는 충족하지 못한다. `src/curriculum/generics.ts:8-15`, `src/curriculum/boundaries.ts:14-91`, `src/curriculum/integration.ts:10-85`

## 현재 흐름

공개 흐름은 `generics → transforms → boundaries → react → integration → capstone`이며, 모든 practice ID를 한 번씩 수료 목표에 연결한다. `src/curriculum/course.ts:20-26`

실행 검사는 published solution·대체안·대표 invalid source를 확인한다. `tests/compiler-matrix.test.ts:13-31` 런타임 실습은 브라우저에서 passing candidate와 invalid variant를 확인한다. `tests/e2e/curriculum-runtime.spec.ts:57-108` 이는 각 실습의 코드 계약 검증에는 유효하지만 과정 output의 정상·실패·경계 evidence와 전문 검토를 대체하지 않는다.

## 36개 실습 capability와 숙달 축 매핑

표기: `U`는 학습 설명이 제공됨, `A`는 코드 실행 또는 타입 검사 가능, `E`는 학습자 설명을 평가·저장하는 수료 증거가 없음, `I`는 선택·무채점 interview다. 따라서 모든 행의 U/A는 하네스 `requiredEvidence`가 아니라 현재 콘텐츠 기능이며, 모든 행은 세 축 수료 증거 기준에서는 FAIL이다.

| ID | 현재 capability | U | A | E |
| --- | --- | --- | --- | --- |
| g01 | 제네릭 함수의 입력·반환 타입 관계 | 설명 | 실행 | 없음 |
| g02 | 콜백 반환 타입 제네릭 추론 | 설명 | 실행 | 없음 |
| g03 | 입력/출력 제네릭 분리 | 설명 | 실행 | 없음 |
| g04 | 제네릭 최소 제약 | 설명 | 실행 | 없음 |
| g05 | `keyof` 키 제한 | 설명 | 실행 | 없음 |
| g06 | `T[K]` 키-값 관계 | 설명 | 실행 | 없음 |
| g07 | 제네릭 페이지 응답 타입 | 설명 | 타입검사 | 없음 |
| g08 | 제네릭과 문자열 유니온 선택 | 설명 | 실행 | I |
| t09 | `satisfies`·`as const` 리터럴 보존 | 설명 | 타입검사 | 없음 |
| t10 | `Pick`·`Partial` 수정 DTO | 설명 | 타입검사 | 없음 |
| t11 | 매핑 타입 필드 오류 모델 | 설명 | 타입검사 | 없음 |
| t12 | 키 재매핑 공개 모델 | 설명 | 타입검사 | 없음 |
| t13 | 조건부 타입 요청-응답 관계 | 설명 | 타입검사 | 없음 |
| t14 | `infer` Promise 성공값 추출 | 설명 | 타입검사 | 없음 |
| t15 | 분산 조건부 타입·유니온 전체 검사 | 설명 | 타입검사 | 없음 |
| t16 | 템플릿 리터럴 이벤트 이름 | 설명 | 타입검사 | I |
| b17 | 판별 유니온 요청 상태 | 설명 | 실행 | 없음 |
| b18 | 사용자 타입 가드 | 설명 | 실행 | 없음 |
| b19 | `unknown` 응답을 Payment로 검증·변환 | 설명 | 실행 | 없음 |
| b20 | DTO를 화면 모델로 변환 | 설명 | 실행 | 없음 |
| b21 | `Result`로 예상 실패 표현 | 설명 | 실행 | I |
| b22 | 브랜드 ID와 런타임 검증 | 설명 | 실행 | I |
| r23 | `ComponentProps`로 props 재사용 | 설명 | React 실행 | 없음 |
| r24 | 판별 유니온 링크/버튼 props | 설명 | React 실행 | 없음 |
| r25 | 제네릭 목록 컴포넌트 계약 | 설명 | React 실행 | 없음 |
| r26 | `ChangeEvent`와 입력 검증 | 설명 | React 실행 | 없음 |
| r27 | reducer 액션 판별 유니온 | 설명 | 실행 | 없음 |
| r28 | Context Provider null 경계 | 설명 | React 실행 | I |
| p29 | 콜백 variance·`strictFunctionTypes` | 설명 | 타입검사 | 없음 |
| p30 | `.d.ts` 모듈 표면 선언 | 설명 | 타입검사 | 없음 |
| p31 | `import type` 값/타입 경계 | 설명 | 타입검사 | 없음 |
| p32 | optional·`null`·JSON 수정 의도 | 설명 | 실행 | I |
| c33 | API Order 검증·도메인 모델 변환 | 설명 | 실행 | 없음 |
| c34 | Patch 허용 필드·생략·값 검증 | 설명 | 실행 | 없음 |
| c35 | overload 입력별 반환 계약 | 설명 | 실행 | 없음 |
| c36 | 변경 API를 변환 경계에서 흡수 | 설명 | 실행 | I |

실습 원본 근거는 `src/curriculum/generics.ts:8-15`, `src/curriculum/transforms.ts:12-19`, `src/curriculum/boundaries.ts:14-91`, `src/curriculum/react.ts:12-64`, `src/curriculum/integration.ts:10-85`, `src/curriculum/capstone.ts:12-92`이다.

## 선수 순서와 전이

공개 lesson 순서는 PASS다. course flow와 공개 배열 순서가 일치하고, 품질 검사는 중복 lesson ID와 순서 불일치를 검사한다. `src/curriculum/course.ts:20-26`, `scripts/verify-curriculum-quality.mjs:149-172`

그러나 capability 선수 관계는 FAIL이다. 과정에 prerequisite capability, output handoff, 버전 제약이 없으므로 다음 과정에 전달할 능력을 기계적으로 판정할 수 없다. 진단 `d1`~`d4`는 선택 진단일 뿐 실패 시 복습 output이나 waiver 경로가 없다. `src/curriculum/diagnostics.ts:8-50`

전이도 FAIL이다. c33~c36은 같은 주문 도메인을 사용하지만 각각 독립 starter를 제공한다. c33은 앞 단계 결과 없이 시작하도록 필요한 파일을 제공한다고 명시한다. `src/curriculum/capstone.ts:16-28` 따라서 API 응답 검증 → 앱 모델 → 수정 요청 → 화면 표시가 하나의 제공 프로젝트 output으로 이어진다는 하네스 도착점을 증명하지 못한다.

## 반복과 중복

하네스 수준에서는 capability ID와 output 재사용 링크가 없으므로 중복 판정이 불가능하며 FAIL이다.

내용상 다음은 반복의 목적을 capability·전이 요구로 명시해야 한다.

- `b19`와 `c33`: `unknown` 객체를 검증해 도메인 모델로 변환한다.
- `t10`, `p32`, `c34`: 수정 DTO와 생략/`undefined`/`null`의 의미를 다룬다.
- `t12`, `t16`: `keyof`와 템플릿 리터럴을 이용해 키를 계산한다.

이들은 변경 요구나 더 넓은 output을 제공하면 유효한 반복이 될 수 있다. 현재에는 그런 연결 정보가 없어 의도된 반복인지 불필요한 중복인지 판정할 수 없다.

## 핵심 누락

- 클래스의 타입 성질과 데코레이터 기초가 없다.
- strict 설정을 직접 구성하고 옵션 차이를 검증하는 output이 없다. p29는 `strictFunctionTypes` 결과만 다룬다. `src/curriculum/integration.ts:10-25`
- 하나의 제공 프로젝트에서 API 검증, 앱 모델 변환, 수정 요청, React 표시, 변경 요구와 설명을 연결하는 과정 종합 output이 없다.
- 각 output의 정상·실패·경계 expected, execution environment, freshness evidence가 없다.
- 전문 review policy, blocking remediation, fallback, 독립 verifier가 없다.

## core/optional 권고

현재 모든 실습은 같은 `practice`일 뿐 core/advanced 분류가 없으므로 FAIL이다.

| 분류 | 권고 항목 |
| --- | --- |
| core | g01–g08, t09–t11·t13, b17–b21, r23·r24·r26–r28, p30–p32, c33·c34·c36, 새 클래스/strict/통합 output |
| optional/advanced | t12, t14, t15, t16, b22, p29, r25, c35 |

분류는 기술의 유명세가 아니라 TS 과정 도착점과 이후 React·Node·HTTP 계약에 필수인지로 결정해야 한다.

## 총량과 배분

현재 `practicePlan`은 `minimum: 1`, `maximum: 100`, `decision: pending`이고, 품질 검사도 `approved` 또는 `revise`가 아니면 실패시킨다. `src/curriculum/course.ts:28-33`, `scripts/verify-curriculum-quality.mjs:174-183`

권고 범위는 **core 30~32개 + optional 5~7개, 총 35~39개**다.

| 영역 | core 권고 수 | 이유 |
| --- | ---: | --- |
| 타입 관계·안전 모델링 | 10~11 | 재사용 가능한 함수·모델·요청 계약을 반복 적용한다. |
| 런타임 경계·DTO·실패 처리 | 7~8 | 정상·실패·경계 입력을 거쳐야 한다. |
| 클래스·모듈·strict 설정 | 5~6 | 현재 모듈 일부만 있고 클래스·설정 output이 빠졌다. |
| React 타입 계약 | 4~5 | TypeScript 결과를 UI 경계에 적용한다. |
| 통합·변경 요구 전이 | 4~5 | 앞 output을 재사용하고 변경 요구에 다시 적용한다. |
| 선택 심화 | 5~7 | 고급 타입 계산과 variance·overload를 문제 조건에 따라 제공한다. |

36개라는 숫자는 이 범위 안에 있으나, 현재 배분은 승인할 수 없다. 고급 타입 일부를 optional로 분리하고, 누락된 클래스·strict·실제 통합 전이를 넣은 뒤 수를 다시 산정해야 한다.

## 다음 구성 수정 순서

1. TS 과정 manifest와 capability registry를 만들고, 각 core capability에 단일 owner·선수 capability·세 축 evidence를 등록한다.
2. 진단 d1~d4를 baseline capability와 remediation output에 연결하고, 미통과 상태와 waiver 정책을 명시한다.
3. 36개 실습을 core/optional로 분류하고, 위의 중복 후보에는 반복 목적과 이전 output 재사용을 연결한다.
4. 클래스/데코레이터 기초와 strict 설정을 다루는 core output을 추가한다.
5. c33~c36을 하나의 제공 프로젝트 기반 통합 output으로 재구성해 API 검증, 모델 변환, 수정, React 표시, 변경 요구, 설명을 하나의 evidence chain으로 만든다.
6. 모든 output에 normal/failure/boundary expected, 환경 격리, fixture, review policy, remediation output, 독립 verifier를 연결한다.
7. 위 연결 후 실습 총량을 capability coverage와 반복·전이 필요성으로 재산정하고 `practicePlan.decision`을 `approved` 또는 `revise`로 기록한다.
