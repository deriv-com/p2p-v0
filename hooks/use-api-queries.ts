import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import * as BuySellAPI from '@/services/api/api-buy-sell'
import * as OrdersAPI from '@/services/api/api-orders'
import * as AuthAPI from '@/services/api/api-auth'
import * as AdsAPI from '@/services/api/api-my-ads'
import * as ProfileAPI from '@/services/api/api-profile'
import type { Advertisement, SearchParams as BuySellSearchParams, PaymentMethod } from '@/services/api/api-buy-sell'
import type { Order, OrderFilters } from '@/services/api/api-orders'
import type { MyAd } from '@/services/api/api-my-ads'

// Query Keys
const ALL_KEYS = ['api'] as const
const AUTH_KEYS = [...ALL_KEYS, 'auth'] as const
const BUY_SELL_KEYS = [...ALL_KEYS, 'buy-sell'] as const
const ORDERS_KEYS = [...ALL_KEYS, 'orders'] as const
const ADS_KEYS = [...ALL_KEYS, 'ads'] as const

export const queryKeys = {
  all: ALL_KEYS,

  // Auth queries
  auth: {
    all: AUTH_KEYS,
    session: () => [...AUTH_KEYS, 'session'] as const,
    me: () => [...AUTH_KEYS, 'me'] as const,
    kycStatus: () => [...AUTH_KEYS, 'kyc-status'] as const,
    onboardingStatus: () => [...AUTH_KEYS, 'onboarding-status'] as const,
    totalBalance: () => [...AUTH_KEYS, 'total-balance'] as const,
    userBalance: () => [...AUTH_KEYS, 'user-balance'] as const,
    settings: () => [...AUTH_KEYS, 'settings'] as const,
    clientProfile: () => [...AUTH_KEYS, 'client-profile'] as const,
    socketToken: () => [...AUTH_KEYS, 'socket-token'] as const,
    advertStats: (currency: string) => [...AUTH_KEYS, 'advert-stats', currency] as const,
    currencies: () => [...AUTH_KEYS, 'currencies'] as const,
    userPaymentMethods: () => [...AUTH_KEYS, 'user-payment-methods'] as const,
    blockedUsers: () => [...AUTH_KEYS, 'blocked-users'] as const,
  },

  // Buy/Sell queries
  buySell: {
    all: BUY_SELL_KEYS,
    advertisements: () => [...BUY_SELL_KEYS, 'advertisements'] as const,
    advertisementsByParams: (params: BuySellSearchParams) => [
      ...BUY_SELL_KEYS,
      'advertisements',
      params.type,
      params.currency,
      params.account_currency,
      params.paymentMethod ? JSON.stringify(params.paymentMethod) : undefined,
      params.sortBy,
      params.favourites_only,
    ] as const,
    paymentMethods: () => [...BUY_SELL_KEYS, 'payment-methods'] as const,
    advertiser: (id: string | number) => [...BUY_SELL_KEYS, 'advertiser', id] as const,
    advertiserAds: (id: string | number) => [...BUY_SELL_KEYS, 'advertiser-ads', id] as const,
    favouriteUsers: () => [...BUY_SELL_KEYS, 'favourite-users'] as const,
  },

  // Orders queries
  orders: {
    all: ORDERS_KEYS,
    list: () => [...ORDERS_KEYS, 'list'] as const,
    listByFilters: (filters: OrderFilters | undefined) => [...ORDERS_KEYS, 'list', filters] as const,
    detail: (id: string) => [...ORDERS_KEYS, 'detail', id] as const,
  },

  // Ads queries
  ads: {
    all: ADS_KEYS,
    userAdverts: (showInactive?: boolean) => [...ADS_KEYS, 'user-adverts', showInactive] as const,
  },
}

// Auth Hooks
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: () => AuthAPI.getSession(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => AuthAPI.getMe(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useKycStatus() {
  return useQuery({
    queryKey: queryKeys.auth.kycStatus(),
    queryFn: () => AuthAPI.getKycStatus(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.onboardingStatus(),
    queryFn: () => AuthAPI.getOnboardingStatus(),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}

export function useTotalBalance() {
  return useQuery({
    queryKey: queryKeys.auth.totalBalance(),
    queryFn: () => AuthAPI.getTotalBalance(),
    staleTime: 1000 * 60 * 2, // 2 minutes for balance
  })
}

export function useUserBalance() {
  return useQuery({
    queryKey: queryKeys.auth.userBalance(),
    queryFn: () => AuthAPI.getUserBalance(),
    staleTime: 1000 * 60 * 2,
  })
}

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.auth.settings(),
    queryFn: () => AuthAPI.getSettings(),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes (formerly cacheTime)
    retry: 0,
  })
}

export function useClientProfile() {
  return useQuery({
    queryKey: queryKeys.auth.clientProfile(),
    queryFn: () => AuthAPI.getClientProfile(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useSocketToken() {
  return useQuery({
    queryKey: queryKeys.auth.socketToken(),
    queryFn: () => AuthAPI.getSocketToken(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useAdvertStats(currency: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.advertStats(currency),
    queryFn: () => AuthAPI.getAdvertStatistics(currency),
    staleTime: 1000 * 60 * 5,
    enabled,
  })
}

export function useCurrencies() {
  return useQuery({
    queryKey: queryKeys.auth.currencies(),
    queryFn: () => AuthAPI.getCurrencies(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export function useUserPaymentMethods(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.userPaymentMethods(),
    queryFn: () => ProfileAPI.getUserPaymentMethods(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  })
}

export function useBlockedUsers(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.blockedUsers(),
    queryFn: () => ProfileAPI.getBlockedUsers(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  })
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ method, fields }: { method: string; fields: Record<string, string> }) => {
      const result = await ProfileAPI.addPaymentMethod(method, fields)
      if (!result.success) {
        const error: any = new Error(result.errors?.[0]?.message || 'Failed to add payment method')
        error.errors = result.errors
        throw error
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.userPaymentMethods() })
    },
  })
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, method, fields }: { id: string; method: string; fields: Record<string, string> }) => {
      const result = await ProfileAPI.updatePaymentMethod(id, { method, fields })
      if (!result.success) {
        const error: any = new Error(result.errors?.[0]?.message || 'Failed to update payment method')
        error.errors = result.errors
        throw error
      }
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.userPaymentMethods() })
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await ProfileAPI.deletePaymentMethod(id)
      if (!result.success && result.errors && result.errors.length > 0) {
        const error: any = new Error(result.errors[0].message || 'Failed to delete payment method')
        error.errors = result.errors
        throw error
      }
      return result
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.userPaymentMethods() })
    },
  })
}

// Ads Hooks
export function useUserAdverts(showInactive?: boolean, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ads.userAdverts(showInactive),
    queryFn: () => AdsAPI.getUserAdverts(showInactive),
    staleTime: 1000 * 30, // 30 seconds
    enabled,
  })
}

export function useCreateAd() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: any) => {
      const result = await AdsAPI.createAd(payload)
      if (!result.success && result.errors && result.errors.length > 0) {
        const error: any = new Error(result.errors[0].message || 'Failed to create ad')
        error.errors = result.errors
        throw error
      }
      return result
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.userAdverts(true) })
    },
  })
}

export function useUpdateAd() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, adData }: { id: string; adData: any }) => {
      const result = await AdsAPI.updateAd(id, adData)
      if (!result.success && result.errors && result.errors.length > 0) {
        const error: any = new Error(result.errors[0].message || 'Failed to update ad')
        error.errors = result.errors
        throw error
      }
      return result
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.userAdverts(true) })
    },
  })
}

export function useDeleteAd() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await AdsAPI.deleteAd(id)
      if (!response.success) {
        const error: any = new Error(response.errors?.[0]?.message || 'Failed to delete ad')
        error.errors = response.errors
        throw error
      }
      return response
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.userAdverts(true) })
    },
  })
}

export function useToggleAdActiveStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const result = await AdsAPI.toggleAdActiveStatus(id, isActive)
      if (!result.success && result.errors && result.errors.length > 0) {
        const error: any = new Error(result.errors[0].message || 'Failed to update ad status')
        error.errors = result.errors
        throw error
      }
      return result
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.userAdverts(true) })
    },
  })
}

export function useHideMyAds() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (hide: boolean) => AdsAPI.hideMyAds(hide),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ads.userAdverts(true) })
    },
  })
}

// Buy/Sell Hooks
export function useAdvertisements(params?: BuySellSearchParams, signal?: AbortSignal) {
  // Create stable query key using only the necessary parameters
  const queryKey = useMemo(() => {
    if (!params) return undefined
    
    return queryKeys.buySell.advertisementsByParams({
      type: params.type,
      currency: params.currency,
      account_currency: params.account_currency,
      paymentMethod: params.paymentMethod,
      sortBy: params.sortBy,
      favourites_only: params.favourites_only,
    })
  }, [params?.type, params?.currency, params?.account_currency, JSON.stringify(params?.paymentMethod), params?.sortBy, params?.favourites_only])

  const query = useQuery({
    queryKey: queryKey || ['no-params'],
    queryFn: async () => {
      const response = await (BuySellAPI.getAdvertisements as any)(params, signal)
      return response
    },
    staleTime: 1000 * 10, // 10 seconds
    enabled: Boolean(params && queryKey && params.currency && params.account_currency), // Only run query when params and required fields are provided
  })

  return {
    ...query,
    error: query.error as Error | null,
  }
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: queryKeys.buySell.paymentMethods(),
    queryFn: () => BuySellAPI.getPaymentMethods(),
    staleTime: 1000 * 60 * 30,
  })
}

export function useAdvertiser(id: string | number) {
  return useQuery({
    queryKey: queryKeys.buySell.advertiser(id),
    queryFn: () => BuySellAPI.getAdvertiserById(id),
    staleTime: 1000 * 60 * 5,
  })
}

export function useAdvertiserAds(id: string | number) {
  return useQuery({
    queryKey: queryKeys.buySell.advertiserAds(id),
    queryFn: () => BuySellAPI.getAdvertiserAds(id),
    staleTime: 1000 * 60 * 5,
  })
}

export function useFavouriteUsers() {
  return useQuery({
    queryKey: queryKeys.buySell.favouriteUsers(),
    queryFn: () => ProfileAPI.getFavouriteUsers(),
    staleTime: 1000 * 60 * 5,
  })
}

// Orders Hooks
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.orders.listByFilters(filters),
    queryFn: () => OrdersAPI.getOrders(filters),
    staleTime: 1000 * 30,
  })
}

export function useOrderById(id: string) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => OrdersAPI.getOrderById(id),
    staleTime: 1000 * 30,
  })
}

// Mutations
export function useMarkPaymentAsSent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => OrdersAPI.markPaymentAsSent(orderId),
    onSuccess: (data, orderId) => {
      // Invalidate order detail
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useReleasePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => OrdersAPI.releasePayment(orderId),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => OrdersAPI.cancelOrder(orderId),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useDisputeOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      OrdersAPI.disputeOrder(orderId, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advertId, exchangeRate, amount, paymentMethodIds }: Parameters<typeof OrdersAPI.createOrder>[0]) =>
      OrdersAPI.createOrder(advertId as any, exchangeRate as any, amount as any, paymentMethodIds as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function usePayOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId: string) => OrdersAPI.payOrder(orderId),
    onSuccess: (data, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useReviewOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, reviewData }: { orderId: string; reviewData: any }) =>
      OrdersAPI.reviewOrder(orderId, reviewData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useCompleteOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, otpValue }: { orderId: string; otpValue: string | null }) =>
      OrdersAPI.completeOrder(orderId, otpValue),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.list() })
    },
  })
}

export function useSendChatMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, message, attachment, isPOT }: { orderId: string; message: string; attachment?: string | null; isPOT?: boolean }) =>
      OrdersAPI.sendChatMessage(orderId, message, attachment, isPOT),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(variables.orderId) })
    },
  })
}

export function useRequestOrderCompletionOtp() {
  return useMutation({
    mutationFn: (orderId: string) => OrdersAPI.requestOrderCompletionOtp(orderId),
  })
}

export function useToggleFavouriteAdvertiser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advertiserId, isFavourite }: { advertiserId: number; isFavourite: boolean }) =>
      BuySellAPI.toggleFavouriteAdvertiser(advertiserId, isFavourite),
    onSuccess: () => {
      // Invalidate advertisements to refresh favorite status
      queryClient.invalidateQueries({ queryKey: queryKeys.buySell.advertisements() })
    },
  })
}

export function useToggleBlockAdvertiser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ advertiserId, isBlocked }: { advertiserId: number; isBlocked: boolean }) =>
      BuySellAPI.toggleBlockAdvertiser(advertiserId, isBlocked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buySell.advertisements() })
    },
  })
}
