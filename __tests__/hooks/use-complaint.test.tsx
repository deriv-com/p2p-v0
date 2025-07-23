import { renderHook, act } from "@testing-library/react"
import { useComplaint } from "@/hooks/use-complaint"
import jest from "jest" // Import jest to fix the undeclared variable error

describe("useComplaint", () => {
  it("initializes with complaint closed", () => {
    const { result } = renderHook(() => useComplaint())

    expect(result.current.isComplaintOpen).toBe(false)
  })

  it("opens complaint when openComplaint is called", () => {
    const { result } = renderHook(() => useComplaint())

    act(() => {
      result.current.openComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(true)
  })

  it("closes complaint when closeComplaint is called", () => {
    const { result } = renderHook(() => useComplaint())

    act(() => {
      result.current.openComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(true)

    act(() => {
      result.current.closeComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(false)
  })

  it("submits complaint with correct parameters", async () => {
    const orderId = "test-order-123"
    const { result } = renderHook(() => useComplaint(orderId))

    const consoleSpy = jest.spyOn(console, "log").mockImplementation()

    await act(async () => {
      await result.current.submitComplaint("no_payment")
    })

    expect(consoleSpy).toHaveBeenCalledWith("Submitting complaint:", {
      orderId,
      option: "no_payment",
    })

    consoleSpy.mockRestore()
  })

  it("handles complaint submission errors", async () => {
    const { result } = renderHook(() => useComplaint())

    // Mock console.error to avoid noise in tests
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation()

    // Mock a failed API call by overriding the setTimeout
    const originalSetTimeout = global.setTimeout
    global.setTimeout = jest.fn((callback) => {
      throw new Error("API Error")
    }) as any

    await expect(
      act(async () => {
        await result.current.submitComplaint("no_payment")
      }),
    ).rejects.toThrow("API Error")

    // Restore mocks
    global.setTimeout = originalSetTimeout
    consoleErrorSpy.mockRestore()
  })
})
