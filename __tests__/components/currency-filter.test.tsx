import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CurrencyFilter } from "@/components/currency-filter"
import type { Currency } from "@/components/currency-filter/types"
import { jest } from "@jest/globals"

const mockCurrencies: Currency[] = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "IDR", name: "Indonesian rupiah" },
]

const mockProps = {
  currencies: mockCurrencies,
  selectedCurrency: "USD",
  onCurrencySelect: jest.fn(),
  trigger: <button>Select Currency</button>,
}

// Mock the mobile hook
jest.mock("@/components/ui/use-mobile", () => ({
  useIsMobile: () => false,
}))

describe("CurrencyFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders trigger button", () => {
    render(<CurrencyFilter {...mockProps} />)
    expect(screen.getByText("Select Currency")).toBeInTheDocument()
  })

  it("opens popover when trigger is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument()
    })
  })

  it("displays all currencies initially", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.getByText("EUR - Euro")).toBeInTheDocument()
      expect(screen.getByText("GBP - British Pound")).toBeInTheDocument()
      expect(screen.getByText("IDR - Indonesian rupiah")).toBeInTheDocument()
    })
  })

  it("filters currencies based on search query", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "USD" } })
    })

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("EUR - Euro")).not.toBeInTheDocument()
    })
  })

  it("filters currencies by name", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "Dollar" } })
    })

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("EUR - Euro")).not.toBeInTheDocument()
    })
  })

  it("shows empty message when no currencies match search", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "XYZ" } })
    })

    await waitFor(() => {
      expect(screen.getByText("Currency is unavailable")).toBeInTheDocument()
    })
  })

  it("calls onCurrencySelect when currency is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("EUR - Euro"))
    })

    expect(mockProps.onCurrencySelect).toHaveBeenCalledWith("EUR")
  })

  it("highlights selected currency", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const selectedCurrency = screen.getByText("USD - US Dollar")
      expect(selectedCurrency).toHaveClass("bg-black", "text-white")
    })
  })

  it("clears search when closed", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "USD" } })
    })

    // Close the popover
    fireEvent.keyDown(screen.getByPlaceholderText("Search"), { key: "Escape" })

    // Reopen and check search is cleared
    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      expect(searchInput).toHaveValue("")
    })
  })

  it("supports continuous search", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")

      // Type continuously
      fireEvent.change(searchInput, { target: { value: "U" } })
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()

      fireEvent.change(searchInput, { target: { value: "US" } })
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()

      fireEvent.change(searchInput, { target: { value: "USD" } })
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("EUR - Euro")).not.toBeInTheDocument()
    })
  })
})
