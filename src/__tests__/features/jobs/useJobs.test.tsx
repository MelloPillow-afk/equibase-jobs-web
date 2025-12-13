import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useJobs } from '@/features/jobs'
import * as api from '@/lib/api'
import type { JobsResponse } from '@/features/jobs'

// Mock the API module
vi.mock('@/lib/api')

// Mock Server Store
vi.mock('@/features/server-status', () => ({
    useServerStore: vi.fn((selector) => selector({
        status: 'online',
        setStatus: vi.fn(),
        lastApiCall: Date.now(),
        isIdle: false,
        setIdle: vi.fn(),
        updateLastApiCall: vi.fn(),
    })),
}))

describe('useJobs', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        })
        vi.clearAllMocks()
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    it('should fetch jobs successfully', async () => {
        const mockResponse: JobsResponse = {
            data: [
                {
                    id: '1',
                    title: 'Test Job',
                    status: 'completed',
                    pdf_url: 'https://example.com/test.pdf',
                    file_download_url: 'https://example.com/test.csv',
                    created_at: '2025-01-01T00:00:00Z',
                },
            ],
            page: 1,
            limit: 20,
            has_next_page: false,
        }

        vi.mocked(api.fetchJobs).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useJobs(1, 20), { wrapper })

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(mockResponse)
        expect(api.fetchJobs).toHaveBeenCalledWith(1, 20)
    })

    it('should handle errors', async () => {
        const mockError = new Error('API Error')
        vi.mocked(api.fetchJobs).mockRejectedValue(mockError)

        const { result } = renderHook(() => useJobs(), { wrapper })

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toEqual(mockError)
    })

    it('should use default pagination values', async () => {
        const mockResponse: JobsResponse = {
            data: [],
            page: 1,
            limit: 20,
            has_next_page: false,
        }

        vi.mocked(api.fetchJobs).mockResolvedValue(mockResponse)

        renderHook(() => useJobs(), { wrapper })

        await waitFor(() => {
            expect(api.fetchJobs).toHaveBeenCalledWith(1, 20)
        })
    })
})
