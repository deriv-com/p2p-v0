import { API, AUTH, USER } from "@/lib/local-variables"

export interface UserProfile {
  id: number
  nickname: string
  rating: string
  completionRate: string
  joinDate: string
  blockedCount: number
  realName: string
  balance: number
  isVerified: {
    id: boolean
    address: boolean
    phone: boolean
  }
  businessHours: {
    isOpen: boolean
    availability: string
  }
  tradeLimits: {
    buy: {
      current: number
      max: number
    }
    sell: {
      current: number
      max: number
    }
  }
  stats: {
    buyCompletion: { rate: string; period: string }
    sellCompletion: { rate: string; period: string }
    avgPayTime: { time: string; period: string }
    avgReleaseTime: { time: string; period: string }
    tradePartners: number
    totalOrders30d: number
    totalOrdersLifetime: number
    tradeVolume30d: { amount: string; currency: string; period: string }
    tradeVolumeLifetime: { amount: string; currency: string }
  }
}

export interface BusinessHours {
  isOpen: boolean
  availability: string
}

export interface PaymentMethod {
  id: string
  name: string
  instructions: string
  isDefault: boolean
}

// API Functions
/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const response = await fetch(`${API.baseUrl}${API.endpoints.profile}`, {
      credentials: "include",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching profile: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    throw error
  }
}

/**
 * Update business hours
 */
export async function updateBusinessHours(data: BusinessHours): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API.baseUrl}${API.endpoints.profile}/business-hours`, {
      method: "PUT",
credentials: "include",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Error updating business hours: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to update business hours:", error)
    throw error
  }
}

/**
 * Get user balance
 */
export async function getUserBalance(): Promise<{ balance: number; currency: string }> {
  try {
    const response = await fetch(`${API.baseUrl}${API.endpoints.profile}/balance`, {
credentials: "include",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error fetching balance: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch balance:", error)
    throw error
  }
}

/**
 * Toggle real name visibility
 */
export async function toggleRealNameVisibility(show: boolean): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${API.baseUrl}${API.endpoints.profile}/settings/show-real-name`, {
      method: "PUT",
credentials: "include",
      headers: {
        ...AUTH.getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ show }),
    })

    if (!response.ok) {
      throw new Error(`Error updating real name visibility: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to update real name visibility:", error)
    throw error
  }
}

export interface UserStats {
  buyCompletion: { rate: string; period: string }
  sellCompletion: { rate: string; period: string }
  avgPayTime: { time: string; period: string }
  avgReleaseTime: { time: string; period: string }
  tradePartners: number
  totalOrders30d: number
  totalOrdersLifetime: number
  tradeVolume30d: { amount: string; currency: string; period: string }
  tradeVolumeLifetime: { amount: string; currency: string }
}

export type UserStatsResponse = UserStats | { error: any }

export const fetchUserStats = async (): Promise<UserStatsResponse> => {
  try {
    const userId = USER.id
    const url = `${API.baseUrl}/users/${userId}`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      headers,
      credentials: "include",
      cache: "no-store",
    })

    const responseData = await response.json()

    
    if (responseData.errors && responseData.errors.length > 0) {
      return { error: responseData.errors }
    }

    
    if (!response.ok) {
      return { error: [`Failed to fetch user stats: ${response.status} ${response.statusText}`] }
    }

    if (responseData && responseData.data) {
      const data = responseData.data

      const formatTimeAverage = (seconds: number) => {
        if (!seconds || seconds <= 0) return "-"
        const mins = seconds / 60
        if (mins < 1) return "< 1 min"
        return `${Math.floor(mins)} min${Math.floor(mins) > 1 ? "s" : ""}`
      }

      const transformedStats: UserStats = {
        buyCompletion: {
          rate: `${Number(data.completion_average_30day) || 0}% (${Number(data.buy_count_30day) || 0})`,
          period: "(30d)",
        },
        sellCompletion: {
          rate: `${Number(data.completion_average_30day) || 0}% (${Number(data.sell_count_30day) || 0})`,
          period: "(30d)",
        },
        avgPayTime: {
          time: formatTimeAverage(Number(data.buy_time_average_30day)),
          period: "(30d)",
        },
        avgReleaseTime: {
          time: formatTimeAverage(Number(data.release_time_average_30day)),
          period: "(30d)",
        },
        tradePartners: Number(data.partner_count_lifetime) || 0,
        totalOrders30d: (Number(data.buy_count_30day) || 0) + (Number(data.sell_count_30day) || 0),
        totalOrdersLifetime: Number(data.order_count_lifetime) || 0,
        tradeVolume30d: {
          amount: ((Number(data.buy_amount_30day) || 0) + (Number(data.sell_amount_30day) || 0)).toFixed(2),
          currency: "USD",
          period: "(30d)",
        },
        tradeVolumeLifetime: {
          amount: data.order_amount_lifetime ? Number(data.order_amount_lifetime).toFixed(2) : "0.00",
          currency: "USD",
        },
      }

      return transformedStats
    }

    return { error: ["No user data found"] }
  } catch (err) {
    return { error: [`Unexpected error: ${(err as Error).message}`] }
  }
}

export interface PaymentMethod {
  id: string
  name: string
  type: string
  details: Record<string, string>
  instructions?: string
  isDefault?: boolean
}

export interface PaymentMethodResponse {
  success: boolean
  data?: PaymentMethod
  errors?: Array<{ code: string; message: string }>
}

export async function getUserPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const headers = AUTH.getAuthHeader()
    const response = await fetch(`${API.baseUrl}/user-payment-methods`, {
      headers,
credentials: "include",
    })

    if (!response.ok) {
      throw new Error(`Error fetching payment methods: ${response.statusText}`)
    }

    const result = await response.json()
    return result.data || []
  } catch (error) {
    throw error
  }
}

export async function addPaymentMethod(method: string, fields: Record<string, any>): Promise<PaymentMethodResponse> {
  try {
    const formattedMethod = method.toLowerCase()

    const cleanFields: Record<string, any> = {}

    Object.keys(fields).forEach((key) => {
      if (fields[key] && typeof fields[key] === "string") {
        cleanFields[key] = fields[key]
      }
    })

    const requestBody = {
      data: {
        method: formattedMethod,
        fields: cleanFields,
      },
    }

    const headers = AUTH.getAuthHeader()
    const response = await fetch(`${API.baseUrl}/user-payment-methods`, {
      method: "POST",
      headers,
  credentials: "include",
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()

    let responseData: any
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: response.ok }
    } catch (e) {
      console.log("Failed to parse response:", e);
      return {
        success: false,
        errors: [{ code: "parse_error", message: "Failed to parse server response" }],
      }
    }

    if (!response.ok) {
      const errors = responseData.errors || []

      const formattedErrors = errors.map((err: any) => ({
        code: err.code || "unknown_error",
        message: getErrorMessageFromCode(err.code),
      }))

      return {
        success: false,
        errors:
          formattedErrors.length > 0
            ? formattedErrors
            : [{ code: "api_error", message: `API Error: ${response.status} ${response.statusText}` }],
      }
    }

    return { success: true, data: responseData.data }
  } catch (error) {
    console.log("Error adding payment method:", error);
    return {
      success: false,
      errors: [
        {
          code: "exception",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      ],
    }
  }
}

export async function updatePaymentMethod(id: string, fields: Record<string, any>): Promise<PaymentMethodResponse> {
  try {
    const requestBody = {
      data: fields,  
    };

    const headers = AUTH.getAuthHeader();
    const response = await fetch(`${API.baseUrl}/user-payment-methods/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    let responseData: any;
    try {
      responseData = responseText ? JSON.parse(responseText) : { success: response.ok };
    } catch (e) {
      console.log("Failed to parse response:", e);
      return {
        success: false,
        errors: [{ code: "parse_error", message: "Failed to parse server response" }],
      };
    }

    if (!response.ok) {
      const errors = responseData.errors || [];

      const formattedErrors = errors.map((err: any) => ({
        code: err.code || "unknown_error",
        message: err.message || getErrorMessageFromCode(err.code),
      }));

      return {
        success: false,
        errors:
          formattedErrors.length > 0
            ? formattedErrors
            : [{ code: "api_error", message: `API Error: ${response.status} ${response.statusText}` }],
      };
    }

    return { success: true, data: responseData.data };
  } catch (error) {
    console.log("Error updating payment method:", error);
    return {
      success: false,
      errors: [
        {
          code: "exception",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      ],
    };
  }
}


function getErrorMessageFromCode(code: string): string {
  const errorMessages: Record<string, string> = {
    DuplicatePaymentMethod: "You already have this payment method added to your account.",
    PaymentMethodUsedByOpenOrder:
      "This payment method is currently being used by an open order and cannot be modified.",
    InvalidPaymentMethod: "The payment method information is invalid.",
    PaymentMethodNotFound: "The payment method could not be found.",
  }

  return errorMessages[code] || `Error: ${code}`
}

export async function deletePaymentMethod(id: string): Promise<PaymentMethodResponse> {
  try {
    const headers = AUTH.getAuthHeader()
    const response = await fetch(`${API.baseUrl}/user-payment-methods/${id}`, {
      method: "DELETE",
      headers,
 credentials: "include",
    })

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        return { success: false, errors: errorData.errors }
      } catch (error) {
        console.log("Error at delete payment method:", error);
        return { success: false, errors: [{ code: "api_error", message: response.statusText }] }
      }
    }

    return { success: true }
  } catch (error) {
    console.log("Error deleting payment method:", error);
    return {
      success: false,
      errors: [{ code: "exception", message: error instanceof Error ? error.message : "An unexpected error occurred" }],
    }
  }
}
