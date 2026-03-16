export const AUTH_COOKIE_NAME = 'mc_session'
export const DEV_ADMIN_COOKIE_NAME = 'mc_dev_admin'

export const AUTH_TIMINGS = {
  idleSessionMs: 1000 * 60 * 60 * 8,
  absoluteSessionMs: 1000 * 60 * 60 * 24 * 7,
  touchThrottleMs: 1000 * 60 * 5,
} as const

export const AUTH_LIMITS = {
  maxFailedAttempts: 5,
  lockWindowMs: 1000 * 60 * 15,
} as const
