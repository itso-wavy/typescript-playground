import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class AuthorizationError extends Error {
  readonly status = 401;
}

export class OwnerForbiddenError extends Error {
  readonly status = 403;
}

export class AuthorizationConfigurationError extends Error {
  readonly status = 503;
}

function getRequiredEnvironment(name: 'SUPABASE_URL' | 'OWNER_USER_ID'): string {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const value = runtime.process?.env?.[name]?.trim();
  if (!value) throw new AuthorizationConfigurationError(`${name} is required for private API authorization.`);
  return value;
}

function getRequiredSupabaseKey(): string {
  const runtime = globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } };
  const publishableKey = runtime.process?.env?.SUPABASE_PUBLISHABLE_KEY?.trim();
  const legacyAnonKey = runtime.process?.env?.SUPABASE_ANON_KEY?.trim();
  if (publishableKey) return publishableKey;
  if (legacyAnonKey) return legacyAnonKey;
  throw new AuthorizationConfigurationError('SUPABASE_PUBLISHABLE_KEY is required for private API authorization.');
}

function getServerClient(): SupabaseClient {
  const url = getRequiredEnvironment('SUPABASE_URL');
  const key = getRequiredSupabaseKey();
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function authorize(token: string): Promise<{ id: string }> {
  if (!token.trim()) throw new AuthorizationError('A bearer token is required.');
  const ownerId = getRequiredEnvironment('OWNER_USER_ID');
  const { data, error } = await getServerClient().auth.getUser(token);
  if (error || !data.user) throw new AuthorizationError(error?.message ?? 'The bearer token is invalid.');
  if (data.user.id !== ownerId) throw new OwnerForbiddenError('This authenticated user is not the configured owner.');
  return { id: data.user.id };
}
