import { renderHook, act } from "@testing-library/react"
import { useFeatureFlagsStore } from "@/stores/feature-flags-store"
import type { FeatureFlag } from "@/stores/feature-flags-store"

const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("useFeatureFlagsStore", () => {
  beforeEach(() => {
    localStorageMock.clear()
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

  it("should load flags from localStorage on initialization", () => {
    const mockFlags: FeatureFlag[] = [
      { name: "ory", enabled: true, description: "Ory authentication" },
      { name: "newFeature", enabled: false, description: "New feature" },
    ]

    localStorageMock.setItem("feature_flags", JSON.stringify(mockFlags))

    const { result } = renderHook(() => useFeatureFlagsStore())

    expect(result.current.flags).toEqual(mockFlags)
  })

  it("should persist flags to localStorage when set", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())
    const mockFlags: FeatureFlag[] = [
      { name: "ory", enabled: true, description: "Ory authentication" },
      { name: "newFeature", enabled: false, description: "New feature" },
    ]

    act(() => {
      result.current.setFlags(mockFlags)
    })

    expect(result.current.flags).toEqual(mockFlags)
    expect(localStorageMock.getItem("feature_flags")).toBe(JSON.stringify(mockFlags))
  })

  it("should toggle flag and persist to localStorage", () => {
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
    const storedFlags = JSON.parse(localStorageMock.getItem("feature_flags") || "[]")
    expect(storedFlags[0].enabled).toBe(false)

    act(() => {
      result.current.toggleFlag("newFeature")
    })

    expect(result.current.flags[1].enabled).toBe(true)
    const updatedStoredFlags = JSON.parse(localStorageMock.getItem("feature_flags") || "[]")
    expect(updatedStoredFlags[1].enabled).toBe(true)
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

  it("should reset to initial state and clear localStorage", () => {
    const { result } = renderHook(() => useFeatureFlagsStore())

    act(() => {
      result.current.setFlags([{ name: "test", enabled: true }])
      result.current.setLoading(true)
      result.current.setError("Some error")
    })

    expect(localStorageMock.getItem("feature_flags")).toBeTruthy()

    act(() => {
      result.current.reset()
    })

    expect(result.current.flags).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(localStorageMock.getItem("feature_flags")).toBeNull()
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

  it("should handle localStorage errors gracefully", () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()
    const originalSetItem = localStorageMock.setItem

    localStorageMock.setItem = () => {
      throw new Error("Storage quota exceeded")
    }

    const { result } = renderHook(() => useFeatureFlagsStore())

    act(() => {
      result.current.setFlags([{ name: "test", enabled: true }])
    })

    expect(consoleErrorSpy).toHaveBeenCalled()

    localStorageMock.setItem = originalSetItem
    consoleErrorSpy.mockRestore()
  })
})
