import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '@/lib/api'
import type { JobsResponse } from '@/types/job'

import { useServerStore } from '@/stores/useServerStore'

/**
 * Hook for fetching paginated jobs
 */
export function useJobs(page = 1, limit = 20) {
    const status = useServerStore((state) => state.status)

    return useQuery<JobsResponse>({
        queryKey: ['jobs', page, limit],
        queryFn: () => fetchJobs(page, limit),
        enabled: status === 'online',
    })
}
