import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip"
import type { JobStatus } from "@/features/jobs"

interface DownloadButtonProps {
    status: JobStatus
    downloadUrl?: string
    fileName?: string
    className?: string
}

export function DownloadButton({ status, downloadUrl, fileName, className }: DownloadButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDownload = async () => {
        if (!downloadUrl) return

        try {
            setIsLoading(true)
            const response = await fetch(downloadUrl)

            if (!response.ok) {
                throw new Error("Download failed")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = fileName || "download.csv"
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Download error:", error)
            window.alert("Failed to download file. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const isDisabled = status !== "completed" || !downloadUrl || isLoading

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={isDisabled}
                        onClick={handleDownload}
                        className={className}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        <span className="sr-only">Download CSV</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>
                        {status !== "completed"
                            ? "Job is processing"
                            : !downloadUrl
                                ? "Download not available"
                                : "Download CSV"}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
