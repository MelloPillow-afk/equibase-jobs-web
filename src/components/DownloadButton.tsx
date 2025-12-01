import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { JobStatus } from "@/types/job"

interface DownloadButtonProps {
    status: JobStatus
    downloadUrl?: string
    fileName?: string
}

export function DownloadButton({ status, downloadUrl, fileName }: DownloadButtonProps) {
    if (status !== "completed" || !downloadUrl) {
        return null
    }

    return (
        <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2"
        >
            <a href={downloadUrl} download={fileName} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                Download CSV
            </a>
        </Button>
    )
}
