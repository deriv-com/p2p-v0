import { useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(
  callback: () => void,
  options?: {
    enabled?: boolean
    threshold?: number
    rootMargin?: string
  }
) {
  const observerTarget = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingRef.current && options?.enabled !== false) {
          isLoadingRef.current = true
          Promise.resolve(callback()).finally(() => {
            isLoadingRef.current = false
          })
        }
      })
    },
    [callback, options?.enabled]
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: options?.threshold ?? 0.1,
      rootMargin: options?.rootMargin ?? '50px',
    })

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
      observer.disconnect()
    }
  }, [handleIntersection])

  return observerTarget
}
