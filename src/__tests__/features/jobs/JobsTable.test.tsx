import { render, screen, fireEvent, within } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { JobsTable } from "@/features/jobs"
import type { Job } from "@/features/jobs"

// Mock useDeleteJob
const mockDeleteJob = vi.fn()
vi.mock("@/features/jobs", async () => {
    const actual = await vi.importActual("@/features/jobs")
    return {
        ...actual,
        useDeleteJob: () => ({
            mutate: mockDeleteJob,
        }),
        DownloadButton: () => <button>Download</button>,
        StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
    }
})

// Mock DropdownMenu - NO LONGER USED in component but if other tests need it keep it? No, specific to this file.
// Removing unused mocks.

// Mock AlertDialog
vi.mock("@/components/ui/alert-dialog", () => ({
    AlertDialog: ({ open, children }: { open: boolean, children: React.ReactNode }) => open ? <div role="alertdialog">{children}</div> : null,
    AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
    AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AlertDialogCancel: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    AlertDialogAction: ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => <button onClick={onClick}>{children}</button>,
}))

describe("JobsTable", () => {
    const mockJobs: Job[] = [
        {
            id: "1",
            title: "Test Job 1",
            status: "completed",
            pdf_url: "http://example.com/1.pdf",
            file_download_url: "http://example.com/1.csv",
            created_at: new Date().toISOString(),
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders jobs correctly", () => {
        render(<JobsTable jobs={mockJobs} isLoading={false} />)
        // With responsive design, items might be rendered twice (mobile + desktop)
        const titles = screen.getAllByText("Test Job 1")
        expect(titles.length).toBeGreaterThan(0)

        const statuses = screen.getAllByText("completed")
        expect(statuses.length).toBeGreaterThan(0)
    })

    it("opens delete confirmation dialog", async () => {
        render(<JobsTable jobs={mockJobs} isLoading={false} />)

        // Find delete buttons. Both mobile and desktop view have one.
        // They are "Delete" text in sr-only spans.
        const deleteButtons = screen.getAllByText("Delete")
        // Click the first one (doesn't matter which one triggers the state change)
        fireEvent.click(deleteButtons[0])

        // Check if dialog appears
        expect(screen.getByText("Delete Job")).toBeInTheDocument()
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
    })

    it("calls deleteJob when confirmed", async () => {
        render(<JobsTable jobs={mockJobs} isLoading={false} />)

        // Click delete button
        const deleteButtons = screen.getAllByText("Delete")
        fireEvent.click(deleteButtons[0])

        // Click confirm delete in dialog
        const dialog = screen.getByRole("alertdialog")
        const confirmBtn = within(dialog).getAllByText("Delete")[0] // The action button also says "Delete"

        fireEvent.click(confirmBtn)

        expect(mockDeleteJob).toHaveBeenCalledWith("1")
    })
})
