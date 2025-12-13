import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useAuthStore, signIn } from "@/features/auth"

export function AuthModal() {
    const { isAuthModalOpen } = useAuthStore()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Cannot close by clicking outside if not logged in
    const handleOpenChange = (_open: boolean) => {
        // If we are open and trying to close, prevent it unless we add logic later.
        // But for now, if they are not logged in, they must sign in.
        // The store controls this based on session existence.
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error("Please fill in all fields")
            return
        }

        setIsLoading(true)
        try {
            await signIn(email, password)
            toast.success("Signed in successfully")
            // Store will automatically update session state via onAuthStateChange in App.tsx
            // creating a reaction that closes this modal.
        } catch (error: any) {
            console.error("Sign in error:", error)
            toast.error(error.message || "Failed to sign in")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isAuthModalOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-[400px] md:max-w-[500px] p-8"
                // Prevent closing by clicking outside or escape for mandatory auth
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-3xl font-bold text-center">Sign In</DialogTitle>
                    <DialogDescription className="text-center text-lg mt-2">
                        Please sign in to continue
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-lg">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-14 text-lg" // Large touch target
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="password" className="text-lg">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 text-lg" // Large touch target
                            disabled={isLoading}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-semibold mt-4"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
