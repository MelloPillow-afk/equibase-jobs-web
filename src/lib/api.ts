import type { Job, JobsResponse, CreateJobPayload } from '@/types/job'

/**
 * Base API URL from environment variables
 */
const API_URL = import.meta.env.VITE_API_URL as string

/**
 * Generic fetch wrapper with error handling
 */
/**
 * Generic fetch wrapper with error handling
 */
async function fetchClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { timeout = 15000, ...fetchOptions } = options as RequestInit & { timeout?: number }

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
        signal: controller.signal,
        ...fetchOptions,
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config)
        clearTimeout(id)

        if (!response.ok) {
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
