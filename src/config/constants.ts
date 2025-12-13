/**
 * Application Constants
 * Centralized constants for the application to avoid magic numbers and strings.
 */

export const APP_NAME = 'Equibase PDF Processor' as const

export const POLLING_INTERVALS = {
  JOB_STATUS: 3000,      // 3 seconds - for polling job status updates
  SERVER_HEALTH: 2000,   // 2 seconds - for server health checks when offline
  IDLE_CHECK: 60000,     // 1 minute - for checking idle timeout
} as const

export const TIMEOUTS = {
  API_REQUEST: 15000,     // 15 seconds - default API request timeout
  IDLE_THRESHOLD: 900000, // 15 minutes - idle timeout threshold
  HEALTH_CHECK: 5000,     // 5 seconds - health check specific timeout
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
} as const

export const FILE_UPLOAD = {
  MAX_SIZE_MB: 4,
  MAX_SIZE_BYTES: 4 * 1024 * 1024, // 4MB in bytes
  ALLOWED_TYPES: ['application/pdf'],
} as const
