import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { DownloadButton } from "@/features/jobs"

// Mock TooltipProvider to avoid issues in tests if needed, 
// but usually it works fine with proper setup. 
// If it fails, we might need to wrap render.

describe("DownloadButton", () => {
    const mockUrl = "https://example.com/file.csv"
    const mockFileName = "test.csv"

    beforeEach(() => {
        // Mock global fetch
        globalThis.fetch = vi.fn()
        // Mock window.URL
        window.URL.createObjectURL = vi.fn(() => "blob:url")
        window.URL.revokeObjectURL = vi.fn()
        // Mock window.alert
        window.alert = vi.fn()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it("renders disabled button when status is processing", () => {
        render(<DownloadButton status="processing" downloadUrl={mockUrl} />)
        const button = screen.getByRole("button", { name: /download csv/i })
        expect(button).toBeDisabled()
    })

    it("renders enabled button when status is completed", () => {
        render(<DownloadButton status="completed" downloadUrl={mockUrl} />)
        const button = screen.getByRole("button", { name: /download csv/i })
        expect(button).toBeEnabled()
    })

    it("renders disabled button when status is completed but no url", () => {
        render(<DownloadButton status="completed" />)
        // The accessible name might be "Download CSV" because of the sr-only span, 
        // but the tooltip would say "Download not available".
        // Let's check the button state.
        const button = screen.getByRole("button", { name: /download csv/i })
        expect(button).toBeDisabled()
    })

    it("handles successful download", async () => {
        const mockBlob = new Blob(["test data"], { type: "text/csv" })
            ; (globalThis.fetch as any).mockResolvedValueOnce({
                ok: true,
                blob: async () => mockBlob,
            })

        render(<DownloadButton status="completed" downloadUrl={mockUrl} fileName={mockFileName} />)

        const button = screen.getByRole("button", { name: /download csv/i })
        fireEvent.click(button)

        expect(globalThis.fetch).toHaveBeenCalledWith(mockUrl)

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob)
        })
    })

    it("handles download error", async () => {
        ; (globalThis.fetch as any).mockResolvedValueOnce({
            ok: false,
        })

        render(<DownloadButton status="completed" downloadUrl={mockUrl} />)

        const button = screen.getByRole("button", { name: /download csv/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith("Failed to download file. Please try again.")
        })
    })
})
