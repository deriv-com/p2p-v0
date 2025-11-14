import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import FeatureFlagsPage from "@/app/feature-flags/page"
import { useUserDataStore } from "@/stores/user-data-store"
import { getRemoteConfig } from "@/services/api/api-remote-config"
import { useToast } from "@/hooks/use-toast"

jest.mock("@/stores/user-data-store")
jest.mock("@/services/api/api-remote-config")
jest.mock("@/hooks/use-toast")

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

describe("FeatureFlagsPage", () => {
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    ;(useUserDataStore as unknown as jest.Mock).mockReturnValue({
      userData: { status: "active" },
    })
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })
    ;(getRemoteConfig as jest.Mock).mockResolvedValue({
      ory: true,
      newFeature: false,
    })
  })

  it("should render feature flags page", () => {
    render(<FeatureFlagsPage />)

    expect(screen.getByText("Feature Flags")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Search feature flags...")).toBeInTheDocument()
  })

  it("should display feature flags list", async () => {
    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText("ory")).toBeInTheDocument()
      expect(screen.getByText("Enable Ory authentication system")).toBeInTheDocument()
      expect(screen.getByText("newFeature")).toBeInTheDocument()
    })
  })

  it("should toggle feature flag and persist to localStorage", async () => {
    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText("ory")).toBeInTheDocument()
    })

    const switches = screen.getAllByRole("switch")
    fireEvent.click(switches[0])

    expect(mockToast).toHaveBeenCalledWith({
      title: "Feature Flag Updated",
      description: "ory has been toggled",
    })

    const stored = JSON.parse(localStorageMock.getItem("feature-flags") || "{}")
    expect(stored.ory).toBe(false)
  })

  it("should filter flags by search query", async () => {
    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText("ory")).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Search feature flags...")
    fireEvent.change(searchInput, { target: { value: "ory" } })

    expect(screen.getByText("ory")).toBeInTheDocument()
    expect(screen.queryByText("newFeature")).not.toBeInTheDocument()
  })

  it("should refresh feature flags", async () => {
    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText("ory")).toBeInTheDocument()
    })

    const refreshButton = screen.getByText("Refresh")
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(getRemoteConfig).toHaveBeenCalledTimes(2)
      expect(mockToast).toHaveBeenCalledWith({
        title: "Refreshed",
        description: "Feature flags have been reloaded",
      })
    })
  })

  it("should display loading skeletons", () => {
    render(<FeatureFlagsPage />)

    const skeletons = document.querySelectorAll(".bg-grayscale-500")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("should display error message", async () => {
    const errorMessage = "Failed to load feature flags"
    ;(getRemoteConfig as jest.Mock).mockRejectedValue(new Error(errorMessage))

    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    })
  })

  it("should display empty state when no flags", async () => {
    ;(getRemoteConfig as jest.Mock).mockResolvedValue({})

    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText("No feature flags found")).toBeInTheDocument()
    })
  })

  it("should show P2P access removed for disabled users", () => {
    ;(useUserDataStore as unknown as jest.Mock).mockReturnValue({
      userData: { status: "disabled" },
    })

    render(<FeatureFlagsPage />)

    expect(screen.queryByText("Feature Flags")).not.toBeInTheDocument()
  })

  it("should display enabled/disabled badges correctly", async () => {
    render(<FeatureFlagsPage />)

    await waitFor(() => {
      const badges = screen.getAllByText(/Enabled|Disabled/)
      expect(badges).toHaveLength(2)
      expect(screen.getByText("Enabled")).toBeInTheDocument()
      expect(screen.getByText("Disabled")).toBeInTheDocument()
    })
  })

  it("should load flags from localStorage on mount", async () => {
    // Pre-populate localStorage
    localStorageMock.setItem("feature-flags", JSON.stringify({ ory: false, newFeature: true }))

    render(<FeatureFlagsPage />)

    await waitFor(() => {
      const badges = screen.getAllByText(/Enabled|Disabled/)
      expect(badges).toHaveLength(2)
    })

    // Verify localStorage overrides are applied
    const switches = screen.getAllByRole("switch")
    expect(switches[0]).not.toBeChecked() // ory should be false (overridden)
    expect(switches[1]).toBeChecked() // newFeature should be true (overridden)
  })

  it("should handle localStorage errors gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage quota exceeded")
    })

    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(screen.getByText("ory")).toBeInTheDocument()
    })

    const switches = screen.getAllByRole("switch")
    fireEvent.click(switches[0])

    expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to save flags to localStorage:", expect.any(Error))

    consoleErrorSpy.mockRestore()
  })
})
