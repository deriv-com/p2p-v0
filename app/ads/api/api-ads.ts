import { USER, API, AUTH } from "@/lib/local-variables"
import type { APIAdvert, MyAd, CreateAdPayload, CreateAdResponse } from "@/services/api/api-my-ads"

export async function getCurrencies(): Promise<string[]> {
  try {
    const url = `${API.baseUrl}${API.endpoints.settings}`;
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      headers,
      //credentials: "include",
    });
    await response.text();
  } catch (error) {
    console.log("Error fetching currencies:", error);
  }

  // TODO: Returning a default array for now until the API response structure is finalised and we have required data
  return ["USD", "BTC", "ETH", "LTC", "BRL", "VND"];
}

export async function getUserAdverts(): Promise<MyAd[]> {
  try {
    const userId = USER.id

    const queryParams = new URLSearchParams({
      user_id: userId.toString(),
      show_inactive: "true",
      show_unorderable: "true",
      show_unlisted: "true",
    })

    const url = `${API.baseUrl}${API.endpoints.ads}?${queryParams.toString()}`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      headers,
      // credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user adverts")
    }

    const responseText = await response.text()
    let apiData

    try {
      apiData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      apiData = { data: [] }
    }

    if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
      return []
    }

    return apiData.data.map((advert: APIAdvert) => {
      const minAmount = advert.minimum_order_amount || 0
      const maxAmount = advert.maximum_order_amount || 0
      const exchangeRate = advert.exchange_rate || 0
      const currency = advert.payment_currency || "USD"
      const isActive = advert.is_active !== undefined ? advert.is_active : true
      const availableAmount = advert.available_amount || 0

      const status: "Active" | "Inactive" = isActive ? "Active" : "Inactive"

      return {
        id: String(advert.id || "0"),
        type: ((advert.type || "buy") as string).toLowerCase() === "buy" ? "Buy" : "Sell",
        rate: {
          value: `${currency} ${exchangeRate.toFixed(4)}`,
          percentage: "0.1%",
          currency: currency,
        },
        limits: {
          min: minAmount,
          max: maxAmount,
          currency: "USD",
        },
        available: {
          current: availableAmount,
          total:
            Number(availableAmount || 0) +
            Number(advert.open_order_amount || 0) +
            Number(advert.completed_order_amount || 0),
          currency: "USD",
        },
        paymentMethods: advert.payment_methods || [],
        status: status,
        description: advert.description || "",
        createdAt: new Date((advert.created_at || 0) * 1000 || Date.now()).toISOString(),
        updatedAt: new Date((advert.created_at || 0) * 1000 || Date.now()).toISOString(),
      }
    })
  } catch (error) {
    console.log(error);
    return []
  }
}



export async function updateAd(id: string, adData: any): Promise<{ success: boolean; errors?: any[] }> {
  try {
    const url = `${API.baseUrl}${API.endpoints.ads}/${id}`
    const headers = AUTH.getAuthHeader()

    if (adData.payment_method_names) {
      if (!Array.isArray(adData.payment_method_names)) {
        adData.payment_method_names = [String(adData.payment_method_names)]
      } else {
        adData.payment_method_names = adData.payment_method_names.map((method) => String(method))
      }
    } else {
      adData.payment_method_names = []
    }

    const requestData = { data: adData }
    const body = JSON.stringify(requestData)

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      //credentials: "include",
      body,
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      responseData = {}
    }

    if (!response.ok) {
      let errors = []
      if (responseData && responseData.errors) {
        errors = responseData.errors
      } else {
        errors = [{ message: `Failed to update ad: ${response.statusText || responseText}` }]
      }

      return {
        success: false,
        errors: errors,
      }
    }

    return {
      success: true,
      errors: responseData.errors || [],
    }
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : "An unexpected error occurred" }],
    }
  }
}

export async function toggleAdActiveStatus(
  id: string,
  isActive: boolean,
): Promise<{ success: boolean; errors?: any[] }> {
  try {
    const url = `${API.baseUrl}${API.endpoints.ads}/${id}`
    const headers = AUTH.getAuthHeader()

    const payload = {
      is_active: isActive,
    }

    const requestData = { data: payload }
    const body = JSON.stringify(requestData)

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      // credentials: "include",
      body,
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      responseData = {}
    }

    if (!response.ok) {
      let errors = []
      if (responseData && responseData.errors) {
        errors = responseData.errors
      } else {
        errors = [
          { message: `Failed to ${isActive ? "activate" : "deactivate"} ad: ${response.statusText || responseText}` },
        ]
      }

      return {
        success: false,
        errors: errors,
      }
    }

    return {
      success: true,
      errors: responseData.errors || [],
    }
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : "An unexpected error occurred" }],
    }
  }
}



export async function deleteAd(id: string): Promise<{ success: boolean; errors?: any[] }> {
  try {
    const url = `${API.baseUrl}${API.endpoints.ads}/${id}`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      method: "DELETE",
      headers,
      // credentials: "include",
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      responseData = {}
    }

    if (!response.ok) {
      let errors = []
      if (responseData && responseData.errors) {
        errors = responseData.errors
      } else {
        errors = [{ message: `Failed to delete ad: ${response.statusText}` }]
      }

      return {
        success: false,
        errors: errors,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : "An unexpected error occurred" }],
    }
  }
}

export async function createAd(
  payload: CreateAdPayload,
): Promise<{ success: boolean; data: CreateAdResponse; errors?: any[] }> {
  try {
    const url = `${API.baseUrl}${API.endpoints.ads}`
    const headers = AUTH.getAuthHeader()

    const requestBody = { data: payload }
    const body = JSON.stringify(requestBody)

    const response = await fetch(url, {
      method: "POST",
      headers,
      // credentials: "include",
      body,
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      responseData = { raw: responseText }
    }

    if (!response.ok) {
      let errorMessage = responseData.error || `Error creating advertisement: ${response.statusText}`
      let errorCode = null

      if (responseData.errors && Array.isArray(responseData.errors) && responseData.errors.length > 0) {
        if (responseData.errors[0].code) {
          errorCode = responseData.errors[0].code

          switch (errorCode) {
            case "AdvertExchangeRateDuplicate":
              errorMessage = "You already have an ad with this exchange rate. Please use a different rate."
              break
            case "AdvertLimitReached":
              errorMessage = "You've reached the maximum number of ads allowed."
              break
            case "InvalidExchangeRate":
              errorMessage = "The exchange rate you provided is invalid."
              break
            case "InvalidOrderAmount":
              errorMessage = "The order amount limits are invalid."
              break
            case "InsufficientBalance":
              errorMessage = "You don't have enough balance to create this ad."
              break
            case "AdvertTotalAmountExceeded":
              errorMessage = "The total amount exceeds your available balance. Please enter a smaller amount."
              break
            default:
              errorMessage = `Error: ${errorCode}. Please try again or contact support.`
          }
        } else if (responseData.errors[0].message) {
          errorMessage = responseData.errors[0].message
        }
      }

      if (response.status === 400) {
        if (errorMessage.includes("limit") || errorCode === "AdvertLimitReached") {
          throw new Error("ad_limit_reached")
        }
      }

      const error = new Error(errorMessage)
      if (errorCode) {
        error.name = errorCode
      }
      throw error
    }

    return {
      success: true,
      data: {
        id: responseData.data?.id || "000000",
        type: responseData.data?.type || payload.type,
        status: responseData.data?.status || "active",
        created_at: responseData.data?.created_at || new Date().toISOString(),
      },
      errors: responseData.errors || [],
    }
  } catch (error) {
    return {
      success: false,
      data: {
        id: "",
        type: payload.type,
        status: "inactive",
        created_at: new Date().toISOString(),
      },
      errors: [
        {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
          code: error instanceof Error ? error.name : "UnknownError",
        },
      ],
    }
  }
}

export async function activateAd(id: string): Promise<{ success: boolean; errors?: any[] }> {
  try {
    const payload = {
      is_active: true,
    }

    const url = `${API.baseUrl}${API.endpoints.ads}/${id}`
    const headers = AUTH.getAuthHeader()

    const body = JSON.stringify({ data: payload })

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      //  credentials: "include",
      body,
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      responseData = {}
    }

    if (!response.ok) {
      let errors = []
      if (responseData && responseData.errors) {
        errors = responseData.errors
      } else {
        errors = [{ message: `Failed to activate ad: ${response.statusText || responseText}` }]
      }

      return {
        success: false,
        errors: errors,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      errors: [{ message: error instanceof Error ? error.message : "An unexpected error occurred" }],
    }
  }
}

export async function getAdvert(id: string): Promise<MyAd> {
  try {
    const url = `${API.baseUrl}${API.endpoints.ads}/${id}`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      headers,
    })

    if (!response.ok) {
      throw new Error("Failed to fetch user adverts")
    }

    const responseText = await response.text()
    let apiData

    try {
      apiData = JSON.parse(responseText)
    } catch (e) {
      console.log(e);
      apiData = { data: {} }
    }

    if (!apiData || !apiData.data) {
      return {}
    }

    return apiData.data
  } catch (error) {
    console.log(error);
    return {}
  }
}

export const AdsAPI = {
  getCurrencies,
  getUserAdverts,
  toggleAdActiveStatus,
  deleteAd,
  createAd,
  updateAd,
  activateAd,
  getAdvert,
}
