import { ModeToggle } from "@/components/mode-toggle"

export function TopBar() {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4 container mx-auto">
                <div className="ml-auto flex items-center space-x-4">
                    <ModeToggle />
                </div>
            </div>
        </div>
    )
}
