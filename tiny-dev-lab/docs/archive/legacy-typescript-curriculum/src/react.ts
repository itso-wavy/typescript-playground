import type { Lesson } from '../shared/contracts.js';

const checkedAt = '2026-09-08';
const reactSource = { title: 'React에서 TypeScript 사용하기', url: 'https://react.dev/learn/typescript' };
const minutesByOrder: Record<number, 5 | 6 | 7> = { 23: 6, 24: 6, 25: 7, 26: 6, 27: 6, 28: 5 };
function lesson(data: Omit<Lesson, 'kind' | 'checkedAt' | 'compilerVersion' | 'revision' | 'minutes'>): Lesson {
  return { ...data, kind: 'practice', checkedAt, compilerVersion: '7.0.2', revision: 1, minutes: minutesByOrder[data.order] };
}

export const lessons: Lesson[] = [
  lesson({
    id: 'r23', chapter: 4, order: 23, title: 'ComponentProps로 기존 Button props 재사용하기', navTitle: 'ComponentProps', summary: 'ComponentProps로 기존 Button props를 가져와 새 trackingId와 결합합니다.',
    story: '디자인 시스템의 Button에 추적 ID를 붙인 뒤 disabled와 onClick이 사라져 호출부가 줄줄이 깨졌습니다. 이미 검증된 컴포넌트의 설정을 다시 복사하지 않고, 필요한 값만 안전하게 더해 보세요.',
    concept: ['컴포넌트 props를 직접 복사하면 원본 Button이 바뀔 때 새 컴포넌트가 뒤처집니다. 현재 계약을 읽어 오는 도구가 ComponentProps<typeof Button>입니다.', '기존 이름을 바꿔야 할 때는 Omit으로 충돌하는 필드를 빼고 새 계약을 더합니다. children처럼 React가 화면에 넣는 값은 ReactNode로 표현할 수 있습니다.'],
    mission: '기존 Button 계약을 그대로 유지하면서 trackingId가 필요한 TrackedButton을 만드세요.', goals: ['disabled와 onClick을 그대로 사용할 수 있다.', 'trackingId는 필수이고 Button에 없는 href는 받을 수 없다.'], hints: ['먼저 Button의 현재 props를 ComponentProps로 읽으세요.', 'Button에 href가 없다는 점을 확인하세요.', '기존 props와 새 props를 &로 합치세요.'],
    starter: { 'index.tsx': `import type { ComponentProps } from 'react';\nexport function Button(props: { disabled?: boolean; onClick?: () => void; children: string }) { return <button {...props} />; }\nexport type TrackedButtonProps = {};\nexport function TrackedButton(_props: TrackedButtonProps) { return <button />; }` },
    solution: { 'index.tsx': `import type { ComponentProps } from 'react';\nexport function Button(props: { disabled?: boolean; onClick?: () => void; children: string }) { return <button {...props} />; }\nexport type TrackedButtonProps = Omit<ComponentProps<typeof Button>, 'children'> & { children: string; trackingId: string };\nexport function TrackedButton({ trackingId, ...props }: TrackedButtonProps) { return <Button {...props} />; }` },
    editableFiles: ['index.tsx'], mode: 'react', sources: [reactSource], explanation: ['props를 직접 복사하면 원래 Button의 props가 바뀔 때 TrackedButton이 뒤처집니다.', 'trackingId는 Button에 전달하지 않고 TrackedButton 안에서 사용하므로 DOM에 알 수 없는 속성이 내려가지 않습니다.'],
  }),
  lesson({
    id: 'r24', chapter: 4, order: 24, title: '판별 유니온으로 링크와 버튼 props 나누기', navTitle: '링크 vs 버튼', summary: '상품 화면에서 페이지 이동 링크와 구매 버튼의 props를 판별 유니온으로 나눠, 각 방식에 필요한 값만 전달되게 합니다.',
    story: '상품 목록 화면의 “상세 보기”는 다른 페이지로 이동하므로 href가 필요하고, “장바구니 담기”는 현재 화면에서 동작하므로 onClick이 필요합니다. 공통 ActionButton의 모든 props를 optional로 두자 href 없는 링크와 href가 섞인 구매 버튼이 함께 렌더링됐습니다. 두 사용 방식을 타입으로 나눠 잘못된 조합을 호출부에서 막아 보세요.',
    concept: ['모든 props를 optional로 만들면 href 없는 링크와 href가 섞인 버튼까지 통과합니다.', 'as처럼 사용 방식을 나타내는 값을 기준으로 타입을 나누면 호출부와 함수 안에서 올바른 props만 남습니다. 이 구분된 묶음이 판별 유니온입니다.'],
    mission: 'ActionButton이 link 방식과 button 방식을 각각 올바르게 받도록 타입을 작성하세요.', goals: ['link 방식에서는 href가 필수다.', 'button 방식에서는 onClick이 필수이고 href는 받을 수 없다.'], hints: ['as: link와 as: button을 두 타입으로 나누세요.', '각 방식에서 사용하지 않는 필드는 never로 적으세요.', '구현은 as 값을 기준으로 나누세요.'],
    starter: { 'index.tsx': `export type ActionButtonProps = { as?: 'link' | 'button'; href?: string; onClick?: () => void; label: string };\nexport function ActionButton({ label }: ActionButtonProps) { return <button>{label}</button>; }` },
    solution: { 'index.tsx': `export type ActionButtonProps =\n  | { as: 'link'; href: string; onClick?: never; label: string }\n  | { as: 'button'; onClick: () => void; href?: never; label: string };\nexport function ActionButton(props: ActionButtonProps) {\n  return props.as === 'link' ? <a href={props.href}>{props.label}</a> : <button onClick={props.onClick}>{props.label}</button>;\n}` },
    editableFiles: ['index.tsx'], mode: 'react', sources: [reactSource], explanation: ['optional props만 모으면 href가 없는 링크나 href와 onClick이 함께 있는 버튼을 막을 수 없습니다.', '사용 방식을 구분하는 값을 둔 타입 유니온은 호출자에게 필요한 props를 빠뜨리지 않게 하고, 컴포넌트 안에서도 안전한 분기를 가능하게 합니다.'],
  }),
  lesson({
    id: 'r25', chapter: 4, order: 25, title: '제네릭 컴포넌트로 목록 타입 연결하기', navTitle: '제네릭 목록', summary: '제네릭으로 목록 원소와 renderItem·getKey의 타입 관계를 연결합니다.',
    story: '재사용 목록이 any[]를 받아 주문을 그려야 할 자리에 사용자 객체를 넘겼습니다. 목록에 들어온 원소와 그 원소를 그리는 함수가 서로 다른 데이터를 보지 않도록 연결해 보세요.',
    concept: ['any[] 때문에 목록 원소와 renderItem이 따로 놀던 문제를, 제네릭 컴포넌트의 T 하나로 연결합니다. T는 items의 원소와 renderItem의 매개변수가 같은 타입이라는 관계를 보존합니다.', '목록마다 식별자 규칙도 다르므로 key를 컴포넌트 안에서 추측하지 않습니다. getKey를 호출자에게 받아 사용자와 주문에 맞는 값을 고릅니다.'],
    mission: 'GenericList가 items, renderItem, getKey의 타입 관계를 유지하도록 작성하세요.', goals: ['renderItem의 item은 items 원소와 같은 타입이다.', '다른 타입을 받는 renderItem은 거절된다.'], hints: ['먼저 Props<T> 타입을 선언하세요.', 'renderItem은 (item: T) => ReactNode입니다.', 'map의 key에는 getKey(item)을 사용하세요.'],
    starter: { 'index.tsx': `import type { ReactNode } from 'react';\nexport function GenericList(_props: unknown) { return <ul />; }` },
    solution: { 'index.tsx': `import type { ReactNode } from 'react';\ntype Props<T> = { items: T[]; renderItem: (item: T) => ReactNode; getKey: (item: T) => string };\nexport function GenericList<T>({ items, renderItem, getKey }: Props<T>) {\n  return <ul>{items.map((item) => <li key={getKey(item)}>{renderItem(item)}</li>)}</ul>;\n}` },
    editableFiles: ['index.tsx'], mode: 'react', sources: [reactSource], explanation: ['같은 T를 두 props에서 공유하면 items를 보고 renderItem의 매개변수 타입을 추론할 수 있습니다.', 'any를 사용하면 이 연결이 사라져 다른 종류의 객체를 넘겨도 컴파일러가 알려 주지 못합니다.'],
  }),
  lesson({
    id: 'r26', chapter: 4, order: 26, title: 'ChangeEvent로 입력 이벤트 타입 지정하기', navTitle: 'ChangeEvent', summary: '주문 수량 input의 ChangeEvent를 정확히 지정하고 문자열 값을 검사해, 유효한 정수만 숫자 콜백으로 전달합니다.',
    story: '수량 입력 handler가 any라 checkbox 이벤트가 들어와도 배포 전까지 드러나지 않았습니다. 숫자 입력창도 브라우저에서는 문자열을 보내므로, 이벤트의 종류와 숫자로 바꾸는 경계를 분리해 보세요.',
    concept: ['any handler가 checkbox 이벤트까지 받던 문제를, ChangeEvent<HTMLInputElement>로 이 handler가 input 이벤트만 받는다는 계약으로 좁힙니다. currentTarget.value의 타입은 여전히 string입니다.', '숫자로 보이는 값도 브라우저 경계에서는 문자열입니다. 숫자로 바꾼 뒤 빈 값, 소수, 음수를 확인해야 합니다.'],
    mission: '수량 문자열을 검증해 숫자로 바꾸고, 유효할 때만 콜백에 전달하는 QuantityInput을 완성하세요.', goals: ['onQuantity 콜백은 number만 받는다.', '빈 값·소수·음수는 콜백으로 전달하지 않는다.'], hints: ['ChangeEvent를 import type으로 가져오세요.', 'parseQuantityInput은 실패할 때 number | undefined를 반환하게 하세요.', 'currentTarget.value를 변환 함수에 넘기세요.'],
    starter: { 'index.tsx': `export type QuantityInputProps = { onQuantity: (value: number) => void };\nexport function parseQuantityInput(_raw: string): number | undefined { return 0; }\nexport function QuantityInput(_props: QuantityInputProps) { return <input />; }` },
    solution: { 'index.tsx': `import type { ChangeEvent } from 'react';\nexport type QuantityInputProps = { onQuantity: (value: number) => void };\nexport function parseQuantityInput(raw: string): number | undefined {\n  if (raw.trim() === '') return undefined;\n  const value = Number(raw);\n  return Number.isInteger(value) && value >= 0 ? value : undefined;\n}\nexport function QuantityInput({ onQuantity }: QuantityInputProps) {\n  const onChange = (event: ChangeEvent<HTMLInputElement>) => {\n    const value = parseQuantityInput(event.currentTarget.value);\n    if (value !== undefined) onQuantity(value);\n  };\n  return <input inputMode="numeric" onChange={onChange} />;\n}` },
    editableFiles: ['index.tsx'], mode: 'react', sources: [reactSource], explanation: ['currentTarget은 handler가 붙은 input을 가리키므로 target보다 이 코드에서 필요한 타입을 분명하게 알려 줍니다.', '이벤트 타입을 붙여도 입력값이 자동으로 number가 되지는 않습니다. parseQuantityInput이 문자열을 검사하고 바꾸는 경계입니다.'],
  }),
  lesson({
    id: 'r27', chapter: 4, order: 27, title: '판별 유니온으로 reducer 액션 모델링하기', navTitle: 'reducer 액션', summary: '장바구니 reducer의 수량 추가와 할인 액션을 판별 유니온으로 나눠, 액션마다 맞는 데이터만 처리하고 누락된 분기를 찾습니다.',
    story: '할인 액션에 수량 값이 들어가 장바구니 합계가 틀어졌습니다. 액션 이름과 그때 필요한 데이터를 한 묶음으로 묶고, reducer가 새 액션을 빠뜨리지 않게 만들어 보세요.',
    concept: ['할인에 수량이 섞이던 문제를, 액션 종류별 객체의 유니온으로 분리합니다. type은 각 액션에 어떤 데이터가 있는지 알려 주는 구분값이 됩니다.', 'reducer는 입력을 받아 새 상태를 반환하는 순수 함수라 화면을 띄우지 않고도 액션 계약을 확인할 수 있습니다.'],
    mission: 'cartReducer가 add와 discount 액션을 각각 처리하도록 작성하세요.', goals: ['add 액션에는 quantity가 필요하다.', 'discount 액션에는 percentage만 허용한다.'], hints: ['Action을 두 객체 타입의 유니온으로 작성하세요.', 'switch의 각 분기에서 해당 액션의 값을 읽으세요.', 'default에서 never 검사를 남기세요.'],
    starter: { 'index.ts': `export type State = { quantity: number; discount: number };\nexport type Action = { type: string; payload: number };\nexport function cartReducer(state: State, _action: Action): State { return state; }` },
    solution: { 'index.ts': `export type State = { quantity: number; discount: number };\nexport type Action = { type: 'add'; quantity: number } | { type: 'discount'; percentage: number };\nexport function cartReducer(state: State, action: Action): State {\n  switch (action.type) {\n    case 'add': return { ...state, quantity: state.quantity + action.quantity };\n    case 'discount': return { ...state, discount: action.percentage };\n    default: { const exhaustive: never = action; return exhaustive; }\n  }\n}` },
    editableFiles: ['index.ts'], mode: 'runtime', sources: [reactSource], explanation: ['모든 액션에 payload라는 숫자 하나만 두면 그 숫자가 수량인지 할인율인지 구분할 수 없습니다.', '액션별 데이터를 따로 두고 마지막에 never를 확인하면 새 액션을 추가했을 때 reducer도 함께 고치게 됩니다.'],
  }),
  lesson({
    id: 'r28', chapter: 4, order: 28, title: 'Context와 전용 Hook으로 null 처리하기', navTitle: 'Context Hook', summary: '전용 Hook에서 Provider 누락을 검사하고 컴포넌트에는 User만 반환합니다.',
    story: '여러 화면에서 useContext(...)!를 사용하다 보니 Provider 누락이 한참 뒤 undefined 오류로 나타났습니다. Context를 읽는 순간 원인을 알려 주고, 나머지 컴포넌트에는 안전한 User만 전달해 보세요.',
    concept: ['Provider 누락을 숨기지 않으려면 createContext<User | null>(null)로 값이 없을 수 있다는 사실부터 타입에 적습니다.', '사용자 값을 읽는 Hook에서 null이면 즉시 오류를 내고 User를 반환합니다. 그러면 컴포넌트마다 느낌표를 붙이지 않아도 됩니다.'],
    mission: 'useCurrentUser가 Provider 밖에서는 설명이 있는 오류를 내고, 안에서는 User를 반환하게 하세요.', goals: ['Hook의 반환 타입에는 null이 없다.', 'null을 느낌표 연산자로 숨기지 않는다.'], hints: ['Context의 기본값은 null로 두세요.', 'Hook 안에서 user가 null인지 먼저 확인하세요.', '확인 뒤에는 user를 그대로 반환하세요.'],
    starter: { 'index.tsx': `import { createContext, useContext } from 'react';\nexport type User = { id: string; name: string };\nexport const UserContext = createContext<User | null>(null);\nexport function useCurrentUser(): User { return useContext(UserContext)!; }` },
    solution: { 'index.tsx': `import { createContext, useContext } from 'react';\nexport type User = { id: string; name: string };\nexport const UserContext = createContext<User | null>(null);\nexport function useCurrentUser(): User {\n  const user = useContext(UserContext);\n  if (user === null) throw new Error('UserContext Provider가 필요합니다.');\n  return user;\n}\nexport function Greeting() { const user = useCurrentUser(); return <p>{user.name}</p>; }` },
    editableFiles: ['index.tsx'], mode: 'react', sources: [reactSource], explanation: ['null 처리를 한 Hook에 모으면 Provider 누락이 원인 가까이에서 즉시 드러납니다.', '느낌표는 null을 없애는 기능이 아니라 검사를 건너뛰는 표기입니다. 실제로 null일 수 있는 값에는 조건문이 필요합니다.'],
    interview: { question: 'Context의 기본값으로 실제 사용자 객체를 넣으면 어떤 문제가 생길까요?', answer: 'Provider가 빠져도 정상 값처럼 보여서, 실제 사용자와 다른 잘못된 사용자가 화면에 나타날 수 있다.', points: ['Provider 누락을 null로 표현한다.', '사용자 값을 읽는 Hook에서 검사한다.'] },
  }),
];


