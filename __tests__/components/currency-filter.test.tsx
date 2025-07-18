import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CurrencyFilter } from "@/components/currency-filter/currency-filter"
import type { Currency } from "@/components/currency-filter/types"
import jest from "jest" // Import jest to declare the variable

// Mock the mobile hook
jest.mock("@/components/ui/use-mobile", () => ({
  useIsMobile: () => false,
}))

const mockCurrencies: Currency[] = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "IDR", name: "Indonesian rupiah" },
]

const mockProps = {
  currencies: mockCurrencies,
  selectedCurrency: "USD",
  onCurrencySelect: jest.fn(),
  trigger: <button>Select Currency</button>,
}

describe("CurrencyFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders trigger element", () => {
    render(<CurrencyFilter {...mockProps} />)
    expect(screen.getByText("Select Currency")).toBeInTheDocument()
  })

  it("opens popover when trigger is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search currencies...")).toBeInTheDocument()
    })
  })

  it("displays all currencies when no search query", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      mockCurrencies.forEach((currency) => {
        expect(screen.getByText(`${currency.code} - ${currency.name}`)).toBeInTheDocument()
      })
    })
  })

  it("filters currencies based on search query continuously", async () => {
    const user = userEvent.setup()
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    const searchInput = await screen.findByPlaceholderText("Search currencies...")

    // Test continuous search
    await user.type(searchInput, "USD")

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("EUR - Euro")).not.toBeInTheDocument()
    })

    // Clear and search for another currency
    await user.clear(searchInput)
    await user.type(searchInput, "Euro")

    await waitFor(() => {
      expect(screen.getByText("EUR - Euro")).toBeInTheDocument()
      expect(screen.queryByText("USD - US Dollar")).not.toBeInTheDocument()
    })
  })

  it("highlights search matches", async () => {
    const user = userEvent.setup()
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    const searchInput = await screen.findByPlaceholderText("Search currencies...")
    await user.type(searchInput, "USD")

    await waitFor(() => {
      const highlightedText = screen.getByText("USD")
      expect(highlightedText.tagName).toBe("MARK")
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

  it("supports keyboard navigation", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    const searchInput = await screen.findByPlaceholderText("Search currencies...")

    // Test arrow down navigation
    fireEvent.keyDown(searchInput, { key: "ArrowDown" })
    fireEvent.keyDown(searchInput, { key: "Enter" })

    expect(mockProps.onCurrencySelect).toHaveBeenCalledWith("USD")
  })

  it("shows empty message when no currencies match search", async () => {
    const user = userEvent.setup()
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    const searchInput = await screen.findByPlaceholderText("Search currencies...")
    await user.type(searchInput, "XYZ")

    await waitFor(() => {
      expect(screen.getByText('No currencies found for "XYZ"')).toBeInTheDocument()
    })
  })

  it("clears search when popover closes", async () => {
    const user = userEvent.setup()
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    const searchInput = await screen.findByPlaceholderText("Search currencies...")
    await user.type(searchInput, "USD")

    // Close popover with Escape
    fireEvent.keyDown(searchInput, { key: "Escape" })

    // Reopen and check search is cleared
    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const newSearchInput = screen.getByPlaceholderText("Search currencies...")
      expect(newSearchInput).toHaveValue("")
    })
  })

  it("prioritizes exact matches in search results", async () => {
    const user = userEvent.setup()
    const currenciesWithSimilarNames = [
      { code: "USD", name: "US Dollar" },
      { code: "USDT", name: "US Dollar Tether" },
      { code: "USDC", name: "US Dollar Coin" },
    ]

    render(<CurrencyFilter {...mockProps} currencies={currenciesWithSimilarNames} />)

    fireEvent.click(screen.getByText("Select Currency"))

    const searchInput = await screen.findByPlaceholderText("Search currencies...")
    await user.type(searchInput, "USD")

    await waitFor(() => {
      const results = screen.getAllByText(/USD/)
      // USD should be first due to exact match priority
      expect(results[0]).toHaveTextContent("USD - US Dollar")
    })
  })
})
