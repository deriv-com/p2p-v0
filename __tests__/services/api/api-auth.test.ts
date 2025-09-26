import { getKycStatus } from "@/services/api/api-auth"
import { API, AUTH } from "@/lib/local-variables"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock fetch
global.fetch = jest.fn()

describe("getKycStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should fetch KYC status successfully", async () => {
    const mockResponse = {
      data: {
        profile_completed: true,
        biometrics_completed: false,
        show_onboarding: true,
      },
    }

    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await getKycStatus()

    expect(fetch).toHaveBeenCalledWith(`${API.coreUrl}/client/kyc-status`, {
      method: "GET",
      credentials: "include",
      headers: AUTH.getAuthHeader(),
    })

    expect(result).toEqual(mockResponse.data)
  })

  it("should handle API errors gracefully", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    } as Response)

    const result = await getKycStatus()

    expect(result).toEqual({
      profile_completed: false,
      biometrics_completed: false,
      show_onboarding: false,
    })
  })

  it("should handle network errors", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValue(new Error("Network error"))

    const result = await getKycStatus()

    expect(result).toEqual({
      profile_completed: false,
      biometrics_completed: false,
      show_onboarding: false,
    })
  })

  it("should return default values when data is missing", async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    const result = await getKycStatus()

    expect(result).toEqual({
      profile_completed: false,
      biometrics_completed: false,
      show_onboarding: true,
    })
  })
})
