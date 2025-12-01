import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '@/lib/api'
import type { JobsResponse } from '@/types/job'

/**
 * Hook for fetching paginated jobs
 */
export function useJobs(page = 1, limit = 20) {
    return useQuery<JobsResponse>({
        queryKey: ['jobs', page, limit],
        queryFn: () => fetchJobs(page, limit),
    })
}
