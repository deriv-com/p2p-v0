import jest from "jest"
import { renderHook, act } from "@testing-library/react"
import { useP2PBalanceWarning } from "@/hooks/use-p2p-balance-warning"

const STABILITY_WINDOW_MS = 500

describe("useP2PBalanceWarning", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("hides banner when user is not fully onboarded", () => {
    const { result } = renderHook(() => useP2PBalanceWarning("0.00", false))
    expect(result.current.shouldShow).toBe(false)
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(false)
  })

  it("shows banner when balance is '0.00' and user is fully onboarded (after debounce)", () => {
    const { result } = renderHook(() => useP2PBalanceWarning("0.00", true))
    // Default state is hidden; the first debounced observation commits show.
    expect(result.current.shouldShow).toBe(false)
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(true)
  })

  it("hides banner and latches when balance becomes positive", () => {
    const { result, rerender } = renderHook(
      ({ balance, onboarded }: { balance: string | undefined; onboarded: boolean }) =>
        useP2PBalanceWarning(balance, onboarded),
      { initialProps: { balance: "0.00" as string | undefined, onboarded: true } },
    )
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(true)

    rerender({ balance: "100.00", onboarded: true })
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(false)
  })

  it("debounces rapid balance changes within the stability window", () => {
    const { result, rerender } = renderHook(
      ({ balance }: { balance: string | undefined }) =>
        useP2PBalanceWarning(balance, true),
      { initialProps: { balance: "0.00" as string | undefined } },
    )
    // 0 -> 100 -> 0 within the window. Only the final value should settle.
    act(() => {
      jest.advanceTimersByTime(200)
    })
    rerender({ balance: "100.00" })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    rerender({ balance: "0.00" })
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    // Final settled value is 0 → banner shows. Never briefly hid.
    expect(result.current.shouldShow).toBe(true)
  })

  it("one-way latch: stays hidden after confirmed positive balance", () => {
    const { result, rerender } = renderHook(
      ({ balance }: { balance: string | undefined }) =>
        useP2PBalanceWarning(balance, true),
      { initialProps: { balance: "100.00" as string | undefined } },
    )
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(false)

    // Balance drops back to 0 — latch must prevent re-showing.
    rerender({ balance: "0.00" })
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS * 2)
    })
    expect(result.current.shouldShow).toBe(false)
  })

  it("ignores transient undefined values during loading", () => {
    const { result, rerender } = renderHook(
      ({ balance }: { balance: string | undefined }) =>
        useP2PBalanceWarning(balance, true),
      { initialProps: { balance: "0.00" as string | undefined } },
    )
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(true)

    // Loading flip — undefined should preserve the shown state.
    rerender({ balance: undefined })
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS * 2)
    })
    expect(result.current.shouldShow).toBe(true)
  })

  it("treats negative balance as non-positive (shows banner)", () => {
    const { result } = renderHook(() =>
      useP2PBalanceWarning("-10.00", true),
    )
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(true)
  })

  it("shows banner for unparseable strings ('NaN', '', 'abc')", () => {
    const cases = ["NaN", "", "abc"]
    for (const balance of cases) {
      const { result, unmount } = renderHook(() =>
        useP2PBalanceWarning(balance, true),
      )
      act(() => {
        jest.advanceTimersByTime(STABILITY_WINDOW_MS)
      })
      expect(result.current.shouldShow).toBe(true)
      unmount()
    }
  })

  it("transient not-onboarded does not hide once banner is shown", () => {
    const { result, rerender } = renderHook(
      ({ onboarded }: { onboarded: boolean }) =>
        useP2PBalanceWarning("0.00", onboarded),
      { initialProps: { onboarded: true } },
    )
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(true)

    // A transient `!isFullyOnboarded` within the debounce window must not
    // flash the banner off and back on — the debounced decision is
    // cancelled when the prop flips back before the timer fires.
    rerender({ onboarded: false })
    act(() => {
      jest.advanceTimersByTime(200)
    })
    rerender({ onboarded: true })
    act(() => {
      jest.advanceTimersByTime(STABILITY_WINDOW_MS)
    })
    expect(result.current.shouldShow).toBe(true)
  })
})
