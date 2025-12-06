import { render, screen, fireEvent, waitFor, within } from "@testing-library/react"
import { JobsTable } from "./JobsTable"
import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Job } from "@/types/job"

// Mock useDeleteJob
const mockDeleteJob = vi.fn()
vi.mock("@/hooks/useDeleteJob", () => ({
    useDeleteJob: () => ({
        mutate: mockDeleteJob,
    }),
}))

// Mock DownloadButton to avoid testing it again
vi.mock("@/components/DownloadButton", () => ({
    DownloadButton: () => <button>Download</button>,
}))

// Mock StatusBadge
vi.mock("@/components/StatusBadge", () => ({
    StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}))

// Mock DropdownMenu
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => <button onClick={onClick}>{children}</button>,
}))

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

// Mock Tooltip
vi.mock("@/components/ui/tooltip", () => ({
    Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
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
        expect(screen.getByText("Test Job 1")).toBeInTheDocument()
        expect(screen.getByText("completed")).toBeInTheDocument()
    })

    it("opens delete confirmation dialog", async () => {
        render(<JobsTable jobs={mockJobs} isLoading={false} />)

        // With mocked DropdownMenu, the content is always visible.
        // We can click "Delete" directly.
        const deleteOption = screen.getByText("Delete")
        fireEvent.click(deleteOption)

        // Check if dialog appears
        expect(screen.getByText("Are you sure?")).toBeInTheDocument()
        expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument()
    })

    it("calls deleteJob when confirmed", async () => {
        render(<JobsTable jobs={mockJobs} isLoading={false} />)

        // Click delete option
        const deleteOption = screen.getByText("Delete")
        fireEvent.click(deleteOption)

        // Click confirm delete in dialog
        // The dialog button usually has specific class or we can find by role within dialog.
        const dialog = screen.getByRole("alertdialog")
        const confirmBtn = within(dialog).getByText("Delete")

        fireEvent.click(confirmBtn)

        expect(mockDeleteJob).toHaveBeenCalledWith("1")
    })
})
