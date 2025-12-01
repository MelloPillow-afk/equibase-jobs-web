import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useDeleteJob } from './useDeleteJob'
import * as api from '@/lib/api'

// Mock the API module
vi.mock('@/lib/api')

describe('useDeleteJob', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                mutations: {
                    retry: false,
                },
            },
        })
        vi.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    it('should delete a job successfully', async () => {
        const jobId = '123'

        vi.mocked(api.deleteJob).mockResolvedValue(undefined)

        const { result } = renderHook(() => useDeleteJob(), { wrapper })

        result.current.mutate(jobId)

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(api.deleteJob).toHaveBeenCalledWith(jobId, expect.anything())
    })

    it('should handle errors', async () => {
        const jobId = '123'
        const mockError = new Error('API Error')

        vi.mocked(api.deleteJob).mockRejectedValue(mockError)

        const { result } = renderHook(() => useDeleteJob(), { wrapper })

        result.current.mutate(jobId)

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toEqual(mockError)
    })

    it('should invalidate jobs query on success', async () => {
        const jobId = '123'

        vi.mocked(api.deleteJob).mockResolvedValue(undefined)

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(() => useDeleteJob(), { wrapper })

        result.current.mutate(jobId)

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['jobs'] })
    })
})
