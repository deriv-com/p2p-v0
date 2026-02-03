# Component Migration Checklist

Use this checklist when migrating existing components to use React Query.

## ✅ Quick Migration Checklist

### Step 1: Identify API Calls
- [ ] Find all `useEffect` hooks that call API functions
- [ ] List all API functions being called
- [ ] Check for corresponding hooks in `/hooks/use-api-queries.ts`

### Step 2: Replace useEffect + useState
Replace this pattern:
```tsx
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  someAPI.get()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])
```

With this:
```tsx
const { data, isLoading, error } = useSomeQuery()
```

### Step 3: Update Render Logic
- [ ] Replace `loading` with `isLoading`
- [ ] Replace `error` with error from hook
- [ ] Replace `data` with data from hook
- [ ] Remove error boundary for this component (optional)

### Step 4: Handle Mutations
- [ ] Find all POST/PUT/DELETE operations
- [ ] Replace with corresponding mutation hooks
- [ ] Remove manual `invalidateQueries`/`refetch` calls

### Step 5: Test
- [ ] Check Network tab shows single request
- [ ] Verify cache behavior (data appears instantly)
- [ ] Test error states
- [ ] Test loading states
- [ ] Verify no duplicate requests across components

## Before/After Patterns

### Pattern 1: Simple Query
**BEFORE:**
```tsx
'use client'
import { useState, useEffect } from 'react'
import { getPaymentMethods } from '@/services/api/api-buy-sell'

export function PaymentMethodsList() {
  const [methods, setMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true)
        const data = await getPaymentMethods()
        setMethods(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetch()
  }, [])

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error} />
  
  return (
    <div>
      {methods.map(m => <PaymentMethod key={m.method} {...m} />)}
    </div>
  )
}
```

**AFTER:**
```tsx
'use client'
import { usePaymentMethods } from '@/hooks/use-api-queries'

export function PaymentMethodsList() {
  const { data: methods = [], isLoading, error } = usePaymentMethods()

  if (isLoading) return <Skeleton />
  if (error) return <Error message={error.message} />
  
  return (
    <div>
      {methods.map(m => <PaymentMethod key={m.method} {...m} />)}
    </div>
  )
}
```

### Pattern 2: Query with Parameters
**BEFORE:**
```tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { getAdvertisements } from '@/services/api/api-buy-sell'

export function AdsTable({ currency, type }) {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getAdvertisements({ currency, type, account_currency: 'USD' })
      .then(setAds)
      .finally(() => setLoading(false))
  }, [currency, type]) // Easy to forget dependencies!
}
```

**AFTER:**
```tsx
'use client'
import { useAdvertisements } from '@/hooks/use-api-queries'

export function AdsTable({ currency, type }) {
  // Dependencies handled automatically!
  const { data: ads = [], isLoading } = useAdvertisements({
    currency,
    type,
    account_currency: 'USD'
  })
}
```

### Pattern 3: Mutation with Refetch
**BEFORE:**
```tsx
'use client'
import { completeOrder, getOrderById } from '@/services/api'

export function CompleteOrderButton({ orderId, otpValue }) {
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)

  const handleComplete = async () => {
    setLoading(true)
    try {
      await completeOrder(orderId, otpValue)
      // ❌ Manual refetch required - easy to forget!
      const updated = await getOrderById(orderId)
      setOrder(updated)
    } finally {
      setLoading(false)
    }
  }

  return <button onClick={handleComplete}>{loading ? 'Loading...' : 'Complete'}</button>
}
```

**AFTER:**
```tsx
'use client'
import { useCompleteOrder } from '@/hooks/use-api-queries'

export function CompleteOrderButton({ orderId, otpValue }) {
  // ✅ Automatically refetches order queries after mutation!
  const { mutate: completeOrder, isPending } = useCompleteOrder()

  const handleComplete = () => {
    completeOrder(
      { orderId, otpValue },
      {
        onSuccess: () => toast.success('Order completed!'),
        onError: (err) => toast.error(err.message)
      }
    )
  }

  return <button onClick={handleComplete}>{isPending ? 'Loading...' : 'Complete'}</button>
}
```

### Pattern 4: Multiple Queries
**BEFORE:**
```tsx
'use client'
import { getTotalBalance, getSettings } from '@/services/api/api-auth'

export function Dashboard() {
  const [balance, setBalance] = useState(null)
  const [settings, setSettings] = useState(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [settingsLoading, setSettingsLoading] = useState(true)

  useEffect(() => {
    getTotalBalance().then(setBalance).finally(() => setBalanceLoading(false))
    getSettings().then(setSettings).finally(() => setSettingsLoading(false))
  }, [])

  // Messy state management for multiple queries
}
```

**AFTER:**
```tsx
'use client'
import { useTotalBalance, useSettings } from '@/hooks/use-api-queries'

export function Dashboard() {
  const { data: balance, isLoading: balanceLoading } = useTotalBalance()
  const { data: settings, isLoading: settingsLoading } = useSettings()

  // Clean separation of concerns!
}
```

### Pattern 5: Conditional Query
**BEFORE:**
```tsx
'use client'
export function AdvertiserDetail({ id }) {
  const [advertiser, setAdvertiser] = useState(null)

  useEffect(() => {
    if (!id) return // Manual guard
    getAdvertiserById(id).then(setAdvertiser)
  }, [id])
}
```

**AFTER:**
```tsx
'use client'
import { useAdvertiser } from '@/hooks/use-api-queries'

export function AdvertiserDetail({ id }) {
  // Query automatically skips when id is falsy
  const { data: advertiser } = useAdvertiser(id, {
    enabled: !!id // Explicit control if needed
  })
}
```

## Common Mistakes to Avoid

❌ **DON'T** mix React Query with direct API calls
```tsx
// WRONG
const { data } = useAdvertisements()
const manual = await getAdvertisements() // Don't do this!
```

❌ **DON'T** manually refetch after mutations
```tsx
// WRONG
const { mutate } = useCreateOrder()
mutate(data, {
  onSuccess: () => {
    // Don't do manual refetch - mutations handle this!
    refetch()
  }
})
```

❌ **DON'T** add unnecessary dependencies
```tsx
// WRONG - parameters should be stable/memoized
const { data } = useAdvertisements(params) // params object recreated each render
```

✅ **DO** use stable references for complex objects
```tsx
// RIGHT
const params = useMemo(() => ({
  type: activeTab,
  currency: selectedCurrency,
}), [activeTab, selectedCurrency])

const { data } = useAdvertisements(params)
```

✅ **DO** handle loading and error states
```tsx
// RIGHT
if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
return <Content data={data} />
```

## Validation Checklist

Before considering migration complete:

- [ ] No `useEffect` hooks calling API functions
- [ ] No manual loading/error/data state for queries
- [ ] Network tab shows no duplicate requests
- [ ] Component doesn't call API functions directly
- [ ] All mutations use mutation hooks
- [ ] Error boundaries work correctly
- [ ] TypeScript compilation passes
- [ ] Test: Multiple components render same data → single API call
- [ ] Test: Navigating away and back → cached data appears instantly
- [ ] Test: Mutation success → related queries auto-refetch

## Need Help?

Refer to:
- `/REACT_QUERY_MIGRATION.md` - Full migration guide
- `/REACT_QUERY_EXAMPLES.md` - Code examples
- `/hooks/use-api-queries.ts` - Available hooks and types
- `queryKeys` export - Proper query key usage
