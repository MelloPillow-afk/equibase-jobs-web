import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCreateJob } from './useCreateJob'
import * as api from '@/lib/api'
import type { Job, CreateJobPayload } from '@/types/job'

// Mock the API module
vi.mock('@/lib/api')

describe('useCreateJob', () => {
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

    it('should create a job successfully', async () => {
        const mockPayload: CreateJobPayload = {
            title: 'New Job',
            pdf_url: 'https://example.com/test.pdf',
        }

        const mockResponse: Job = {
            id: '1',
            title: 'New Job',
            status: 'processing',
            pdf_url: 'https://example.com/test.pdf',
            created_at: '2025-01-01T00:00:00Z',
        }

        vi.mocked(api.createJob).mockResolvedValue(mockResponse)

        const { result } = renderHook(() => useCreateJob(), { wrapper })

        result.current.mutate(mockPayload)

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(mockResponse)
        expect(api.createJob).toHaveBeenCalledWith(mockPayload, expect.anything())
    })

    it('should handle errors', async () => {
        const mockPayload: CreateJobPayload = {
            title: 'New Job',
            pdf_url: 'https://example.com/test.pdf',
        }

        const mockError = new Error('API Error')
        vi.mocked(api.createJob).mockRejectedValue(mockError)

        const { result } = renderHook(() => useCreateJob(), { wrapper })

        result.current.mutate(mockPayload)

        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })

        expect(result.current.error).toEqual(mockError)
    })

    it('should invalidate jobs query on success', async () => {
        const mockPayload: CreateJobPayload = {
            title: 'New Job',
            pdf_url: 'https://example.com/test.pdf',
        }

        const mockResponse: Job = {
            id: '1',
            title: 'New Job',
            status: 'processing',
            pdf_url: 'https://example.com/test.pdf',
            created_at: '2025-01-01T00:00:00Z',
        }

        vi.mocked(api.createJob).mockResolvedValue(mockResponse)

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

        const { result } = renderHook(() => useCreateJob(), { wrapper })

        result.current.mutate(mockPayload)

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true)
        })

        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['jobs'] })
    })
})
