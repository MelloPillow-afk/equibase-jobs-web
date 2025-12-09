import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { HelpCircle, LogOut } from "lucide-react"
import { useOnboardingStore } from "@/stores/useOnboardingStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { signOut } from "@/lib/auth"
import { toast } from "sonner"

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
            <div className="flex h-16 items-center px-4 container mx-auto">
                <div className="ml-auto flex items-center space-x-4">
                    {session && (
                        <Button
                            variant="ghost"
                            size="icon-lg"
                            onClick={handleSignOut}
                            title="Sign Out"
                        >
                            <LogOut className="h-[1.2rem] w-[1.2rem]" />
                            <span className="sr-only">Sign Out</span>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => useOnboardingStore.getState().openOnboarding()}
                        title="Help / Onboarding"
                    >
                        <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                        <span className="sr-only">Help</span>
                    </Button>
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}
