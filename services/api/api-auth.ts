import { useUserDataStore } from "@/stores/user-data-store"

export interface LoginRequest {
  email: string
}

export interface LoginResponse {
  code: string
  message: string
}

export interface VerificationRequest {
  token: string
  type: string
  email: string
}

export interface VerificationResponse {
  access_token?: string
  errors?: string[]
  user?: {
    id: string
    email?: string
  }
}

export interface Country {
  code: string
  name: string
  currency?: string
}

export interface CountriesResponse {
  countries: Country[]
}

export interface CurrencyItem {
  code: string
  name: string
}

export interface CurrenciesResponse {
  [currencyCode: string]: Record<string, any>
}

export interface KycStatusResponse {
  kyc_step: "poi" | "poa"
  status: string
}

export interface TotalBalanceResponse {
  balance: number
  currency: string
}

export interface OnboardingStatusResponse {
  kyc: {
    status: string
  }
  verification: {
    email_verified: boolean
    phone_verified: boolean
  }
  p2p: {
    allowed: boolean
    criteria: Array<{
      code: string
      passed: boolean
    }>
  }
}

export interface CreateP2PUserResponse {
  id: string
  user_id: string
  created_at: string
}

const getAuthHeader = () => ({
  "Content-Type": "application/json",
})

/**
 * Initiate login with email
 */
export async function login(email: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/login`, {
      method: "POST",
      body: JSON.stringify(email),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    const { data } = result

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw new Error("Failed to login. Please try again.")
  }
}

/**
 * Verify the code sent to email
 */
export async function verifyCode(verificationData: VerificationRequest): Promise<VerificationResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/verify`, {
      method: "POST",
      headers: {
        "X-Enable-Session": "true",
      },
      credentials: "include",
      body: JSON.stringify(verificationData),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    const { data } = result

    return data
  } catch (error) {
    console.error("Verification error:", error)
    throw new Error("Failed to verify code. Please try again.")
  }
}

/**
 * Check if user is authenticated
 */
export async function getSession(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/session`, {
      method: "GET",
      credentials: "include",
    })

    return response.status === 200
  } catch (error) {
    console.error(error)
    return false
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    useUserDataStore.getState().clearUserData()

    localStorage.removeItem("auth_token")
    localStorage.removeItem("socket_token")
    window.location.href = "/"
  } catch (error) {
    console.error(error)
    throw new Error("User not authenticated.")
  }
}

/**
 * Fetch user data and store user_id in localStorage
 */
export async function fetchUserIdAndStore(): Promise<void> {
  try {
    await getClientProfile()
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/me`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`)
    }

    const userId = result?.data?.id
    const brandClientId = result?.data?.brand_client_id
    const brand = result?.data?.brand
    const tempBanUntil = result?.data?.temp_ban_until

    if (userId) {
      useUserDataStore.getState().setUserId(userId.toString())

      if (brandClientId) {
        useUserDataStore.getState().setBrandClientId(brandClientId)
      }
      if (brand) {
        useUserDataStore.getState().setBrand(brand)
      }

      const { userData } = useUserDataStore.getState()
      if (userData) {
        useUserDataStore.getState().updateUserData({
          adverts_are_listed: result.data.adverts_are_listed,
          signup: result.data.signup,
          wallet_id: result.data.wallet_id,
          temp_ban_until: tempBanUntil,
        })
      }
    }
  } catch (error) {
    console.error("Error fetching user ID:", error)
  }
}

export async function getClientProfile(): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/client/profile`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.statusText}`)
    }

    const result = await response.json()
    const { data } = result

    const userData = {
      adverts_are_listed: true,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      nickname: data.nickname,
    }

    useUserDataStore.getState().setUserData(userData)

    if (data.residence) {
      useUserDataStore.getState().setResidenceCountry(data.residence)
    }
  } catch (error) {
    console.error("Error fetching profile:", error)
  }
}

/**
 * Get websocket token
 */
export async function getSocketToken(token?: string): Promise<void> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/user-websocket-token`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.statusText}`)
    }

    const result = await response.json()
    const socketToken = result?.data.token

    if (socketToken) {
      useUserDataStore.getState().setSocketToken(socketToken.toString())
    }
  } catch (error) {
    console.error("Error fetching token:", error)
  }
}

/**
 * Get KYC status for user onboarding
 */
export async function getKycStatus(): Promise<KycStatusResponse[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/client/kyc-status`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch KYC status: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching KYC status:", error)
  }
}

/**
 * Get onboarding status for the user
 */
export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/client/onboarding-status`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch onboarding status: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching onboarding status:", error)
    throw error
  }
}

/**
 * Get total balance for the user
 */
export async function getTotalBalance(): Promise<TotalBalanceResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/client/total-balance`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch total balance: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching total balance:", error)
    throw error
  }
}

/**
 * Get list of available countries
 */
export async function getCountries(): Promise<CountriesResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/countries`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching countries:", error)
    throw error
  }
}

/**
 * Get list of available currencies
 */
export async function getCurrencies(): Promise<CurrenciesResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/core/business/config/currencies`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch currencies: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching currencies:", error)
    throw error
  }
}

/**
 * Get user settings
 */
export async function getSettings(): Promise<any> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/settings`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error fetching settings:", error)
    throw error
  }
}

/**
 * Create a P2P user after verification is complete
 */
export async function createP2PUser(): Promise<CreateP2PUserResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/p2p/client`, {
      method: "POST",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to create P2P user: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error("Error creating P2P user:", error)
    throw error
  }
}
