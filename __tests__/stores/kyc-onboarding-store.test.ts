import { renderHook, act } from "@testing-library/react"
import { useKycOnboardingStore } from "@/stores/kyc-onboarding-store"

describe("useKycOnboardingStore", () => {
  beforeEach(() => {
    useKycOnboardingStore.getState().resetState()
  })

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useKycOnboardingStore())

    expect(result.current.isSheetOpen).toBe(false)
    expect(result.current.profileCompleted).toBe(false)
    expect(result.current.biometricsCompleted).toBe(false)
    expect(result.current.showOnboarding).toBe(false)
  })

  it("should update sheet open state", () => {
    const { result } = renderHook(() => useKycOnboardingStore())

    act(() => {
      result.current.setSheetOpen(true)
    })

    expect(result.current.isSheetOpen).toBe(true)
  })

  it("should update KYC status and auto-open sheet when needed", () => {
    const { result } = renderHook(() => useKycOnboardingStore())

    act(() => {
      result.current.setKycStatus({
        profile_completed: false,
        biometrics_completed: false,
        show_onboarding: true,
      })
    })

    expect(result.current.profileCompleted).toBe(false)
    expect(result.current.biometricsCompleted).toBe(false)
    expect(result.current.showOnboarding).toBe(true)
    expect(result.current.isSheetOpen).toBe(true)
  })

  it("should not auto-open sheet when all tasks completed", () => {
    const { result } = renderHook(() => useKycOnboardingStore())

    act(() => {
      result.current.setKycStatus({
        profile_completed: true,
        biometrics_completed: true,
        show_onboarding: true,
      })
    })

    expect(result.current.isSheetOpen).toBe(false)
  })

  it("should reset state correctly", () => {
    const { result } = renderHook(() => useKycOnboardingStore())

    act(() => {
      result.current.setSheetOpen(true)
      result.current.setKycStatus({
        profile_completed: true,
        biometrics_completed: true,
        show_onboarding: true,
      })
    })

    act(() => {
      result.current.resetState()
    })

    expect(result.current.isSheetOpen).toBe(false)
    expect(result.current.profileCompleted).toBe(false)
    expect(result.current.biometricsCompleted).toBe(false)
    expect(result.current.showOnboarding).toBe(false)
  })
})
