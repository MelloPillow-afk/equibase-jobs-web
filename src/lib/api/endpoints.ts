import type { Job, JobsResponse, CreateJobPayload } from '@/features/jobs'
import { fetchClient } from './client'

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
