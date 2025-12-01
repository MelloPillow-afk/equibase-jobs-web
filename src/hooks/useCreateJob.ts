import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createJob } from '@/lib/api'
import type { CreateJobPayload, Job } from '@/types/job'

/**
 * Hook for creating new jobs
 */
export function useCreateJob() {
    const queryClient = useQueryClient()

    return useMutation<Job, Error, CreateJobPayload>({
        mutationFn: createJob,
        onSuccess: () => {
            // Invalidate jobs query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        },
    })
}
