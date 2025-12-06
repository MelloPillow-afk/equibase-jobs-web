import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { JobsPage } from './JobsPage'
import * as api from '@/lib/api'
import type { JobsResponse } from '@/types/job'
import { TooltipProvider } from '@/components/ui/tooltip'

// Mock Config
vi.mock('@/config', () => ({
    default: {
        api: { baseUrl: 'http://localhost:3000', timeout: 1000 },
        supabase: { url: 'https://example.supabase.co', anonKey: 'test-key' }
    }
}))

// Mock Server Store
vi.mock('@/stores/useServerStore', () => ({
    useServerStore: vi.fn((selector) => selector({
        status: 'online',
        setStatus: vi.fn(),
        lastApiCall: Date.now(),
        isIdle: false,
        setIdle: vi.fn(),
        updateLastApiCall: vi.fn(),
    })),
}))

// Mock API and Supabase
vi.mock('@/lib/api')
vi.mock('@/lib/supabase', () => ({
    supabase: {
        channel: vi.fn(() => ({
            on: vi.fn(),
            subscribe: vi.fn(),
        })),
        removeChannel: vi.fn(),
    },
    uploadPDF: vi.fn(),
    getPDFUrl: vi.fn(),
    getCSVDownloadUrl: vi.fn(),
}))

// Mock ResizeObserver for Shadcn/ui
globalThis.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

describe('JobsPage Integration', () => {
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

    const renderPage = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <JobsPage />
                </TooltipProvider>
            </QueryClientProvider>
        )
    }

    it('should render jobs list successfully', async () => {
        const mockResponse: JobsResponse = {
            data: [
                {
                    id: '1',
                    title: 'Test Job 1',
                    status: 'completed',
                    pdf_url: 'https://example.com/1.pdf',
                    created_at: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Test Job 2',
                    status: 'processing',
                    pdf_url: 'https://example.com/2.pdf',
                    created_at: new Date().toISOString(),
                },
            ],
            page: 1,
            limit: 10,
            has_next_page: true,
        }

        vi.mocked(api.fetchJobs).mockResolvedValue(mockResponse)

        renderPage()

        // Check for loading state (skeleton)
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Test Job 1')).toBeInTheDocument()
        })

        expect(screen.getByText('Test Job 2')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.getByText('Processing')).toBeInTheDocument()
    })

    it('should handle empty state', async () => {
        const mockResponse: JobsResponse = {
            data: [],
            page: 1,
            limit: 10,
            has_next_page: false,
        }

        vi.mocked(api.fetchJobs).mockResolvedValue(mockResponse)

        renderPage()

        await waitFor(() => {
            expect(screen.getByText('No jobs found')).toBeInTheDocument()
        })
    })

    it('should handle pagination', async () => {
        const page1Response: JobsResponse = {
            data: [{ id: '1', title: 'Page 1 Job', status: 'completed', pdf_url: '', created_at: new Date().toISOString() }],
            page: 1,
            limit: 10,
            has_next_page: true,
        }

        const page2Response: JobsResponse = {
            data: [{ id: '2', title: 'Page 2 Job', status: 'completed', pdf_url: '', created_at: new Date().toISOString() }],
            page: 2,
            limit: 10,
            has_next_page: false,
        }

        vi.mocked(api.fetchJobs)
            .mockResolvedValueOnce(page1Response)
            .mockResolvedValueOnce(page2Response)

        renderPage()

        await waitFor(() => {
            expect(screen.getByText('Page 1 Job')).toBeInTheDocument()
        })

        const nextButton = screen.getByText('Next')
        fireEvent.click(nextButton)

        await waitFor(() => {
            expect(screen.getByText('Page 2 Job')).toBeInTheDocument()
        })

        expect(api.fetchJobs).toHaveBeenCalledWith(2, 10)
    })

    it('should open create job modal', async () => {
        const mockResponse: JobsResponse = {
            data: [],
            page: 1,
            limit: 10,
            has_next_page: false,
        }
        vi.mocked(api.fetchJobs).mockResolvedValue(mockResponse)

        renderPage()

        await waitFor(() => {
            expect(screen.getByText('New Job')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('New Job'))

        await waitFor(() => {
            expect(screen.getByText('Upload PDF')).toBeInTheDocument()
            expect(screen.getByLabelText('PDF File')).toBeInTheDocument()
        })
    })
})
