import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useOnboardingStore } from "@/stores/useOnboardingStore"

export function TopBar() {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <div className="ml-auto flex items-center space-x-4">
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
