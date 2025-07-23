import { renderHook, act } from "@testing-library/react"
import { useComplaint } from "@/hooks/use-complaint"

describe("useComplaint", () => {
  const orderId = "test-order-123"

  it("initializes with complaint closed", () => {
    const { result } = renderHook(() => useComplaint(orderId))

    expect(result.current.isComplaintOpen).toBe(false)
  })

  it("opens complaint when openComplaint is called", () => {
    const { result } = renderHook(() => useComplaint(orderId))

    act(() => {
      result.current.openComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(true)
  })

  it("closes complaint when closeComplaint is called", () => {
    const { result } = renderHook(() => useComplaint(orderId))

    act(() => {
      result.current.openComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(true)

    act(() => {
      result.current.closeComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(false)
  })

  it("closes complaint when submitComplaint is called", () => {
    const { result } = renderHook(() => useComplaint(orderId))

    act(() => {
      result.current.openComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(true)

    act(() => {
      result.current.submitComplaint()
    })

    expect(result.current.isComplaintOpen).toBe(false)
  })

  it("provides all required functions", () => {
    const { result } = renderHook(() => useComplaint(orderId))

    expect(typeof result.current.openComplaint).toBe("function")
    expect(typeof result.current.closeComplaint).toBe("function")
    expect(typeof result.current.submitComplaint).toBe("function")
    expect(typeof result.current.isComplaintOpen).toBe("boolean")
  })
})
