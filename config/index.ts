/**
 * App Configuration
 * Reads from environment variables with safe defaults for Phase 1
 */

import Constants from 'expo-constants';

const expoConfig = Constants.expoConfig;

export const config = {
  // App metadata
  app: {
    name: expoConfig?.name ?? 'IntentList',
    version: expoConfig?.version ?? '1.0.0',
    scheme: expoConfig?.scheme ?? 'intentlist',
  },

  // Environment
  env: (expoConfig?.extra?.env ?? process.env.APP_ENV ?? 'development') as
    | 'development'
    | 'staging'
    | 'production',

  // Debug mode
  debug: process.env.DEBUG === 'true',

  // Supabase (Phase 2+)
  supabase: {
    url: process.env.SUPABASE_URL ?? null,
    anonKey: process.env.SUPABASE_ANON_KEY ?? null,
  },

  // Phase 3+: Calendar integration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? null,
  },

  // Analytics (optional)
  analytics: {
    posthogKey: process.env.POSTHOG_API_KEY ?? null,
    posthogHost: process.env.POSTHOG_HOST ?? null,
  },

  // Error monitoring (optional)
  sentry: {
    dsn: process.env.SENTRY_DSN ?? null,
  },

  // Feature flags for Phase 1
  features: {
    moodState: true,
    taskCap: true,
    frictionMapping: false, // Phase 2
    sundayReckoning: false, // Phase 2
    trueContextMoment: false, // Phase 3
    teamFeatures: false, // Phase 3
  },

  // Phase 1 constraints
  constraints: {
    activeTaskLimit: 15,
    moodStateOptions: 5,
    focusedTaskViewLimit: 6,
    frictionInterventionThreshold: 8,
  },
} as const;

export type Config = typeof config;

/**
 * Get a configuration value with type safety
 * @example config.app.name
 * @example config.constraints.activeTaskLimit
 */
export const getConfig = () => config;

/**
 * Check if running in development mode
 */
export const isDev = config.env === 'development';

/**
 * Check if running in production mode
 */
export const isProd = config.env === 'production';

/**
 * Check if debug mode is enabled
 */
export const isDebug = config.debug;
