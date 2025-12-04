import { Badge } from "@/components/ui/badge"
import { useServerStore } from "@/stores/useServerStore"
import { Loader2, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

export function ServerStatusBadge({ className }: { className?: string }) {
    const status = useServerStore((state) => state.status)

    const variants = {
        online: "bg-green-500 hover:bg-green-600 border-transparent text-white",
        starting: "bg-yellow-500 hover:bg-yellow-600 border-transparent text-white",
        offline: "bg-red-500 hover:bg-red-600 border-transparent text-white",
    }

    const icons = {
        online: Wifi,
        starting: Loader2,
        offline: WifiOff,
    }

    const labels = {
        online: "Server Online",
        starting: "Waking Up...",
        offline: "Server Offline",
    }

    const Icon = icons[status]

    return (
        <Badge
            className={cn("gap-1.5 transition-colors", variants[status], className)}
            variant="outline"
        >
            <Icon className={cn("h-3.5 w-3.5", status === "starting" && "animate-spin")} />
            {labels[status]}
        </Badge>
    )
}
