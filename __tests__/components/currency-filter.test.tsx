import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CurrencyFilter } from "@/components/currency-filter/currency-filter"
import jest from "jest"

const mockCurrencies = [
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "ARS", name: "Argentine peso" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "BOB", name: "Boliviano" },
  { code: "BRL", name: "Brazilian real" },
  { code: "COP", name: "Colombian peso" },
  { code: "CRC", name: "Costa Rican colon" },
]

const defaultProps = {
  currencies: mockCurrencies,
  selectedCurrency: "IDR",
  onCurrencySelect: jest.fn(),
  trigger: <button>Select Currency</button>,
}

describe("CurrencyFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders trigger element", () => {
    render(<CurrencyFilter {...defaultProps} />)
    expect(screen.getByText("Select Currency")).toBeInTheDocument()
  })

  it("opens dropdown when trigger is clicked on desktop", async () => {
    // Mock desktop viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    })

    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument()
    })
  })

  it("displays all currencies in the list", async () => {
    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      mockCurrencies.forEach((currency) => {
        expect(screen.getByText(`${currency.code} - ${currency.name}`)).toBeInTheDocument()
      })
    })
  })

  it("filters currencies based on search input", async () => {
    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "Indonesian" } })
    })

    await waitFor(() => {
      expect(screen.getByText("IDR - Indonesian rupiah")).toBeInTheDocument()
      expect(screen.queryByText("ARS - Argentine peso")).not.toBeInTheDocument()
    })
  })

  it("calls onCurrencySelect when a currency is selected", async () => {
    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("ARS - Argentine peso"))
    })

    expect(defaultProps.onCurrencySelect).toHaveBeenCalledWith("ARS")
  })

  it("highlights selected currency", async () => {
    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const selectedItem = screen.getByText("IDR - Indonesian rupiah").closest("div")
      expect(selectedItem).toHaveClass("bg-black", "text-white")
    })
  })

  it("closes dropdown when currency is selected", async () => {
    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("ARS - Argentine peso"))
    })

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument()
    })
  })

  it("handles empty search results", async () => {
    render(<CurrencyFilter {...defaultProps} />)

    fireEvent.click(screen.getByText("Select Currency"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "NonexistentCurrency" } })
    })

    await waitFor(() => {
      expect(screen.getByText("No currencies found")).toBeInTheDocument()
    })
  })
})
