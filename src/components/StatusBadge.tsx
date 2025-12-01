import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import type { JobStatus } from "@/types/job"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
    status: JobStatus
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const variants: Record<JobStatus, string> = {
        processing: "bg-blue-500 hover:bg-blue-600 border-transparent text-white",
        completed: "bg-green-500 hover:bg-green-600 border-transparent text-white",
        failed: "bg-red-500 hover:bg-red-600 border-transparent text-white",
    }

    const labels: Record<JobStatus, string> = {
        processing: "Processing",
        completed: "Completed",
        failed: "Failed",
    }

    return (
        <Badge
            className={cn(variants[status], className)}
            variant="outline"
            role="status"
            aria-label={`Job status: ${labels[status]}`}
        >
            {status === "processing" && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            )}
            {labels[status]}
        </Badge>
    )
}
