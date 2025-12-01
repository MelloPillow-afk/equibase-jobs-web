import { JobsPage } from "@/components/JobsPage"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <TooltipProvider>
        <JobsPage />
      </TooltipProvider>
    </div>
  )
}

export default App
