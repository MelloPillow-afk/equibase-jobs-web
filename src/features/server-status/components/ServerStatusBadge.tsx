import { cn } from "@/lib/utils"
import { useServerStore } from "@/features/server-status"

export function ServerStatusBadge({ className }: { className?: string }) {
    const status = useServerStore((state) => state.status)

    if (status === 'online') return null

    const dotColors = {
        online: "bg-green-500",
        starting: "bg-yellow-500",
        offline: "bg-red-500",
    }

    const labels = {
        online: "Operational",
        starting: "Waking Up...",
        offline: "Server Offline",
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm font-medium", className)}>
            <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", dotColors[status])} />
            <span className={cn("text-muted-foreground", status === 'offline' && "text-red-500")}>
                {labels[status]}
            </span>
        </div>
    )
}
