import { afterEach, describe, expect, it, vi } from 'vitest';

const config = {
  localPreview: false,
  supabaseUrl: 'https://owner-test.supabase.co',
  supabasePublishableKey: 'public-test-key',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('server authorize', () => {
  it('rejects a missing bearer token before contacting Supabase', async () => {
    vi.stubEnv('SUPABASE_URL', config.supabaseUrl);
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', config.supabasePublishableKey);
    vi.stubEnv('OWNER_USER_ID', 'owner-uuid');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { AuthorizationError, authorize } = await import('../server/auth.js');

    await expect(authorize('')).rejects.toBeInstanceOf(AuthorizationError);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects an expired Supabase token', async () => {
    vi.stubEnv('SUPABASE_URL', config.supabaseUrl);
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', config.supabasePublishableKey);
    vi.stubEnv('OWNER_USER_ID', 'owner-uuid');
    vi.stubGlobal('fetch', vi.fn(async () => json({ message: 'JWT expired' }, 401)));
    const { AuthorizationError, authorize } = await import('../server/auth.js');

    await expect(authorize('expired-token')).rejects.toBeInstanceOf(AuthorizationError);
  });

  it('rejects another valid Supabase user even when their token verifies', async () => {
    vi.stubEnv('SUPABASE_URL', config.supabaseUrl);
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', config.supabasePublishableKey);
    vi.stubEnv('OWNER_USER_ID', 'owner-uuid');
    vi.stubGlobal('fetch', vi.fn(async () => json({ id: 'different-uuid', aud: 'authenticated' })));
    const { OwnerForbiddenError, authorize } = await import('../server/auth.js');

    await expect(authorize('valid-but-not-owner')).rejects.toBeInstanceOf(OwnerForbiddenError);
  });

  it('returns only the configured owner after Supabase verifies the supplied token', async () => {
    vi.stubEnv('SUPABASE_URL', config.supabaseUrl);
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', config.supabasePublishableKey);
    vi.stubEnv('OWNER_USER_ID', 'owner-uuid');
    vi.stubGlobal('fetch', vi.fn(async () => json({ id: 'owner-uuid', aud: 'authenticated' })));
    const { authorize } = await import('../server/auth.js');

    await expect(authorize('valid-owner-token')).resolves.toEqual({ id: 'owner-uuid' });
  });

  it('accepts the legacy anon key only when no publishable key is configured', async () => {
    vi.stubEnv('SUPABASE_URL', config.supabaseUrl);
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('SUPABASE_ANON_KEY', 'legacy-anon-key');
    vi.stubEnv('OWNER_USER_ID', 'owner-uuid');
    vi.stubGlobal('fetch', vi.fn(async () => json({ id: 'owner-uuid', aud: 'authenticated' })));
    const { authorize } = await import('../server/auth.js');

    await expect(authorize('valid-owner-token')).resolves.toEqual({ id: 'owner-uuid' });
  });
});

describe('browser Magic Link client', () => {
  it('requests an existing-user Magic Link with a same-origin redirect and enforces a resend cooldown', async () => {
    window.history.replaceState({}, '', '/?lesson=ts01.inference-literals#stale-auth-hash');
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === '/api/config') return json(config);
      expect(init?.body).toContain('"create_user":false');
      expect(new URL(String(input)).searchParams.get('redirect_to')).toBe('http://localhost:3000/?lesson=ts01.inference-literals');
      return json({});
    });
    vi.stubGlobal('fetch', fetch);
    const { loadAppConfig, requestMagicLink } = await import('../src/auth/client.js');

    await loadAppConfig();
    await expect(requestMagicLink('owner@example.com')).resolves.toBeUndefined();
    await expect(requestMagicLink('owner@example.com')).rejects.toThrow('Please wait');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
