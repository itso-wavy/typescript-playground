import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getSupabaseClient,
  loadAppConfig,
  requestMagicLink,
} from './client.js';

type AuthMode = 'local' | 'cloud';

interface AuthContextValue {
  mode: AuthMode;
  userId: string;
  accessToken: string | null;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthGateProps {
  children: ReactNode;
}

type GateState =
  | { kind: 'loading' }
  | { kind: 'local' }
  | { kind: 'unconfigured' }
  | { kind: 'login' }
  | { kind: 'link-sent'; email: string }
  | { kind: 'authenticated'; userId: string; accessToken: string };

async function verifyOwner(accessToken: string): Promise<string | null> {
  const response = await fetch('/api/me', {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) return null;
  const body: unknown = await response.json();
  return body &&
    typeof body === 'object' &&
    typeof (body as { id?: unknown }).id === 'string'
    ? (body as { id: string }).id
    : null;
}

function LoginForm({
  onMagicLinkRequested,
}: {
  onMagicLinkRequested(email: string): Promise<void>;
}) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    try {
      await onMagicLinkRequested(email);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Could not request a sign-in link.'
      );
    }
  }

  return (
    <form onSubmit={submit} aria-label='이메일 로그인'>
      <label htmlFor='email'>이메일</label>
      <input
        id='email'
        type='email'
        value={email}
        onChange={event => setEmail(event.target.value)}
        required
      />
      <button type='submit'>로그인 링크 보내기</button>
      {message ? <p role='alert'>{message}</p> : null}
    </form>
  );
}

function MagicLinkSent({
  email,
  onBack,
  onResend,
}: {
  email: string;
  onBack(): void;
  onResend(): Promise<void>;
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    setMessage(null);
    try {
      await onResend();
      setMessage('새 로그인 링크를 보냈습니다.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '로그인 링크를 다시 보낼 수 없습니다.'
      );
    }
  }

  return (
    <section aria-label='로그인 링크 확인'>
      <h1>메일함을 확인해 주세요.</h1>
      <p>{email}로 로그인 링크를 보냈습니다.</p>
      <p>같은 브라우저에서 이메일의 링크를 열면 자동으로 로그인됩니다.</p>
      <button
        type='button'
        onClick={() => void resend()}
      >
        로그인 링크 다시 보내기
      </button>
      <button type='button' onClick={onBack}>
        이메일 다시 입력
      </button>
      {message ? <p role='alert'>{message}</p> : null}
    </section>
  );
}

export function AuthGate({ children }: AuthGateProps) {
  const [state, setState] = useState<GateState>({ kind: 'loading' });

  useEffect(() => {
    let active = true;
    let requestVersion = 0;
    let unsubscribe: (() => void) | undefined;

    async function acceptSession(
      accessToken: string | undefined
    ): Promise<void> {
      const version = ++requestVersion;
      if (!accessToken) {
        if (active) setState({ kind: 'login' });
        return;
      }
      const userId = await verifyOwner(accessToken).catch(() => null);
      if (!active || version !== requestVersion) return;
      setState(
        userId
          ? { kind: 'authenticated', userId, accessToken }
          : { kind: 'login' }
      );
    }

    void loadAppConfig()
      .then(async config => {
        if (!active) return;
        if (config.localPreview) {
          setState({ kind: 'local' });
          return;
        }
        const client = getSupabaseClient();
        if (!client) {
          setState({ kind: 'unconfigured' });
          return;
        }
        const { data } = client.auth.onAuthStateChange((_event, session) => {
          void acceptSession(session?.access_token);
        });
        unsubscribe = () => data.subscription.unsubscribe();
        const { data: sessionData } = await client.auth.getSession();
        await acceptSession(sessionData.session?.access_token);
      })
      .catch(() => {
        if (active) setState({ kind: 'unconfigured' });
      });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  async function signOut(): Promise<void> {
    if (state.kind === 'local') return;
    const client = getSupabaseClient();
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) throw new Error(error.message);
    }
    // Pending local drafts are intentionally retained for the UI logout prompt/export flow.
    setState({ kind: 'login' });
  }

  if (state.kind === 'loading')
    return <p>개인 접근 권한을 확인하고 있습니다…</p>;
  if (state.kind === 'unconfigured')
    return <p role='alert'>클라우드 인증이 아직 설정되지 않았습니다.</p>;
  if (state.kind === 'login') {
    return (
      <LoginForm
        onMagicLinkRequested={async email => {
          await requestMagicLink(email);
          setState({ kind: 'link-sent', email });
        }}
      />
    );
  }
  if (state.kind === 'link-sent')
    return (
      <MagicLinkSent
        email={state.email}
        onBack={() => setState({ kind: 'login' })}
        onResend={() => requestMagicLink(state.email)}
      />
    );

  const value: AuthContextValue =
    state.kind === 'local'
      ? { mode: 'local', userId: 'local-preview', accessToken: null, signOut }
      : {
          mode: 'cloud',
          userId: state.userId,
          accessToken: state.accessToken,
          signOut,
        };
  return (
    <AuthContext.Provider value={value}>
      {state.kind === 'local' ? (
        <>
          <p>로컬 미리보기: 변경 사항은 이 기기에만 저장됩니다.</p>
          {children}
        </>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthGate.');
  return value;
}
