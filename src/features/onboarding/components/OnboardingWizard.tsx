import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, FileUp, CheckCircle, HelpCircle } from "lucide-react"
import { useOnboardingStore } from "@/features/onboarding"

const steps = [
    {
        title: "Welcome to Equibase Processor",
        description: "This tool helps you process horse racing PDFs into usable CSV data quickly and easily.",
        icon: <Upload className="w-16 h-16 text-primary mb-6" />,
    },
    {
        title: "Upload Your PDF",
        description: "Click the 'New Job' button to start. You can simply drag and drop your PDF or select it from your device.",
        icon: <FileUp className="w-16 h-16 text-blue-500 mb-6" />,
    },
    {
        title: "Wait for Processing",
        description: "The system will process your file. You'll see the status change from 'Processing' to 'Completed'.",
        icon: <CheckCircle className="w-16 h-16 text-orange-500 mb-6" />,
    },
    {
        title: "Download Results",
        description: "Once completed, a download button will appear. Click it to get your CSV file.",
        icon: <CheckCircle className="w-16 h-16 text-green-500 mb-6" />,
    },
    {
        title: "Need Help?",
        description: "You can always see this guide again by clicking the question mark icon in the top right corner.",
        icon: <HelpCircle className="w-16 h-16 text-purple-500 mb-6" />,
    },
]

export function OnboardingWizard() {
    const { isOpen, closeOnboarding, finishOnboarding, hasSeenOnboarding, openOnboarding } = useOnboardingStore()
    const [currentStep, setCurrentStep] = useState(0)

    // Auto-open on first visit
    useEffect(() => {
        if (!hasSeenOnboarding) {
            // Small delay to ensure UI is ready
            const timer = setTimeout(() => {
                openOnboarding()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [hasSeenOnboarding, openOnboarding])

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            finishOnboarding()
            setCurrentStep(0)
        }
    }

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSkip = () => {
        finishOnboarding()
        setCurrentStep(0)
    }

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            // If closing via clicking outside or ESC, considered "skipping" effectively for this session,
            // but maybe we don't mark as "seen" permanently unless they explicitly skip/finish?
            // For simplicity/UX, let's just close. If they haven't finished, it might pop up next time or be annoying.
            // Let's rely on explicit buttons for "Finish/Skip" to set the flag, but allow closing temporarily.
            closeOnboarding()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] md:max-w-[700px] text-center p-8 sm:p-12">
                <DialogHeader className="flex flex-col items-center justify-center pt-4">
                    {steps[currentStep].icon}
                    <DialogTitle className="text-3xl sm:text-4xl mb-4 font-bold tracking-tight">{steps[currentStep].title}</DialogTitle>
                    <DialogDescription className="text-xl leading-relaxed">
                        {steps[currentStep].description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center gap-2 my-8">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-3 rounded-full transition-all duration-300 ${index === currentStep ? 'w-12 bg-primary' : 'w-3 bg-muted'}`}
                        />
                    ))}
                </div>

                <DialogFooter className="sm:justify-between flex-row gap-4 mt-6 items-center">
                    <Button variant="ghost" size="lg" onClick={handleSkip} className="mr-auto text-muted-foreground hover:text-foreground text-lg h-14">
                        Skip
                    </Button>

                    <div className="flex gap-3">
                        <Button variant="outline" size="lg" onClick={handleBack} disabled={currentStep === 0} className="text-lg h-14 px-8">
                            Back
                        </Button>
                        <Button size="lg" onClick={handleNext} className="text-lg h-14 px-8 shadow-md">
                            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
