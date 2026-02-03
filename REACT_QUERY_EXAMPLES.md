# React Query Implementation Examples

## Example 1: Using React Query in Home Page

### Before (Without React Query)
```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAdvertisements, getPaymentMethods } from '@/services/api/api-buy-sell'

export default function BuySellPage() {
  const [adverts, setAdverts] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // ❌ This effect runs on every mount, potentially causing duplicate API calls
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [ads, methods] = await Promise.all([
          getAdvertisements({ type: 'buy', account_currency: 'USD' }),
          getPaymentMethods()
        ])
        setAdverts(ads)
        setPaymentMethods(methods)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, []) // Missing dependencies = unpredictable behavior
}
```

### After (With React Query)
```tsx
'use client'

import { useAdvertisements, usePaymentMethods } from '@/hooks/use-api-queries'

export default function BuySellPage() {
  // ✅ Automatic deduplication and caching
  const { data: adverts = [], isLoading, error } = useAdvertisements({
    type: 'buy',
    account_currency: 'USD'
  })
  
  const { data: paymentMethods = [] } = usePaymentMethods()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {/* Use adverts and paymentMethods - no manual loading/error state */}
    </div>
  )
}
```

## Example 2: Handling Mutations

### Before (Without React Query)
```tsx
const handleCompleteOrder = async (orderId: string, otpValue: string) => {
  setIsSubmitting(true)
  setError(null)
  
  try {
    const result = await completeOrder(orderId, otpValue)
    
    // ❌ Manual refetch required - easy to forget
    const updatedOrder = await getOrderById(orderId)
    setOrder(updatedOrder)
    
    setSuccess(true)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsSubmitting(false)
  }
}
```

### After (With React Query)
```tsx
import { useCompleteOrder } from '@/hooks/use-api-queries'

const handleCompleteOrder = (orderId: string, otpValue: string) => {
  // ✅ Mutation automatically invalidates related queries
  const { mutate: completeOrder, isPending } = useCompleteOrder()
  
  completeOrder(
    { orderId, otpValue },
    {
      onSuccess: () => {
        // Order queries automatically refetched
        toast.success('Order completed!')
      },
      onError: (error) => {
        toast.error(error.message)
      }
    }
  )
}
```

## Example 3: Conditional Queries with Dependencies

### Before
```tsx
const [advertiserId, setAdvertiserId] = useState(null)
const [advertiser, setAdvertiser] = useState(null)

useEffect(() => {
  if (!advertiserId) return
  
  getAdvertiserById(advertiserId)
    .then(setAdvertiser)
    .catch(console.error)
}, [advertiserId])
```

### After
```tsx
import { useAdvertiser } from '@/hooks/use-api-queries'

const [advertiserId, setAdvertiserId] = useState(null)

// ✅ Query only runs when advertiserId is set
const { data: advertiser } = useAdvertiser(advertiserId)
```

## Example 4: Handling Multiple Related Queries

### Before
```tsx
const [balance, setBalance] = useState(null)
const [settings, setSettings] = useState(null)
const [balanceLoading, setBalanceLoading] = useState(true)
const [settingsLoading, setSettingsLoading] = useState(true)

useEffect(() => {
  getTotalBalance()
    .then(setBalance)
    .finally(() => setBalanceLoading(false))
    
  getSettings()
    .then(setSettings)
    .finally(() => setSettingsLoading(false))
}, [])
```

### After
```tsx
import { useTotalBalance, useSettings } from '@/hooks/use-api-queries'

const { data: balance, isLoading: balanceLoading } = useTotalBalance()
const { data: settings, isLoading: settingsLoading } = useSettings()

// ✅ All cached independently, proper dependency management
```

## Example 5: Manual Cache Invalidation

```tsx
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/hooks/use-api-queries'

export function RefreshButton() {
  const queryClient = useQueryClient()

  const handleFullRefresh = () => {
    // Invalidate all advertisement queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.buySell.advertisements() 
    })
    
    // Invalidate all order queries
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.orders.all 
    })
  }

  return <button onClick={handleFullRefresh}>Refresh All Data</button>
}
```

## Performance Comparison

### Without React Query
- 5 components mount → 5 API calls for same data
- Network tab shows duplicate requests
- API rate limits hit faster
- User experiences slower load times

### With React Query
- 5 components mount → 1 API call
- Network tab shows single request
- Data shared across all components
- 60-80% reduction in API calls
- Faster perceived performance
