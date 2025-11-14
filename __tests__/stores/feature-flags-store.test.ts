import { renderHook, act } from "@testing-library/react"
import { useFeatureFlagsStore } from "@/stores/feature-flags-store"
import type { FeatureFlag } from "@/stores/feature-flags-store"

describe("useFeatureFlagsStore", () => {
  beforeEach(() => {
    const { result } = renderHook(() => useFeatureFlagsStore())
    act(() => {
      result.current.reset()
    })
  })

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())

    expect(result.current.flags).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should set flags", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())
    const mockFlags: FeatureFlag[] = [
      { name: "ory", enabled: true, description: "Ory authentication" },
      { name: "newFeature", enabled: false, description: "New feature" },
    ]

    act(() => {
      result.current.setFlags(mockFlags)
    })

    expect(result.current.flags).toEqual(mockFlags)
  })

  it("should toggle flag", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())
    const mockFlags: FeatureFlag[] = [
      { name: "ory", enabled: true, description: "Ory authentication" },
      { name: "newFeature", enabled: false, description: "New feature" },
    ]

    act(() => {
      result.current.setFlags(mockFlags)
    })

    act(() => {
      result.current.toggleFlag("ory")
    })

    expect(result.current.flags[0].enabled).toBe(false)

    act(() => {
      result.current.toggleFlag("newFeature")
    })

    expect(result.current.flags[1].enabled).toBe(true)
  })

  it("should set loading state", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())

    act(() => {
      result.current.setLoading(true)
    })

    expect(result.current.isLoading).toBe(true)

    act(() => {
      result.current.setLoading(false)
    })

    expect(result.current.isLoading).toBe(false)
  })

  it("should set error", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())
    const errorMessage = "Failed to fetch flags"

    act(() => {
      result.current.setError(errorMessage)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it("should reset to initial state", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())

    act(() => {
      result.current.setFlags([{ name: "test", enabled: true }])
      result.current.setLoading(true)
      result.current.setError("Some error")
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.flags).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should not toggle non-existent flag", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())
    const mockFlags: FeatureFlag[] = [{ name: "ory", enabled: true, description: "Ory authentication" }]

    act(() => {
      result.current.setFlags(mockFlags)
    })

    act(() => {
      result.current.toggleFlag("nonExistent")
    })

    expect(result.current.flags).toEqual(mockFlags)
  })
})
