import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface AppConfig {
  localPreview: boolean;
  supabaseUrl: string;
  supabasePublishableKey: string;
}

const MAGIC_LINK_RESEND_COOLDOWN_MS = 60_000;

let supabaseClient: SupabaseClient | null = null;
let lastMagicLinkRequestAt = 0;

function isAppConfig(value: unknown): value is AppConfig {
  if (!value || typeof value !== 'object') return false;
  const config = value as Record<string, unknown>;
  return typeof config.localPreview === 'boolean'
    && typeof config.supabaseUrl === 'string'
    && typeof config.supabasePublishableKey === 'string';
}

function configureClient(config: AppConfig): void {
  supabaseClient = config.supabaseUrl && config.supabasePublishableKey
    ? createClient(config.supabaseUrl, config.supabasePublishableKey)
    : null;
}

export async function loadAppConfig(): Promise<AppConfig> {
  const response = await fetch('/api/config');
  if (!response.ok) {
    throw new Error(`Could not load app configuration (${response.status}).`);
  }
  const config: unknown = await response.json();
  if (!isAppConfig(config)) {
    throw new Error('The server returned an invalid app configuration.');
  }
  configureClient(config);
  return config;
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient;
}

function requireClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) throw new Error('Cloud authentication is not configured.');
  return client;
}

/**
 * Return the current app URL without any auth hash. Supabase appends its
 * session tokens to the hash when the owner opens the email link; keeping the
 * redirect same-origin avoids accepting an arbitrary user-provided target.
 */
export function getAuthRedirectUrl(): string {
  const redirect = new URL(window.location.href);
  redirect.hash = '';
  return redirect.toString();
}

export async function requestMagicLink(email: string): Promise<void> {
  const now = Date.now();
  const remaining = MAGIC_LINK_RESEND_COOLDOWN_MS - (now - lastMagicLinkRequestAt);
  if (remaining > 0) {
    throw new Error(`Please wait ${Math.ceil(remaining / 1000)} seconds before requesting another link.`);
  }

  const { error } = await requireClient().auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: getAuthRedirectUrl(),
    },
  });
  if (error) throw new Error(error.message);
  lastMagicLinkRequestAt = now;
}
