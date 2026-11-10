# Curriculum layout

각 기술 스택은 자체 디렉터리에서 과정 정의와 레슨을 관리한다.

```text
curriculum/
  index.ts          # 앱이 읽는 전체 과정 진입점
  typescript/       # TypeScript 과정과 레슨
  react/            # React 과정 추가 위치
  nextjs/           # Next.js 과정 추가 위치
```

스택 내부의 `index.ts`는 해당 과정에 공개할 레슨만 조합한다. 최상위 `index.ts`는 각 스택의 공개 진입점만 다시 내보낸다.

