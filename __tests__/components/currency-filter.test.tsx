import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CurrencyFilter } from "@/components/currency-filter/currency-filter"
import type { Currency } from "@/components/currency-filter/types"
import jest from "jest" // Declare the jest variable

// Mock the mobile hook
jest.mock("@/components/ui/use-mobile", () => ({
  useIsMobile: jest.fn(() => false),
}))

const mockCurrencies: Currency[] = [
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "ARS", name: "Argentine peso" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "BOB", name: "Boliviano" },
  { code: "BRL", name: "Brazilian real" },
]

const mockProps = {
  currencies: mockCurrencies,
  selectedCurrency: "IDR",
  onCurrencySelect: jest.fn(),
  trigger: <button>Open Currency Filter</button>,
}

describe("CurrencyFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders trigger element", () => {
    render(<CurrencyFilter {...mockProps} />)
    expect(screen.getByText("Open Currency Filter")).toBeInTheDocument()
  })

  it("opens dropdown when trigger is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument()
    })
  })

  it("displays all currencies when opened", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      mockCurrencies.forEach((currency) => {
        expect(screen.getByText(`${currency.code} - ${currency.name}`)).toBeInTheDocument()
      })
    })
  })

  it("highlights selected currency", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const selectedItem = screen.getByText("IDR - Indonesian rupiah")
      expect(selectedItem).toHaveClass("bg-black", "text-white")
    })
  })

  it("filters currencies based on search query", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "Indonesian" } })
    })

    await waitFor(() => {
      expect(screen.getByText("IDR - Indonesian rupiah")).toBeInTheDocument()
      expect(screen.queryByText("ARS - Argentine peso")).not.toBeInTheDocument()
    })
  })

  it("calls onCurrencySelect when currency is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("ARS - Argentine peso"))
    })

    expect(mockProps.onCurrencySelect).toHaveBeenCalledWith("ARS")
  })

  it("shows empty message when no currencies match search", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "nonexistent" } })
    })

    await waitFor(() => {
      expect(screen.getByText("No currencies found")).toBeInTheDocument()
    })
  })

  it("clears search when closed and reopened", async () => {
    render(<CurrencyFilter {...mockProps} />)

    // Open and search
    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "test" } })
    })

    // Close by clicking outside or escape
    fireEvent.keyDown(document, { key: "Escape" })

    // Reopen
    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      expect(searchInput).toHaveValue("")
    })
  })
})
