import { render } from "@testing-library/react"
import { DatadogRumInit } from "@/components/datadog-rum-init"
import { initDatadog } from "@/lib/datadog"
import jest from "jest" // Declare the jest variable

// Mock the datadog utility
jest.mock("@/lib/datadog", () => ({
  initDatadog: jest.fn(),
}))

describe("DatadogRumInit", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render without crashing", () => {
    const { container } = render(<DatadogRumInit />)
    expect(container).toBeInTheDocument()
  })

  it("should return null (no visible output)", () => {
    const { container } = render(<DatadogRumInit />)
    expect(container.firstChild).toBeNull()
  })

  it("should call initDatadog on mount", () => {
    render(<DatadogRumInit />)
    expect(initDatadog).toHaveBeenCalledTimes(1)
  })

  it("should only call initDatadog once even with multiple renders", () => {
    const { rerender } = render(<DatadogRumInit />)
    rerender(<DatadogRumInit />)
    rerender(<DatadogRumInit />)

    // Should still only be called once due to useEffect dependency array
    expect(initDatadog).toHaveBeenCalledTimes(1)
  })
})
