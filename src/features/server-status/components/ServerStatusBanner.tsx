import { WifiOff, Loader2 } from "lucide-react"
import { useServerStore } from "@/features/server-status"

export function ServerStatusBanner() {
    const { status } = useServerStore()

    if (status === 'online') return null

    return (
        <div className={`
            w-full px-4 py-3 text-sm font-medium text-center flex items-center justify-center gap-2
            ${status === 'offline' ? 'bg-destructive text-destructive-foreground' : 'bg-yellow-500 text-white'}
        `}>
            {status === 'offline' ? (
                <>
                    <WifiOff className="h-4 w-4" />
                    <span>Server Offline: Processing is currently paused.</span>
                </>
            ) : (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Server Waking Up: Please wait a moment...</span>
                </>
            )}
        </div>
    )
}
