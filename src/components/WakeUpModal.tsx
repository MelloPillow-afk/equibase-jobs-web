import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useServerStore } from "@/stores/useServerStore"
import { checkHealth } from "@/lib/api"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function WakeUpModal() {
    const { status, setStatus, setIdle } = useServerStore()
    const [waking, setWaking] = useState(false)

    // Show modal only when offline (asleep)
    const open = status === 'offline'

    const handleWakeUp = async () => {
        setWaking(true)
        setStatus('starting')

        try {
            // Attempt to wake up with retries
            let retries = 3
            while (retries > 0) {
                try {
                    await checkHealth()
                    setStatus('online')
                    setIdle(false)
                    setWaking(false)
                    return
                } catch (e) {
                    retries--
                    if (retries > 0) await new Promise(r => setTimeout(r, 2000))
                }
            }
            // If failed after retries, go back to offline but maybe show error toast
            setStatus('offline')
        } catch (error) {
            console.error("Failed to wake server:", error)
            setStatus('offline')
        } finally {
            setWaking(false)
        }
    }

    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Server is Sleeping</AlertDialogTitle>
                    <AlertDialogDescription>
                        The server has gone to sleep to save resources. It needs to wake up before you can continue.
                        This usually takes about 30-60 seconds.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={handleWakeUp} disabled={waking}>
                        {waking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {waking ? "Waking Up..." : "Wake Up Server"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
