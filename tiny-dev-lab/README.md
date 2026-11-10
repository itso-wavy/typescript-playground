# 작은 개발실

개인용 TypeScript 학습 앱입니다. 36개의 실습 레슨과 4개의 진단 레슨을 포함하며, 레슨 완료 수는 `0 / 40`으로 계산합니다. 앱과 API는 같은 서버에서 제공되고, 클라우드 연결 전에는 명시적인 로컬 미리보기만 사용할 수 있습니다.

## 로컬 실행

필요한 도구는 Node.js 24 이상과 npm입니다. 저장소 루트에서 다음을 실행합니다.

```powershell
npm ci
npm run typecheck
npm test
npm run build
```

개발 서버는 Vite 미들웨어로 `/api/config`, `/api/me`, `/api/check`를 함께 제공합니다.

```powershell
$env:LOCAL_PREVIEW = '1'
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 열면 됩니다. `LOCAL_PREVIEW=1`은 `localhost`, `127.0.0.1`, `::1` 요청에만 적용되고, 로컬 미리보기에서는 진도와 초안이 브라우저의 localStorage에만 저장됩니다. 브라우저나 저장 공간을 바꾸면 데이터가 보이지 않으며, 이 모드는 Supabase 동기화나 배포 인증을 검증하지 않습니다.

`npm run build`는 TypeScript 검사, Vite 앱 빌드, Node API 번들 생성을 차례로 실행합니다. 빌드 뒤에는 프로젝트 루트의 `.env`를 준비하고 다음으로 동일 출처의 정적 앱/API 서버를 실행합니다. `npm run start`가 `.env`를 자동으로 읽으므로 PowerShell 세션에 값을 다시 입력할 필요가 없습니다. production 서버는 `NODE_ENV=production`을 강제하고 기본적으로 `0.0.0.0:4173`에 listen합니다. `HOST`를 지정하면 listen 주소를 제한할 수 있습니다.

```powershell
Copy-Item .env.example .env
# .env를 편집한 뒤 실행
npm run start
```

`npm run lint`, `npm run test:curriculum`, `npm run test:runner-security`, `npm run test:e2e`도 제공됩니다. E2E 브라우저 테스트는 별도로 설치된 Playwright 브라우저가 필요합니다.

## 환경 변수

`.env.example`에는 이름만 기록되어 있습니다. 저장소 루트에서 복사해 만든 로컬 `.env`에 실제 값을 입력하고, `.gitignore`에 의해 커밋되지 않도록 합니다. 배포 환경에서는 호스팅 서비스의 secret 설정에 같은 이름을 넣습니다. Supabase 대시보드에 앱 환경 변수를 입력하는 것은 아닙니다. 개발 시 `.env`의 `LOCAL_PREVIEW=1`을 사용하거나 PowerShell 세션에서 직접 설정할 수 있습니다. Vite 개발 서버는 `.env`를 API 미들웨어에도 전달하고, production의 `npm run start`는 Node의 env-file 옵션으로 같은 파일을 읽습니다.

`SUPABASE_PUBLISHABLE_KEY`는 Supabase 대시보드의 **Project Settings(톱니바퀴) → API Keys → Publishable key**에서 복사한 `sb_publishable_...` 값입니다. Dashboard 화면에 `Connect`가 보이면 `Connect → App Frameworks`에서 같은 Publishable key를 확인할 수도 있습니다. 기존 프로젝트에만 있는 `anon` 키는 `SUPABASE_ANON_KEY`로 임시 사용할 수 있지만, 새 프로젝트에서는 Publishable key를 우선합니다. 두 키 모두 브라우저에 공개되는 키이며 service-role/secret 키는 이 앱에 넣지 않습니다. `OWNER_USER_ID`는 Supabase Auth의 실제 사용자 UUID이며, allowlist에도 같은 UUID를 넣어야 합니다. `APP_ORIGIN`은 배포 출처를 기록하기 위한 설정 값이고 현재 API는 상대 경로의 same-origin 요청을 사용합니다. 배포 절차와 Supabase 연결은 [docs/deployment.md](docs/deployment.md)에 있습니다.

로그인은 Supabase 기본 이메일 **Magic Link**를 사용합니다. 가입을 닫은 뒤 Auth Users에 owner 계정을 먼저 만들고, Auth URL Configuration의 Redirect URLs에 로컬 및 배포 주소를 추가하세요. 앱에서 이메일을 입력하면 링크가 전송되고, 같은 브라우저에서 링크를 열면 세션이 자동으로 처리됩니다. custom SMTP나 이메일 템플릿 수정은 필요하지 않습니다.

검사 API는 요청 본문을 70 KiB로 제한하고 compiler 동시 작업을 2개로 제한합니다. compiler child process에는 `PATH`, 임시 디렉터리, 빈 `NODE_OPTIONS`만 전달하며 앱 인증 비밀값을 전달하지 않습니다.

## 레슨 작성과 fixture 검증

클라이언트 레슨은 `src/curriculum/`의 챕터 파일에 작성하고, `src/curriculum/index.ts`에서 내보냅니다. 서버 검사용 fixture는 같은 레슨 ID를 `server/curriculum/`에 두고, `starter`, editable 파일, 타입 계약과 runtime 검사를 함께 맞춥니다. 학습자 소스는 지정된 fixture 파일만 검사하며 Node에서 실행하지 않습니다.

작성 후 다음 순서로 확인합니다.

```powershell
npm run test:curriculum -- --run
npm test -- tests/check.test.ts tests/learning.test.tsx tests/progress.test.ts tests/auth.test.ts
npm run typecheck
npm run lint
npm run build
```

fixture가 없는 레슨은 성공으로 간주되지 않습니다. runtime 레슨의 번들은 브라우저 sandbox에서 실행되고, 진도 완료는 성공 응답만으로 자동 처리되지 않으며 저장된 완료 코드와 현재 코드가 다르면 다시 검증해야 합니다.

## Docker

Docker 빌드 파일은 `npm run build` 결과를 런타임 이미지에 복사하고, API가 요청마다 pinned TypeScript와 esbuild를 호출하므로 lockfile 의존성도 설치합니다. 런타임은 `node` 사용자로 실행합니다.

```powershell
docker build -t tiny-dev-lab .
docker run --rm -p 4173:4173 `
  -e NODE_ENV=production `
  -e PORT=4173 `
  -e SUPABASE_URL=https://<project-ref>.supabase.co `
  -e SUPABASE_PUBLISHABLE_KEY=<publishable-key> `
  -e OWNER_USER_ID=<owner-user-uuid> `
  tiny-dev-lab
```

현재 작업 환경에는 Docker가 설치되어 있지 않아 이미지 빌드와 컨테이너 smoke test를 수행하지 못했습니다. Supabase 프로젝트를 만들거나 공개 배포하기 전에는 컨테이너의 네트워크 바인딩, `/api/config`의 safe public config, 인증 실패 상태 코드, `/api/check`의 413/429 제한을 연결된 환경에서 확인해야 합니다.
