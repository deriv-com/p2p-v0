import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BuySellAPI } from '@/services/api'
import { OrdersAPI } from '@/services/api'
import * as AuthAPI from '@/services/api/api-auth'
import type { Advertisement, SearchParams as BuySellSearchParams, PaymentMethod } from '@/services/api/api-buy-sell'
import type { Order, OrderFilters } from '@/services/api/api-orders'

// Query Keys
const ALL_KEY = ['api'] as const

export const queryKeys = {
  all: ALL_KEY,
  
  // Auth queries
  auth: {
    all: [...ALL_KEY, 'auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    kycStatus: () => [...queryKeys.auth.all, 'kyc-status'] as const,
    onboardingStatus: () => [...queryKeys.auth.all, 'onboarding-status'] as const,
    totalBalance: () => [...queryKeys.auth.all, 'total-balance'] as const,
    userBalance: () => [...queryKeys.auth.all, 'user-balance'] as const,
    settings: () => [...queryKeys.auth.all, 'settings'] as const,
    clientProfile: () => [...queryKeys.auth.all, 'client-profile'] as const,
    socketToken: () => [...queryKeys.auth.all, 'socket-token'] as const,
    advertStats: (currency: string) => [...queryKeys.auth.all, 'advert-stats', currency] as const,
  },
  
  // Buy/Sell queries
  buySell: {
    all: [...ALL_KEY, 'buy-sell'] as const,
    advertisements: () => [...queryKeys.buySell.all, 'advertisements'] as const,
    advertisementsByParams: (params: BuySellSearchParams) => [...queryKeys.buySell.advertisements(), params] as const,
    paymentMethods: () => [...queryKeys.buySell.all, 'payment-methods'] as const,
    advertiser: (id: string | number) => [...queryKeys.buySell.all, 'advertiser', id] as const,
    advertiserAds: (id: string | number) => [...queryKeys.buySell.all, 'advertiser-ads', id] as const,
  },
  
  // Orders queries
  orders: {
    all: [...ALL_KEY, 'orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    listByFilters: (filters: OrderFilters | undefined) => [...queryKeys.orders.list(), filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
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

export function useKycStatus() {
  return useQuery({
    queryKey: queryKeys.auth.kycStatus(),
    queryFn: () => AuthAPI.getKycStatus(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useOnboardingStatus() {
  return useQuery({
    queryKey: queryKeys.auth.onboardingStatus(),
    queryFn: () => AuthAPI.getOnboardingStatus(),
    staleTime: 1000 * 60 * 5,
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

// Buy/Sell Hooks
export function useAdvertisements(params?: BuySellSearchParams, signal?: AbortSignal) {
  return useQuery({
    queryKey: queryKeys.buySell.advertisementsByParams(params || {}),
    queryFn: async () => {
      // Cast getAdvertisements to accept signal parameter if needed
      const response = await (BuySellAPI.getAdvertisements as any)(params, signal)
      return response
    },
    staleTime: 1000 * 30, // 30 seconds for dynamic data
  })
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
