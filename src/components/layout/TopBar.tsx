import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { HelpCircle, LogOut } from "lucide-react"
import { toast } from "sonner"
import { ModeToggle } from "@/features/theme"
import { useOnboardingStore } from "@/features/onboarding"
import { useAuthStore, signOut } from "@/features/auth"
import { ServerStatusBadge } from "@/features/server-status"

export function TopBar() {
    const { session } = useAuthStore()

    const handleSignOut = async () => {
        try {
            await signOut()
            toast.success("Signed out successfully")
        } catch (error) {
            console.error("Error signing out:", error)
            toast.error("Failed to sign out")
        }
    }

    return (
        <div className="border-b">
            <div className="flex h-14 items-center container mx-auto justify-between">
                {/* Branding / Left Side */}
                <div className="flex items-center gap-2 font-bold text-lg">
                    <span className="text-2xl">🏇</span>
                    <span className="hidden sm:inline-block">Equibase PDF Processor</span>

                    <div className="hidden sm:flex items-center ml-2">
                        <Separator orientation="vertical" className="h-6 mx-2" />
                        <ServerStatusBadge />
                    </div>
                </div>

                {/* Right Side Utilities */}
                <div className="flex items-center space-x-2 text-sm">
                    <ModeToggle />
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => useOnboardingStore.getState().openOnboarding()}
                        title="Help / Onboarding"
                    >
                        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Help</span>
                    </Button>
                    {session && (
                        <>
                            <Separator orientation="vertical" className="h-6 mx-2 bg-foreground/20" />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSignOut}
                                title="Sign Out"
                            >
                                <LogOut className="h-[1.2rem] w-[1.2rem]" />
                                <span className="sr-only">Sign Out</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
