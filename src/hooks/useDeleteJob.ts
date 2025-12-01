import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteJob } from '@/lib/api'

/**
 * Hook for deleting jobs
 */
export function useDeleteJob() {
    const queryClient = useQueryClient()

    return useMutation<void, Error, string>({
        mutationFn: deleteJob,
        onSuccess: () => {
            // Invalidate jobs query to refetch the list
            queryClient.invalidateQueries({ queryKey: ['jobs'] })
        },
    })
}
