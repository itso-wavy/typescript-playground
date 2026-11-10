# 검증 기록

## 2026-09-11 검사 도구 수정

후속 업데이트: 모든 스택에 적용할 과정 수준 검사도 추가했다. 대상 학습자, 선수 지식, 관찰 가능한 수료 행동, 단계별 흐름과 이유, 수료 목표 연결, 공개 실습의 누락·중복·순서, 실습 수 범위와 평가 판정을 검사한다. 기준 설명은 `docs/curriculum/curriculum-quality-standard.md`에 있다. 현재 TypeScript의 36개 적절성 평가는 `pending`이라 콘텐츠 품질 명령은 이 항목도 실패로 보고한다.

후속 검증은 전체 Vitest 10개 파일 68개, typecheck, lint를 통과했다. build는 제한된 실행 환경에서 서버 entry 해석이 차단되어 한 번 실패했으며, 같은 명령을 정상 권한으로 다시 실행해 client와 server build가 통과했다. 기존 Vite 확장자 및 청크 크기 경고는 남아 있다.

- 품질 검사는 이제 `src/curriculum/index.ts`가 실제로 내보내는 목록을 읽는다. helper 호출과 공개 목록 필터를 그대로 반영하며, 직접 AST를 해석하던 중복 로직을 제거했다. 기존 esbuild를 사용하고 의존성을 추가하지 않았다.
- 출력에 공개 ID, 전체 수, 검사 수, 제외한 진단 수, 실패 건수를 포함한다. 현재 전체 40개 중 실습 36개를 검사하고 선택 진단 4개는 기존 정책에 따라 제외한다. 중복 ID와 잘못된 kind는 실패한다.
- 공식 문서 URL은 문자열 포함 여부 대신 HTTPS와 실제 hostname을 확인한다.
- c34는 음수·소수·NaN·양/음의 무한대 거절, 0 허용, 생략, 두 필드 동시 전달을 검사한다. 정수 검증 누락과 `else if` 때문에 수량을 건너뛰는 오답을 fixture에 추가했다.
- ESLint에는 검사 스크립트용 Node 전역을 명시했다. 기존 키보드 테스트의 공백 두 칸 정규식은 같은 의미인 `{2}`로 표기했다.

검증 결과:

| 검사 | 이번 실행 결과 |
| --- | --- |
| 새 회귀 테스트 | 수정 전에 실제 실패를 확인한 뒤 수정. 최종 관련 3개 파일 29개 테스트 통과 |
| 전체 Vitest | 10개 파일 60개 통과. 이후 리뷰에서 추가한 회귀 테스트와 최종 수정은 위 관련 테스트로 재검증 |
| 전체 커리큘럼 | 타입·브라우저 통과. 런타임 26개, 정상 후보 52개 통과, 타입 거절 21개, 실행 거절 8개 |
| 최종 c34 추가 수정 후 6장 재검증 | 전체 native type matrix와 6장 browser matrix 통과. 런타임 4개, 정상 후보 8개, 타입 거절 2개, 실행 거절 4개, 실패 0건 |
| typecheck / lint | 최종 수정 후 통과 |
| build | 통과. 기존 Vite 확장자 및 청크 크기 경고가 있음 |
| 콘텐츠 품질 검사 | 36개 전수 검사, 23건 지적: 요약 21건·상황 단어 2건. exit 1 유지 |

콘텐츠 지적 23건은 이번 수정의 남은 도구 오류를 의미하지 않는다. 내용을 개선하거나 의미를 검토할 대상이며, 합격시키려고 문장 분량 기준이나 상황 단어 규칙을 낮추지 않았다. 문장의 자연스러움, 설명과 과제의 의미 정렬, 출처 내용의 적합성은 계속 편집 검토가 필요하다.

검사 대상은 저장소에서 관리하는 신뢰된 커리큘럼 코드다. 학습자 제출 코드는 이 로더로 실행하지 않는다. 로더는 현재 커리큘럼의 상대 경로 TypeScript 모듈을 지원하며 지원하지 않는 import나 로딩 오류는 exit 2로 명시적으로 실패한다.

이 문서는 현재 작업 트리의 로컬 검증과 아직 연결할 수 없는 외부 검증을 분리해 기록합니다. Supabase 프로젝트와 Docker 런타임은 준비하지 않았으므로, 통과한 로컬 테스트를 live deployment evidence로 해석하지 않습니다.

## 통과한 로컬 검증

다음 결과는 현재 트리에서 실행했거나, 해당 작업을 소유한 검증 에이전트가 실행 결과를 보고한 것입니다.

| 영역 | 명령 또는 산출물 | 결과 |
| --- | --- | --- |
| TypeScript | `npm.cmd run typecheck` | 통과 보고 |
| 앱/API 빌드 | `npm.cmd run build` | 통과 보고; `dist/index.html`, `dist/server.mjs` 생성 |
| lint | `npm.cmd run lint` | 통과 보고 |
| RTL | `npm.cmd test -- tests/learning.test.tsx --run` | 12 tests 통과 보고 |
| 학습 브라우저 E2E | `npm.cmd run test:e2e -- --config=playwright.learning.config.ts` | 2 tests 통과 보고; desktop/mobile 흐름 포함 |
| fixture matrix | `npm.cmd test -- tests/compiler-matrix.test.ts --run` | 1 test 통과, 전체 published fixture solution/alternate/invalid matrix 검사 |
| 전체 커리큘럼 | `npm.cmd run test:curriculum -- --run` | 통과. native TS matrix가 40개 published lesson의 solution/alternative와 invalid variant를 검사했고, 실제 browser Worker matrix는 runtime/react lesson 26개에서 valid candidate 52개를 통과시켰습니다. invalid variant 21개는 type phase에서, 7개는 runtime phase에서 거부했습니다. 실패 0건. |
| runner 보안 | `npm.cmd run test:runner-security` (`tests/e2e/runner-security.spec.ts`) | 8/8 통과. learner의 forged result, 무한 루프, 네트워크·storage 차단, prototype/static built-in tampering, import 차단을 검사합니다. |
| visual review | `.omx/state/learning-ui/ralph-progress.json` | `pass`, score 92 |

시각 검토에 사용한 캡처는 다음 파일입니다.

- [desktop 1440×1000](screenshots/learning-desktop-1440x1000.png)
- [mobile 390×844](screenshots/learning-mobile-390x844.png)
- [mobile 360×844](screenshots/learning-mobile-360x844.png)

시각 판정은 흰색/ink 단색 표면, 어두운 editor 중심, 390/360px 가로 overflow 없음, 반응형 단일 열을 확인했습니다. local-preview 안내 띠와 360px의 긴 한국어 제목 줄바꿈은 판정 JSON에 기록된 의도된 차이입니다.

## 보류한 검증

- Docker 이미지 build, non-root 컨테이너 실행, 포트 publish, `/api/config` 및 static asset smoke test는 Docker 미설치로 실행하지 않았습니다.
- Supabase Magic Link 전달, signup disabled 설정, `owner_allowlist`, RLS 정책, `save_lesson_progress` RPC, 두 탭 conflict/CAS, private access smoke test는 Supabase 프로젝트가 없어 실행하지 않았습니다.
- 백업/PITR과 복구 테스트도 외부 프로젝트와 운영 계정이 필요해 실행하지 않았습니다.

로컬 preview는 `LOCAL_PREVIEW=1`과 loopback 요청에서만 허용되며, 진도와 초안은 사용자별 browser localStorage에 남습니다. 이 결과는 cloud sync, deployed auth, compiler sandbox host isolation을 증명하지 않습니다.
