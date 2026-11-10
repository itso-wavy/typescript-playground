# 배포와 Supabase 연결

Supabase 프로젝트와 owner 계정은 아직 만들지 않은 상태를 전제로 합니다. 아래 절차는 연결할 때 적용할 수 있는 준비 문서이며, 이 작업에서는 유료 리소스를 만들거나 공개 URL로 배포하지 않습니다.

## 배포 전 빌드

Node.js 24 이상에서 의존성을 설치하고 전체 검사를 실행합니다.

```powershell
npm ci
npm run typecheck
npm test
npm run lint
npm run build
```

`npm run build`가 `dist/index.html`과 `dist/server.mjs`를 만들고, `npm run start`가 하나의 Node 프로세스로 앱과 `/api/*`를 제공합니다. production 서버는 `NODE_ENV=production`을 강제하고 기본적으로 `0.0.0.0:4173`에 listen합니다. 내부망에서만 열어야 하면 `HOST`를 명시적인 주소로 지정합니다. `NODE_ENV=production`에서는 `LOCAL_PREVIEW=1`을 사용하지 않습니다. 공개 배포에서 local preview를 켜면 안 됩니다.

컨테이너를 사용할 경우 `Dockerfile`은 빌드와 런타임 양쪽에 lockfile 의존성을 설치합니다. API가 요청마다 pinned TypeScript compiler와 esbuild를 호출하기 때문에 compiler 의존성을 runtime image에서 제거하면 `/api/check`가 동작하지 않습니다. 최종 프로세스는 `node` 사용자로 실행합니다. Docker가 설치되지 않은 현재 환경에서는 `docker build`와 컨테이너 smoke test를 수행할 수 없으므로, 실제 배포 전에 반드시 확인해야 합니다. 컨테이너는 기본 listen 주소가 `0.0.0.0`인지와 `-p 4173:4173` 접근이 되는지 확인한 뒤 배포합니다.

## Supabase 프로젝트 준비

1. Supabase에서 프로젝트를 만든 뒤 Auth의 이메일 provider를 켭니다.
2. 이메일 가입은 비활성화하고, 기존 사용자만 Magic Link를 받을 수 있게 합니다. 앱은 `signInWithOtp({ options: { shouldCreateUser: false, emailRedirectTo } })`를 호출합니다.
3. 기본 **Magic Link** 이메일 템플릿을 그대로 사용합니다. 기본 템플릿은 로그인 링크를 보내므로 custom SMTP를 설정하거나 `{{ .Token }}`을 직접 편집할 필요가 없습니다.
4. Supabase의 Auth URL Configuration에서 로컬 주소와 배포 주소를 Redirect URLs에 추가합니다. 앱은 현재 페이지와 같은 출처의 URL만 `emailRedirectTo`로 전달합니다.
5. SQL Editor 또는 연결된 Supabase CLI에서 `supabase/migrations/202609080001_progress.sql`을 적용합니다.
6. Auth Users에서 owner 사용자를 만든 뒤, 그 사용자의 UUID를 `public.owner_allowlist`에 추가합니다. SQL Editor에서는 실제 값을 비밀 저장소나 대시보드 입력으로 주입하고, 저장소에는 placeholder만 남깁니다.

```sql
-- Set this session setting from your deployment secret/configuration channel.
-- Do not commit the owner UUID into this repository.
insert into public.owner_allowlist (user_id)
values (current_setting('app.owner_user_id')::uuid)
on conflict (user_id) do nothing;
```

`app.owner_user_id`는 SQL 세션에 주입하는 configuration variable입니다. 실제 Auth user UUID를 코드나 migration 파일에 하드코딩하지 않습니다. migration은 allowlist, RLS, preferences, progress 테이블과 revision 비교 RPC를 만듭니다. authenticated 사용자는 자기 row를 읽고 guarded RPC를 호출할 수 있으며, allowlist에 없는 사용자는 읽기와 쓰기가 거부됩니다.

### API 키와 로컬 `.env`

앱 환경 변수는 Supabase 대시보드에 저장하지 않습니다. 프로젝트 저장소의 루트에서 `.env.example`을 복사해 `.env`를 만들고 값을 입력합니다.

```powershell
Copy-Item .env.example .env
```

Supabase 대시보드에서 `web-dev-tutor` 프로젝트를 연 뒤 왼쪽 아래 톱니바퀴의 **Project Settings → API Keys**로 이동합니다. **Publishable key**를 복사해 `SUPABASE_PUBLISHABLE_KEY`에 넣습니다. 이 값은 보통 `sb_publishable_`로 시작합니다. 대시보드에 `Connect` 버튼만 보이는 경우에는 **Connect → App Frameworks**에서 같은 키를 확인할 수 있습니다. `SUPABASE_URL`은 같은 화면의 Project URL을 사용합니다.

`.env`에는 최소한 다음을 입력합니다.

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
OWNER_USER_ID=<owner-user-uuid>
LOCAL_PREVIEW=
```

`OWNER_USER_ID`는 **Authentication → Users**에서 본인 사용자 행의 UUID입니다. `service_role`, `secret`, 또는 비밀 키를 `.env`에 넣지 않습니다. 기존 Supabase 프로젝트의 legacy `anon` 키만 있는 경우에는 `SUPABASE_ANON_KEY`를 사용할 수 있지만 새 프로젝트에서는 Publishable key를 우선합니다. `SUPABASE_PUBLISHABLE_KEY`와 `SUPABASE_ANON_KEY`를 둘 다 입력하면 Publishable key가 사용됩니다.

pgTAP을 사용할 수 있으면 `supabase/tests/progress.sql`을 실행해 최초 insert race, CAS revision, 다른 사용자 접근 거부를 확인합니다. 실제 Supabase 프로젝트가 없으면 이 테스트와 Magic Link 전달, RLS, RPC 실행은 아직 검증된 것으로 표시할 수 없습니다.

## 서버 환경 연결

배포 secret 설정에 다음 값을 넣습니다.

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-key>
OWNER_USER_ID=<owner-user-uuid>
APP_ORIGIN=https://<private-app-host>
PORT=4173
NODE_ENV=production
# Optional; defaults to 0.0.0.0 for container/hosted serving.
HOST=0.0.0.0
```

`SUPABASE_PUBLISHABLE_KEY`만 브라우저에 전달될 수 있는 공개 설정입니다. server는 `/api/config`에서 `SUPABASE_URL`과 publishable key만 반환하고 `OWNER_USER_ID`는 반환하지 않습니다. legacy `SUPABASE_ANON_KEY`는 publishable key가 없을 때만 호환용으로 사용됩니다. service-role key는 사용하지 않습니다. `APP_ORIGIN`은 배포 출처를 기록하는 값이며 현재 브라우저 요청은 `/api/*` 상대 경로로 same-origin에 묶여 있습니다.

검사 API는 요청 본문을 70 KiB로 제한하고 compiler 동시 작업을 2개로 제한합니다. compiler child process에는 `PATH`, 요청별 임시 디렉터리, 빈 `NODE_OPTIONS`만 전달하므로 Supabase credentials나 owner 설정을 compiler 환경에 넣지 않습니다.

## private access smoke test

연결 후 공개하기 전에 private 네트워크 또는 접근 제어된 호스트에서 다음을 확인합니다.

1. `GET /api/config`가 `localPreview: false`, Supabase URL, publishable key만 반환하는지 확인합니다. owner UUID나 secret이 응답에 없어야 합니다.
2. 토큰 없이 `GET /api/me`가 401인지 확인합니다.
3. allowlist에 없는 유효한 Auth 사용자가 403을 받는지 확인합니다.
4. owner가 이메일의 Magic Link를 **같은 브라우저에서** 열어 로그인하고 `GET /api/me`가 자기 UUID를 반환하는지 확인합니다.
5. owner가 레슨을 저장하고 새로고침해 진도가 복원되는지 확인합니다.
6. 같은 레슨을 두 탭에서 수정해 한 저장은 `saved`, 오래된 revision은 `conflict`가 되는지 확인합니다. 충돌 때는 remote와 local을 비교한 뒤 선택한 버전만 remote revision으로 다시 저장해야 합니다.
7. 비정상적으로 큰 `/api/check` 요청이 413, 동시 제한 초과가 429를 반환하고 모든 오류 응답이 `{ "message": "..." }` 모양인지 확인합니다.

## 백업과 충돌 처리

Supabase 백업과 PITR 설정은 프로젝트 요금제와 운영 정책에 맞춰 별도로 켭니다. 앱의 revision CAS는 백업을 대신하지 않습니다. 브라우저가 오프라인이거나 저장에 실패하면 사용자별 local draft에 base version을 남기고, 재연결 시 remote와 비교합니다. remote가 바뀐 경우 앱은 어느 쪽을 보존할지 선택하게 해야 하며, 재연결만으로 local draft를 덮어쓰지 않습니다. 로그아웃할 때 미동기화 초안이 있으면 JSON 내보내기 후 나갈 수 있습니다.

현재 연결 전 검증 범위는 로컬 API, 컴파일러/source policy, UI, mocked auth/progress 테스트입니다. 실제 Magic Link 이메일, Supabase allowlist/RLS/RPC, private host smoke test, Docker 네트워크와 백업 복구는 프로젝트 연결 뒤에만 검증할 수 있습니다.
