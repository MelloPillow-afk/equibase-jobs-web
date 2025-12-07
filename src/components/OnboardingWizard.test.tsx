import { render, screen, fireEvent, act } from '@testing-library/react'
import { OnboardingWizard } from './OnboardingWizard'
import { useOnboardingStore } from '../stores/useOnboardingStore'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the store to have control over state in tests
const originalState = useOnboardingStore.getState()

describe('OnboardingWizard', () => {
    beforeEach(() => {
        useOnboardingStore.setState(originalState)
        useOnboardingStore.setState({
            isOpen: false,
            hasSeenOnboarding: false
        })

        // Mock timing for auto-open
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should not be visible initially', () => {
        // It mocks "false" forisOpen initially
        render(<OnboardingWizard />)
        const dialog = screen.queryByRole('dialog')
        expect(dialog).not.toBeInTheDocument()
    })

    it('should open automatically after delay if not seen', async () => {
        render(<OnboardingWizard />)

        // Advance timers to trigger the useEffect timeout
        act(() => {
            vi.advanceTimersByTime(1500)
        })

        act(() => {
            vi.advanceTimersByTime(1500)
        })

        expect(useOnboardingStore.getState().isOpen).toBe(true)
    })

    it('should show the first step content', () => {
        useOnboardingStore.setState({ isOpen: true, hasSeenOnboarding: false })
        render(<OnboardingWizard />)

        expect(screen.getByText('Welcome to Equibase Processor')).toBeInTheDocument()
        expect(screen.getByText(/process horse racing PDFs/i)).toBeInTheDocument()
    })

    it('should navigate to next step', async () => {
        useOnboardingStore.setState({ isOpen: true, hasSeenOnboarding: false })
        render(<OnboardingWizard />)

        const nextButton = screen.getByText('Next')
        fireEvent.click(nextButton)

        expect(screen.getByText('Upload Your PDF')).toBeInTheDocument()
    })

    it('should close and mark as seen when Skip is clicked', () => {
        useOnboardingStore.setState({ isOpen: true, hasSeenOnboarding: false })
        render(<OnboardingWizard />)

        const skipButton = screen.getByText('Skip')
        fireEvent.click(skipButton)

        expect(useOnboardingStore.getState().isOpen).toBe(false)
        expect(useOnboardingStore.getState().hasSeenOnboarding).toBe(true)
    })

    it('should close and mark as seen when Get Started (Finish) is clicked', () => {
        useOnboardingStore.setState({ isOpen: true, hasSeenOnboarding: false })
        render(<OnboardingWizard />)

        // Go to last step (there are 5 steps, so 4 clicks)
        const nextButton = screen.getByText('Next')
        fireEvent.click(nextButton) // 2
        fireEvent.click(nextButton) // 3
        fireEvent.click(nextButton) // 4
        fireEvent.click(nextButton) // 5

        const finishButton = screen.getByText('Get Started')
        fireEvent.click(finishButton)

        expect(useOnboardingStore.getState().isOpen).toBe(false)
        expect(useOnboardingStore.getState().hasSeenOnboarding).toBe(true)
    })
})
