import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import FeatureFlagsPage from "@/app/feature-flags/page"
import { useFeatureFlagsStore } from "@/stores/feature-flags-store"
import { useUserDataStore } from "@/stores/user-data-store"
import { getRemoteConfig } from "@/services/api/api-remote-config"
import { useToast } from "@/hooks/use-toast"

jest.mock("@/stores/feature-flags-store")
jest.mock("@/stores/user-data-store")
jest.mock("@/services/api/api-remote-config")
jest.mock("@/hooks/use-toast")

describe("FeatureFlagsPage", () => {
  const mockSetFlags = jest.fn()
  const mockToggleFlag = jest.fn()
  const mockSetLoading = jest.fn()
  const mockSetError = jest.fn()
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useFeatureFlagsStore as unknown as jest.Mock).mockReturnValue({
      flags: [
        { name: "ory", enabled: true, description: "Enable Ory authentication system" },
        { name: "newFeature", enabled: false, description: "No description available" },
      ],
      isLoading: false,
      error: null,
      setFlags: mockSetFlags,
      toggleFlag: mockToggleFlag,
      setLoading: mockSetLoading,
      setError: mockSetError,
    })
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

  it("should display feature flags list", () => {
    render(<FeatureFlagsPage />)

    expect(screen.getByText("ory")).toBeInTheDocument()
    expect(screen.getByText("Enable Ory authentication system")).toBeInTheDocument()
    expect(screen.getByText("newFeature")).toBeInTheDocument()
  })

  it("should toggle feature flag", () => {
    render(<FeatureFlagsPage />)

    const switches = screen.getAllByRole("switch")
    fireEvent.click(switches[0])

    expect(mockToggleFlag).toHaveBeenCalledWith("ory")
    expect(mockToast).toHaveBeenCalledWith({
      title: "Feature Flag Updated",
      description: "ory has been toggled",
    })
  })

  it("should filter flags by search query", () => {
    render(<FeatureFlagsPage />)

    const searchInput = screen.getByPlaceholderText("Search feature flags...")
    fireEvent.change(searchInput, { target: { value: "ory" } })

    expect(screen.getByText("ory")).toBeInTheDocument()
    expect(screen.queryByText("newFeature")).not.toBeInTheDocument()
  })

  it("should refresh feature flags", async () => {
    render(<FeatureFlagsPage />)

    const refreshButton = screen.getByText("Refresh")
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockSetLoading).toHaveBeenCalledWith(true)
      expect(getRemoteConfig).toHaveBeenCalled()
    })
  })

  it("should display loading skeletons", () => {
    ;(useFeatureFlagsStore as unknown as jest.Mock).mockReturnValue({
      flags: [],
      isLoading: true,
      error: null,
      setFlags: mockSetFlags,
      toggleFlag: mockToggleFlag,
      setLoading: mockSetLoading,
      setError: mockSetError,
    })

    render(<FeatureFlagsPage />)

    const skeletons = document.querySelectorAll(".bg-grayscale-500")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("should display error message", () => {
    const errorMessage = "Failed to load feature flags"
    ;(useFeatureFlagsStore as unknown as jest.Mock).mockReturnValue({
      flags: [],
      isLoading: false,
      error: errorMessage,
      setFlags: mockSetFlags,
      toggleFlag: mockToggleFlag,
      setLoading: mockSetLoading,
      setError: mockSetError,
    })

    render(<FeatureFlagsPage />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it("should display empty state when no flags", () => {
    ;(useFeatureFlagsStore as unknown as jest.Mock).mockReturnValue({
      flags: [],
      isLoading: false,
      error: null,
      setFlags: mockSetFlags,
      toggleFlag: mockToggleFlag,
      setLoading: mockSetLoading,
      setError: mockSetError,
    })

    render(<FeatureFlagsPage />)

    expect(screen.getByText("No feature flags found")).toBeInTheDocument()
  })

  it("should show P2P access removed for disabled users", () => {
    ;(useUserDataStore as unknown as jest.Mock).mockReturnValue({
      userData: { status: "disabled" },
    })

    render(<FeatureFlagsPage />)

    // P2PAccessRemoved component should be rendered
    expect(screen.queryByText("Feature Flags")).not.toBeInTheDocument()
  })

  it("should display enabled/disabled badges correctly", () => {
    render(<FeatureFlagsPage />)

    const badges = screen.getAllByText(/Enabled|Disabled/)
    expect(badges).toHaveLength(2)
    expect(screen.getByText("Enabled")).toBeInTheDocument()
    expect(screen.getByText("Disabled")).toBeInTheDocument()
  })

  it("should handle API error during fetch", async () => {
    const errorMessage = "Network error"
    ;(getRemoteConfig as jest.Mock).mockRejectedValue(new Error(errorMessage))

    render(<FeatureFlagsPage />)

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(errorMessage)
      expect(mockToast).toHaveBeenCalledWith({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    })
  })
})
