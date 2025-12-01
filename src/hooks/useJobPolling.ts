import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Job } from '@/types/job'

/**
 * Hook for polling jobs with status="processing"
 * Polls every 3 seconds and invalidates individual job queries
 */
export function useJobPolling(jobs: Job[]) {
    const queryClient = useQueryClient()

    useEffect(() => {
        const processingJobs = jobs.filter(j => j.status === 'processing')

        if (processingJobs.length > 0) {
            const interval = setInterval(() => {
                processingJobs.forEach(job => {
                    queryClient.invalidateQueries({ queryKey: ['job', job.id] })
                })
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [jobs, queryClient])
}
