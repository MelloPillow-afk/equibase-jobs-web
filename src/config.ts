/**
 * Application Configuration
 * Centralized source of truth for environment-specific variables.
 */

interface Config {
    env: string
    isProduction: boolean
    isDevelopment: boolean
    supabase: {
        url: string
        anonKey: string
    }
    api: {
        baseUrl: string
        timeout: number
    }
}

const env = import.meta.env.MODE
const isProduction = env === 'production'
const isDevelopment = env === 'development'

// Default values can be overridden by environment variables
const config: Config = {
    env,
    isProduction,
    isDevelopment,
    supabase: {
        url: import.meta.env.VITE_SUPABASE_URL || '',
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    },
    api: {
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
        timeout: 15000, // 15 seconds
    },
}

// Validation
if (!config.supabase.url || !config.supabase.anonKey) {
    console.warn('Supabase configuration is missing. Please check your .env file.')
}

export default config
