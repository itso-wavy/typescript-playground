# TypeScript 커리큘럼 acceptance matrix

## 설계 원칙

학습 흐름은 다음 순서를 고정한다.

> 스택 소개 페이지 → 키워드 우선 목차 → 레슨 제목·설명 → 이야기 → 실습 → 피드백·인터뷰

이야기는 개념을 기억하게 하는 맥락이고, 진입점은 키워드다. 학습자는 먼저 `keyof`, `unknown`, `Result` 같은 말을 찾아 들어올 수 있어야 하며, 레슨을 끝낸 뒤에는 코드로 관찰 가능한 행동을 보여야 한다. 인터뷰는 이야기를 다시 말하는 자리가 아니라 그 행동의 이유와 한계를 확인하는 자리다.

판정 표의 `정렬`은 제목의 키워드, 이야기, 실습, 인터뷰가 같은 학습 행동을 가리킨다는 뜻이다. `부분`은 실습은 유효하지만 키워드나 인터뷰 연결이 약하다는 뜻이다. `약함`은 스토리가 실습보다 앞서거나 핵심 행동을 흐리는 상태다.

## 챕터 계획

| 장 | 제안 레이블 | 역할 |
|---|---|---|
| 0 | 진단: 타입 오류 읽기 | 선택 진단. `const`, 유니온 좁히기, `unknown`, 구조적 타이핑의 현재 위치를 확인한다. |
| 1 | 제네릭: 관계를 보존하기 | 입력·출력·키·값 사이의 타입 관계를 만든다. |
| 2 | 타입 계산: 타입을 변환하기 | 유틸리티, 매핑, 조건부, `infer`, 템플릿 리터럴을 계산한다. |
| 3 | 경계: 외부 값을 검증하기 | `unknown`을 앱 모델로 바꾸고 실패·식별자 계약을 드러낸다. |
| 4 | React: 컴포넌트 계약 연결하기 | props, 이벤트, 목록, reducer, Context의 계약을 연결한다. |
| 5 | 통합: 라이브러리와 모듈 경계 | callback variance, 선언 파일, `import type`, patch 의미를 다룬다. |
| 6 | 캡스톤: 주문 경계를 완성하기 | 검증·Patch·제네릭 목록·API 변경 대응을 하나의 흐름으로 묶는다. |

## 40개 레슨 acceptance matrix

| ID | navTitle / title | primary keyword | prerequisite | 관찰 가능한 학습자 행동 | exercise/story 정렬 | 인터뷰 relevance | 판정 |
|---|---|---|---|---|---|---|---|
| d1 | const vs let / const와 let의 타입 추론 차이 | literal inference | 없음 | `const` 또는 명시적 유니온으로 호출 오류를 고친다 | 부분: 진단 행동은 명확하나 스토리가 길다 | 낮음: 선택 진단 | keep (optional) |
| d2 | 유니온 좁히기 / 판별자로 유니온 타입 좁히기 | discriminated union | 없음 | `kind`를 검사한 뒤 해당 필드만 읽는다 | 정렬 | 중간 | keep |
| d3 | unknown 검증 / unknown 값의 타입 가드 작성하기 | unknown, type guard | d2 | null·객체·속성 타입을 확인하고 안전한 값을 반환한다 | 정렬 | 중간 | keep |
| d4 | 초과 속성 / 구조적 타이핑과 초과 속성 검사 | structural typing, excess property | d2 | 최소 구조와 객체 리터럴 오타 검사를 구분한다 | 정렬 | 높음: 기존 interview가 핵심 한계를 확인 | keep |
| g01 | 제네릭 first / 배열 원소 타입을 제네릭으로 보존하기 | generic function | d1 | `T`와 `T \| undefined`로 입력·출력 관계를 보존한다 | 정렬 | 낮음 | keep |
| g02 | 콜백 추론 / 콜백 결과 타입을 제네릭으로 추론하기 | generic inference | g01 | 콜백 반환 타입이 결과 배열 원소 타입이 되게 한다 | 정렬 | 낮음 | keep |
| g03 | 입출력 제네릭 / 입력과 출력 타입이 다른 제네릭 함수 | two type parameters | g02 | `T` 입력과 `U` 결과를 분리해 map 함수를 작성한다 | 정렬 | 낮음 | keep |
| g04 | 제네릭 조건 / 제네릭 타입 매개변수에 최소 조건 지정하기 | `extends` constraint | g03 | `id`만 보장하는 최소 제약으로 여러 모델을 받는다 | 정렬 | 낮음 | keep |
| g05 | keyof / keyof로 객체의 키 제한하기 | `keyof` | g04 | 존재하는 키만 받도록 호출 계약을 좁힌다 | 정렬 | 중간 | keep |
| g06 | T[K] / 인덱스 접근 타입으로 키와 값 연결하기 | indexed access type | g05 | 선택한 키에 맞는 정확한 반환 타입을 얻는다 | 정렬 | 중간 | keep |
| g07 | 제네릭 Page / 제네릭 타입 별칭으로 페이지 응답 재사용하기 | generic type alias | g03 | 공통 페이지 구조와 `items` 원소 타입을 재사용한다 | 정렬 | 낮음 | keep |
| g08 | 유니온 선택 / 제네릭 대신 문자열 유니온 선택하기 | string literal union | g04 | 타입 관계가 없는 API에서 불필요한 제네릭을 제거한다 | 정렬 | 높음: 기존 interview가 선택 근거 확인 | keep |
| t09 | satisfies + as const / satisfies와 as const로 리터럴 타입 보존하기 | `satisfies`, `as const` | g08 | 계약을 검사하면서 값의 구체적 리터럴을 보존한다 | 정렬 | 낮음 | keep |
| t10 | Pick + Partial / Pick과 Partial로 수정 요청 타입 만들기 | `Pick`, `Partial` | g05 | 수정 가능한 필드만 optional 요청으로 만든다 | 정렬 | 낮음 | keep |
| t11 | mapped type / 매핑된 타입으로 필드별 오류 표현하기 | mapped type | g05 | 모델 키마다 선택적 오류 배열을 계산한다 | 정렬 | 낮음 | keep |
| t12 | 키 재매핑 / 키 재매핑으로 공개 필드 이름 만들기 | key remapping, template literal | t11 | 모든 문자열 키에 `metric_` 접두사를 계산한다 | 정렬 | 낮음 | keep |
| t13 | 조건부 타입 / 조건부 타입으로 요청별 응답 타입 선택하기 | conditional type | g07 | 입력 모양에 따라 단일 문서 또는 배열 타입을 선택한다 | 정렬 | 중간 | keep |
| t14 | infer / infer로 Promise 성공 값 추출하기 | `infer` | t13 | 함수 타입에서 Promise 성공 값만 추출한다 | 정렬 | 낮음 | keep |
| t15 | 분산 조건부 / 분산 조건부 타입과 유니온 전체 검사 | distributive conditional | t13 | 분산 계산과 튜플로 전체 검사하는 차이를 코드로 보여 준다 | 정렬 | 높음: 현재 interview가 t16에 있지만 주제는 t15 | rewrite |
| t16 | 템플릿 이벤트 / 템플릿 리터럴 타입으로 이벤트 이름 계산하기 | template literal type | t12, t15 | 모델 키에서 `nameChanged` 같은 이벤트 유니온을 계산한다 | 부분: 실습은 단순하지만 story·interview가 분산 조건부로 어긋남 | 낮음·불일치 | rewrite |
| b17 | 요청 상태 / 판별 유니온으로 요청 상태 모델링하기 | exhaustive discriminated union | d2 | loading·success·error를 분리하고 `never`로 누락을 잡는다 | 정렬 | 중간 | keep |
| b18 | 주소 가드 / 타입 가드로 주소 값 검증하기 | user-defined type guard | d3 | 빈 값·공백·null·배열을 거절하는 가드를 작성한다 | 부분: 행동은 좋지만 주소 도메인이 키워드를 가림 | 낮음 | rewrite |
| b19 | unknown → Payment / unknown 응답을 Payment로 변환하기 | runtime validation | b18 | 외부 값을 필드별로 검사한 새 `Payment`를 반환한다 | 정렬 | 중간 | keep |
| b20 | DTO 변환 / DTO를 화면 모델로 변환하기 | DTO mapping | b19 | 날짜·null·필드명을 화면 모델 경계에서 변환한다 | 정렬 | 낮음 | keep |
| b21 | Result 타입 / Result 타입으로 성공과 실패 표현하기 | `Result<T, E>` | b19 | 예상 가능한 실패를 throw 대신 판별된 반환값으로 처리한다 | 부분: story는 좋지만 async·Result·검증 행동이 한 번에 섞임 | 낮음 | rewrite |
| b22 | 브랜드 ID / 브랜드 타입으로 식별자 구분하기 | branded type | b19 | 접두사를 검증한 뒤 UserId와 OrderId 혼용을 막는다 | 정렬 | 높음: 기존 interview가 컴파일/런타임 경계를 확인 | keep |
| r23 | ComponentProps / ComponentProps로 기존 Button props 재사용하기 | `ComponentProps` | g05, React props 기초 | 기존 props를 보존하며 `trackingId`를 추가한다 | 정렬 | 낮음 | keep |
| r24 | 링크 vs 버튼 / 판별 유니온으로 링크와 버튼 props 나누기 | discriminated props union | b17, r23 | link·button별 필수/금지 props를 컴파일 오류로 만든다 | 정렬 | 중간 | keep |
| r25 | 제네릭 목록 / 제네릭 컴포넌트로 목록 타입 연결하기 | generic component | g03, React JSX | items·renderItem·getKey가 같은 `T`를 공유하게 한다 | 정렬 | 낮음 | keep |
| r26 | ChangeEvent / ChangeEvent로 입력 이벤트 타입 지정하기 | `ChangeEvent` | d3, React event | 문자열 입력을 검증한 뒤 유효한 number만 콜백에 전달한다 | 정렬 | 낮음 | keep |
| r27 | reducer 액션 / 판별 유니온으로 reducer 액션 모델링하기 | reducer action union | b17, r24 | 액션별 필드와 exhaustive switch를 작성한다 | 정렬 | 낮음 | keep |
| r28 | Context Hook / Context와 전용 Hook으로 null 처리하기 | Context, null guard | d3, React hooks | Provider 누락을 Hook에서 설명 있는 오류로 바꾼다 | 정렬 | 높음: 기존 interview가 기본값 위험을 확인 | keep |
| p29 | 콜백 계약 / 라이브러리 콜백 타입 계약 지키기 | callback variance | g04, r25 | 라이브러리 콜백보다 좁은 매개변수를 요구하지 않는다 | 부분: 실습은 정확하나 variance 용어 진입이 급함 | 낮음 | rewrite |
| p30 | 모듈 선언 / 외부 모듈에 사용하는 API만 선언하기 | `declare module`, `.d.ts` | b19, p29 | any 대신 실제 사용하는 함수·이벤트 계약만 선언한다 | 부분: story는 명확하나 선언과 런타임 검증 경계가 약함 | 낮음 | rewrite |
| p31 | import type / import type으로 실행 값과 타입 분리하기 | `import type` | p30 | 타입 import가 번들 실행 의존성으로 남지 않게 분리한다 | 정렬 | 낮음 | keep |
| p32 | optional vs null / optional과 null로 수정 의도 구분하기 | exact optional, null | t10, b20 | 생략·문자열 수정·null 삭제를 서로 다른 JSON 의도로 만든다 | 정렬 | 높음: 기존 interview가 undefined 직렬화 한계를 확인 | keep |
| c33 | 주문 검증 / 주문 API 응답을 앱 모델로 변환하기 | boundary validation | b19, b20 | 네 필드를 검증한 뒤 안전한 Order만 반환한다 | 정렬 | 중간 | keep |
| c34 | 주문 Patch / 주문 수정 요청 타입 제한하기 | `Pick`, `Partial`, patch boundary | t10, c33 | title·quantity만 허용하고 undefined 키를 생략한다 | 부분: t10 반복이 많고 runtime 검증 목표가 섞임 | 중간 | rewrite |
| c35 | 주문 목록 / 제네릭 목록으로 주문 데이터 타입 연결하기 | generic React list | r25, c33 | Order와 renderItem을 연결해 화면에 title·quantity를 표시한다 | 부분: r25의 반복처럼 보이며 story가 새 행동을 약하게 설명 | 낮음 | rewrite |
| c36 | API 변환 경계 / 변경된 API 필드를 변환 경계에서 처리하기 | DTO adapter, regression | c33, c34 | `units`만 받아 기존 `quantity` 모델로 변환하고 옛 형식은 거절한다 | 정렬 | 높음: 기존 interview가 영향 범위와 회귀를 확인 | keep |

## 우선 수정할 레슨

### t16 — 템플릿 리터럴 타입

실습 목표는 `ChangeEvent<T>`의 이벤트 이름 계산인데 현재 인터뷰 질문은 분산 조건부 타입과 튜플에 관한 내용이다. 인터뷰를 `모델에 새 키를 추가하면 이벤트 유니온이 어떻게 바뀌며, 템플릿 리터럴 타입을 무제한으로 쓰면 어떤 비용이 생기는가?`로 교체한다. story도 “이벤트 이름 오타”와 “키 추가 시 자동 갱신” 두 행동만 남기고, 분산 조건부 설명은 t15의 인터뷰로 이동한다. 판정은 `rewrite`다.

### b18 — 주소 값 검증

`주소`는 예시 도메인일 뿐인데 제목과 목차에서 핵심 키워드인 사용자 정의 타입 가드가 보이지 않는다. navTitle을 `타입 가드` 또는 `value is`로 바꾸고, 설명 첫 문장에서 `value is WithAddress`를 제시한다. exercise에는 `null`, 배열, 키 누락, 빈 문자열, 공백 문자열의 다섯 입력을 고정해 “컴파일러를 속이는 가드”와 “실제 검증”을 구분하게 한다. 판정은 `rewrite`다.

### b21 — Result 타입

현재 한 레슨에 `Result`, `async`, 숫자 파싱, 실패 메시지가 동시에 들어가 키워드와 행동이 분산된다. 제목과 navTitle은 유지하되 primary keyword를 `Result<T, E>`로 선명하게 하고, exercise는 동기 `parseQuantity`로 먼저 단순화한다. 후속 설명에서 네트워크 예외와 `throw`의 범위를 짧게 비교하고, 인터뷰를 “예상 가능한 실패와 예외를 언제 반환값/throw로 나누는가?”로 추가한다. 판정은 `rewrite`다.

### p29 — 라이브러리 콜백 계약

학습자가 먼저 볼 말은 `callback parameter`, `strictFunctionTypes`, “더 좁은 콜백 금지”다. navTitle을 `callback variance`로 보강하고, story를 표 컴포넌트보다 “호출자가 어떤 값을 넘길 수 있는가”라는 계약으로 시작한다. exercise에는 정상 `RowRenderer`와 `vip`를 요구하는 잘못된 콜백을 나란히 두고, 피드백은 호출자 관점의 한 문장으로 끝낸다. 판정은 `rewrite`다.

### p30 — 외부 모듈 선언

`declare module`과 `.d.ts`가 핵심인데 story의 analytics 사례가 먼저 읽힌다. 제목 설명 앞에 “타입 없는 모듈을 `any`로 두지 않고 사용하는 표면만 선언한다”를 넣고, exercise를 `track` 한 함수·두 이벤트·payload 한 종류로 제한한다. 인터뷰에는 “선언 파일이 실제 JavaScript의 런타임 동작까지 검증하지 않는 이유”를 추가한다. 판정은 `rewrite`다.

### c34 — 주문 Patch

t10의 `Pick + Partial`을 다시 쓰는 레슨이므로 새 행동은 “타입 제한”이 아니라 “생략과 검증을 포함한 요청 경계”여야 한다. `OrderPatch` 계산은 짧은 복습으로 남기고, 관찰 기준을 `id/editable 거절`, `undefined 키 생략`, `quantity`의 정수·범위 검사로 고정한다. 제목 설명에 `optional field omission`을 드러내고, t10과의 차이를 “타입 계산 대 런타임 변환”으로 명시한다. 판정은 `rewrite`다.

### c35 — 주문 목록

r25와 코드 형태가 겹치므로 “제네릭 목록 작성”을 다시 평가하는 레슨이 되면 안 된다. Order 모델을 고정한 뒤, 학습자가 `renderItem`이 Order의 `title`과 `quantity`만 읽고 다른 타입은 거절되는지 확인하는 통합 exercise로 바꾼다. 가능하면 navTitle을 `Order renderItem`으로 바꾸고, story는 “API 검증 후 화면 모델을 목록에 연결”하는 두 경계를 강조한다. 판정은 `rewrite`다.

### d1 — 선택 상태

d1은 현재 진단 장의 선택 레슨으로 유지할 수 있다. 다만 본문 진도나 인터뷰에 포함하지 않고, 소개 페이지에서 “literal inference 빠른 진단”으로 명시한다. 학습자가 `const`와 `let`의 차이를 이미 안다면 건너뛸 수 있어야 하며, 나중에 정식 레슨으로 승격할 경우 `literal widening`을 primary keyword로 바꾸고 관찰 행동을 여러 입력으로 확장한다.

## 새 기술 스택을 추가하기 전 acceptance checklist

- [ ] 소개 페이지에 스택의 사용 맥락과 선수 지식이 한 문단으로 있다.
- [ ] 키워드 우선 목차에서 학습자가 검색할 용어(`navTitle`)로 레슨에 바로 들어갈 수 있다.
- [ ] 제목과 description의 첫 문장이 실제로 연습할 타입·API·패턴을 말한다.
- [ ] story는 키워드를 가리지 않고, exercise가 해결할 사용자 문제와 1:1로 연결된다.
- [ ] starter와 solution의 차이를 한 문장으로 설명할 수 있다.
- [ ] 성공 여부를 코드 실행, 타입 오류, 렌더 결과, 반환값 중 하나로 관찰할 수 있다.
- [ ] 최소 하나의 plausible invalid variant가 핵심 계약을 실제로 거부한다.
- [ ] prerequisite가 목차 순서와 일치하고, 앞 레슨의 용어를 설명 없이 과도하게 재사용하지 않는다.
- [ ] 피드백이 정답 코드가 아니라 실패한 계약과 다음 수정 행동을 말한다.
- [ ] 인터뷰는 story 회상이 아니라 코드의 선택·한계·경계를 묻고, answer/points가 같은 keyword를 쓴다.
- [ ] 기존 레슨과 중복되는 경우 새 syntax가 아니라 새 관찰 행동 또는 통합 경계가 있는지 확인한다.
- [ ] runtime 검증이 필요한 레슨은 `as`, `fetch<T>`, 선언 파일만으로 안전하다고 주장하지 않는다.
- [ ] 새 장을 publish하기 전에 제목·navTitle·summary·story·mission·interview를 함께 검토한다.
- [ ] 커리큘럼 검증에서 전체 레슨 수, fixture, valid/invalid matrix가 통과한다.

