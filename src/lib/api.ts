import type { Job, JobsResponse, CreateJobPayload } from '@/types/job'
import config from '@/config'
import { useServerStore } from '@/stores/useServerStore'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'

/**
 * Generic fetch wrapper with error handling and auth
 */
async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { timeout = config.api.timeout, ...fetchOptions } = options as RequestInit & { timeout?: number }

    // Always attempt to get the session.
    // If not logged in, session is null and no token is attached.
    // If logged in, token is attached.
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token

    const getHeaders = (token: string | null | undefined) => ({
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    })

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const requestConfig: RequestInit = {
        headers: getHeaders(accessToken),
        signal: controller.signal,
        ...fetchOptions,
    }

    try {
        // Reset idle timer on every request
        useServerStore.getState().updateLastApiCall()

        let response = await fetch(`${config.api.baseUrl}${endpoint}`, requestConfig)

        // Handle 401 Unauthorized - Generic Retry logic
        if (response.status === 401) {
            console.warn("401 Unauthorized, attempting to refresh session...")
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

            if (!refreshError && refreshData.session) {
                console.log("Session refreshed, retrying request...")
                // Retry with new token
                const newHeaders = getHeaders(refreshData.session.access_token)
                response = await fetch(`${config.api.baseUrl}${endpoint}`, {
                    ...requestConfig,
                    headers: newHeaders
                })
            } else {
                console.error("Failed to refresh session or no session:", refreshError)
                // Let it fall through to the error handler logic below
            }
        }

        clearTimeout(id)

        if (!response.ok) {
            // Handle 50x errors (Server likely asleep or down)
            if (response.status >= 500) {
                useServerStore.getState().setStatus('offline')
                toast.error("Server is waking up. Please try again in 30 seconds.")
            }

            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `API Error: ${response.statusText}`)
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return null as T
        }

        return await response.json()
    } catch (error) {
        clearTimeout(id)
        console.error('API Request Failed:', error)
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timed out')
        }
        throw error
    }
}

/**
 * Fetch paginated jobs
 */
export async function fetchJobs(page = 1, limit = 20): Promise<JobsResponse> {
    return fetchClient<JobsResponse>(`/jobs?page=${page}&limit=${limit}`)
}

/**
 * Fetch a single job by ID
 */
export async function fetchJobById(jobId: string): Promise<Job> {
    return fetchClient<Job>(`/jobs/${jobId}`)
}

/**
 * Create a new job
 */
export async function createJob(payload: CreateJobPayload): Promise<Job> {
    return fetchClient<Job>('/jobs', {
        method: 'POST',
        body: JSON.stringify(payload),
    })
}

/**
 * Delete a job
 */
export async function deleteJob(jobId: string): Promise<void> {
    return fetchClient<void>(`/jobs/${jobId}`, {
        method: 'DELETE',
    })
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<{ status: string }> {
    return fetchClient<{ status: string }>('/health', {
        timeout: 5000, // Short timeout for health checks
    } as RequestInit & { timeout: number })
}
