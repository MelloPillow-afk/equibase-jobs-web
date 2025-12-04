import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useJobPolling } from './useJobPolling'
import type { Job } from '@/types/job'

describe('useJobPolling', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient()
        vi.useFakeTimers()
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    it('should poll processing jobs every 3 seconds', () => {
        const processingJobs: Job[] = [
            {
                id: '1',
                title: 'Processing Job 1',
                status: 'processing',
                pdf_url: 'https://example.com/test1.pdf',
                created_at: '2025-01-01T00:00:00Z',
            },
            {
                id: '2',
                title: 'Processing Job 2',
                status: 'processing',
                pdf_url: 'https://example.com/test2.pdf',
                created_at: '2025-01-01T00:00:00Z',
            },
        ]

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useJobPolling(processingJobs), { wrapper })

        // Fast-forward 3 seconds
        vi.advanceTimersByTime(3000)

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['job', '1'] })
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['job', '2'] })
    })

    it('should not poll when there are no processing jobs', () => {
        const completedJobs: Job[] = [
            {
                id: '1',
                title: 'Completed Job',
                status: 'completed',
                pdf_url: 'https://example.com/test.pdf',
                file_download_url: 'https://example.com/test.csv',
                created_at: '2025-01-01T00:00:00Z',
                completed_at: '2025-01-01T00:05:00Z',
            },
        ]

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        renderHook(() => useJobPolling(completedJobs), { wrapper })

        // Fast-forward 3 seconds
        vi.advanceTimersByTime(3000)

        expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('should clean up interval on unmount', () => {
        const processingJobs: Job[] = [
            {
                id: '1',
                title: 'Processing Job',
                status: 'processing',
                pdf_url: 'https://example.com/test.pdf',
                created_at: '2025-01-01T00:00:00Z',
            },
        ]

        const { unmount } = renderHook(() => useJobPolling(processingJobs), { wrapper })

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        unmount()

        // Fast-forward 3 seconds after unmount
        vi.advanceTimersByTime(3000)

        // Should not be called since the interval was cleared
        expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('should restart polling when jobs change', () => {
        const initialJobs: Job[] = [
            {
                id: '1',
                title: 'Processing Job',
                status: 'processing',
                pdf_url: 'https://example.com/test.pdf',
                created_at: '2025-01-01T00:00:00Z',
            },
        ]

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        const { rerender } = renderHook(({ jobs }) => useJobPolling(jobs), {
            wrapper,
            initialProps: { jobs: initialJobs },
        })

        vi.advanceTimersByTime(3000)
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['job', '1'] })

        invalidateSpy.mockClear()

        // Update jobs
        const newJobs: Job[] = [
            {
                id: '2',
                title: 'New Processing Job',
                status: 'processing',
                pdf_url: 'https://example.com/test2.pdf',
                created_at: '2025-01-01T00:00:00Z',
            },
        ]

        rerender({ jobs: newJobs })

        vi.advanceTimersByTime(3000)
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['job', '2'] })
        expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['job', '1'] })
    })
})
