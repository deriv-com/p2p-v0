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

const getAuthHeader = () => ({
  "Content-Type": "application/json",
  "X-Branch": "master",
  "X-Data-Source": "live",
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
export async function getSession(): Promise<VerificationResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_CORE_URL}/session`, {
      method: "GET",
      credentials: "include",
    })

    if (!response.ok) {
      return {
        errors: ["User not authenticated."],
      }
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error(error)
    return {
      errors: ["User not authenticated."],
    }
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
    if (userId) {
      useUserDataStore.getState().setUserId(userId.toString())

      const { userData } = useUserDataStore.getState()
      if (userData) {
        useUserDataStore.getState().updateUserData({
          adverts_are_listed: result.data.adverts_are_listed,
          signup: result.data.signup,
          wallet_id: result.data.wallet_id,
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
export async function getSocketToken(token: string): Promise<void> {
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
      localStorage.setItem("socket_token", socketToken.toString())
    }
  } catch (error) {
    console.error("Error fetching token:", error)
  }
}

export interface KycStatusResponse {
  kyc_step: "poi" | "poa"
  status: string
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

export interface TotalBalanceResponse {
  balance: number
  currency: string
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
