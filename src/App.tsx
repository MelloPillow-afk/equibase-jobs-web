import { JobsPage } from "@/components/JobsPage"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useServerStore } from "@/stores/useServerStore"
import { checkHealth } from "@/lib/api"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { TopBar } from "@/components/TopBar"
import { OnboardingWizard } from "@/components/OnboardingWizard"
import { AuthModal } from "@/components/AuthModal"
import { useAuthStore } from "@/stores/useAuthStore"
import { supabase } from "@/lib/supabase"

function App() {
  const { setStatus, setIdle, lastApiCall, isIdle } = useServerStore()
  const { setSession } = useAuthStore()

  // Auth Initialization
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [setSession])

  // Initial Health Check & Polling
  useEffect(() => {
    let pollingInterval: ReturnType<typeof setInterval>

    const startPolling = async () => {
      setStatus('starting')
      try {
        await checkHealth()
        setStatus('online')
      } catch (e) {
        console.error("Initial health check failed, starting polling...", e)
        setStatus('offline')

        // Start polling if initial check fails
        pollingInterval = setInterval(async () => {
          try {
            await checkHealth()
            setStatus('online')
            clearInterval(pollingInterval)
          } catch (e) {
            // Keep polling
            console.log("Server still waking up...")
          }
        }, 2000)
      }
    }

    startPolling()

    return () => {
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [setStatus])

  // Idle Timer Logic (15 minutes)
  useEffect(() => {
    if (isIdle) return

    const checkIdle = () => {
      const now = Date.now()
      const timeSinceLastCall = now - lastApiCall
      // 15 minutes = 15 * 60 * 1000 = 900000 ms
      if (timeSinceLastCall > 900000) {
        setIdle(true)
      }
    }

    const interval = setInterval(checkIdle, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [lastApiCall, isIdle, setIdle])

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <TopBar />
        <TooltipProvider>
          <JobsPage />
        </TooltipProvider>
        <OnboardingWizard />
        <AuthModal />
        <Toaster />
      </ThemeProvider>
    </div>
  )
}

export default App
