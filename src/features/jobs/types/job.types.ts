/**
 * Job status enum
 */
export type JobStatus = 'processing' | 'completed' | 'failed'

/**
 * Job interface
 */
export interface Job {
    id: string
    title: string
    status: JobStatus
    pdf_url: string
    file_download_url?: string
    created_at: string
    completed_at?: string
    error_message?: string
}

/**
 * Paginated jobs response
 */
export interface JobsResponse {
    data: Job[]
    page: number
    limit: number
    has_next_page: boolean
}

/**
 * Create job payload
 */
export interface CreateJobPayload {
    title: string
    pdf_url: string
}
