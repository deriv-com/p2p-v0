# React Query Quick Reference

## Installation
```bash
npm install @tanstack/react-query@^5.28.0
```

The provider is already set up in `/app/layout.tsx`.

## Most Common Hooks

### Reading Data
```tsx
import { 
  useAdvertisements,
  usePaymentMethods,
  useOrders,
  useOrderById,
  useTotalBalance,
  useSettings
} from '@/hooks/use-api-queries'

// Get advertisements
const { data: ads, isLoading, error } = useAdvertisements({
  type: 'buy',
  currency: 'USD',
  account_currency: 'USD'
})

// Get orders
const { data: orders } = useOrders()

// Get specific order
const { data: order } = useOrderById(orderId)

// Get balance (cached for 2 minutes)
const { data: balance } = useTotalBalance()

// Get settings (cached for 30 minutes)
const { data: settings } = useSettings()
```

### Modifying Data
```tsx
import {
  useCreateOrder,
  useCompleteOrder,
  useMarkPaymentAsSent,
  useReleasePayment,
  useCancelOrder,
  useToggleFavouriteAdvertiser
} from '@/hooks/use-api-queries'

// Create order
const { mutate: createOrder, isPending } = useCreateOrder()
createOrder({
  advertId: 123,
  exchangeRate: 1.5,
  amount: 100,
  paymentMethodIds: []
})

// Complete order
const { mutate: complete } = useCompleteOrder()
complete(
  { orderId: '123', otpValue: '123456' },
  {
    onSuccess: () => alert('Done!'),
    onError: (err) => alert(err.message)
  }
)

// Release payment
const { mutate: release } = useReleasePayment()
release(orderId)

// Mark as sent
const { mutate: markSent } = useMarkPaymentAsSent()
markSent(orderId)

// Toggle favorite
const { mutate: toggleFav } = useToggleFavouriteAdvertiser()
toggleFav({ advertiserId: 123, isFavourite: true })
```

## Query States

```tsx
const { 
  data,           // The actual data
  isLoading,      // true while first fetch in progress
  isFetching,     // true while any fetch in progress (background refresh)
  error,          // Error object if failed
  isError,        // true if error
  status,         // 'pending' | 'error' | 'success'
  refetch         // Function to manually refetch
} = useAdvertisements(params)
```

## Mutation States

```tsx
const {
  mutate,         // Function to call the mutation
  mutateAsync,    // Async version (returns promise)
  isPending,      // true while request in progress
  isError,        // true if error
  error,          // Error object if failed
  status,         // 'idle' | 'pending' | 'error' | 'success'
  data,           // Response data
  reset           // Reset mutation state
} = useCreateOrder()
```

## Cache Times (Defaults)

| Query | Duration | Why |
|-------|----------|-----|
| Advertisements | 30 sec | Rates change frequently |
| Orders | 30 sec | Frequently updated |
| Balance | 2 min | Important but not critical |
| Settings | 30 min | Rarely changes |
| Payment Methods | 30 min | Rarely changes |
| Advertiser Info | 5 min | User info relatively stable |

## Common Patterns

### Conditional Queries (don't run until ready)
```tsx
const { data } = useAdvertiser(advertiserId, {
  enabled: !!advertiserId // Only fetch when ID exists
})
```

### Manual Refetch
```tsx
const { data, refetch } = useAdvertisements(params)

const handleRefresh = () => {
  refetch()
}
```

### Invalidate Cache Manually
```tsx
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/hooks/use-api-queries'

const queryClient = useQueryClient()

// Invalidate specific query
queryClient.invalidateQueries({
  queryKey: queryKeys.buySell.advertisements()
})

// Invalidate all queries of a type
queryClient.invalidateQueries({
  queryKey: queryKeys.orders.all
})
```

### Prefetch (load in background)
```tsx
import { useQueryClient } from '@tanstack/react-query'

const queryClient = useQueryClient()

// Prefetch future query
queryClient.prefetchQuery({
  queryKey: queryKeys.buySell.advertiser(123),
  queryFn: () => getAdvertiserById(123)
})
```

## Debugging

### Enable Logging
```tsx
import { useIsMutating } from '@tanstack/react-query'

// See if any mutations are running
const mutatingCount = useIsMutating()
console.log(`${mutatingCount} mutations in progress`)
```

### DevTools (Install if needed)
```bash
npm install @tanstack/react-query-devtools
```

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function App() {
  return (
    <>
      <YourApp />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}
```

### Check Network Tab
1. Open DevTools → Network tab
2. Make request to app
3. Verify: Only 1 API call for each unique query
4. Navigate away and back
5. Verify: No new API calls (data from cache)

## Troubleshooting

### Query Not Fetching
- Check `enabled` option (default: true)
- Verify query parameters are correct
- Check Network tab for actual request
- Use `refetch()` to manually trigger

### Duplicate Requests
- Different query keys = different caches
- Check `queryKeys` are consistent
- Verify parameters aren't recreated each render (use `useMemo`)

### Cache Stale Too Fast
- Adjust `staleTime` in query options
- Use `refetchInterval` to refresh periodically
- Manually call `refetch()` when needed

### Mutation Not Updating UI
- Ensure related queries are invalidated (mutations do this)
- Call `refetch()` on dependent queries if needed
- Check `onSuccess` callback is working

## All Available Hooks

### Auth Queries
`useSession` • `useKycStatus` • `useOnboardingStatus` • `useTotalBalance` • `useUserBalance` • `useSettings` • `useClientProfile` • `useSocketToken` • `useAdvertStats`

### Buy/Sell Queries  
`useAdvertisements` • `usePaymentMethods` • `useAdvertiser` • `useAdvertiserAds`

### Order Queries
`useOrders` • `useOrderById`

### Order Mutations
`useMarkPaymentAsSent` • `useReleasePayment` • `useCancelOrder` • `useDisputeOrder` • `useCreateOrder` • `usePayOrder` • `useReviewOrder` • `useCompleteOrder` • `useSendChatMessage` • `useRequestOrderCompletionOtp`

### User Mutations
`useToggleFavouriteAdvertiser` • `useToggleBlockAdvertiser`

## Learn More

- Full guide: `/REACT_QUERY_MIGRATION.md`
- Examples: `/REACT_QUERY_EXAMPLES.md`  
- Component checklist: `/COMPONENT_MIGRATION.md`
- Official docs: https://tanstack.com/query/latest
