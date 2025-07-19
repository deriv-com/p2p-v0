import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CurrencyFilter } from "@/components/currency-filter"
import type { Currency } from "@/components/currency-filter/types"
import jest from "jest"

const mockCurrencies: Currency[] = [
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
]

const mockProps = {
  currencies: mockCurrencies,
  selectedCurrency: "IDR",
  onCurrencySelect: jest.fn(),
  trigger: <button>Open Currency Filter</button>,
}

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src || "/placeholder.svg"} alt={alt} {...props} />,
}))

// Mock useIsMobile hook
jest.mock("@/components/ui/use-mobile", () => ({
  useIsMobile: () => false,
}))

describe("CurrencyFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders trigger element", () => {
    render(<CurrencyFilter {...mockProps} />)
    expect(screen.getByText("Open Currency Filter")).toBeInTheDocument()
  })

  it("opens popover when trigger is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search")).toBeInTheDocument()
    })
  })

  it("displays all currencies when no search query", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      expect(screen.getByText("IDR - Indonesian rupiah")).toBeInTheDocument()
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.getByText("EUR - Euro")).toBeInTheDocument()
    })
  })

  it("filters currencies based on search query", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "USD" } })
    })

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("IDR - Indonesian rupiah")).not.toBeInTheDocument()
      expect(screen.queryByText("EUR - Euro")).not.toBeInTheDocument()
    })
  })

  it("calls onCurrencySelect when currency is clicked", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      fireEvent.click(screen.getByText("USD - US Dollar"))
    })

    expect(mockProps.onCurrencySelect).toHaveBeenCalledWith("USD")
  })

  it("highlights selected currency", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const selectedCurrency = screen.getByText("IDR - Indonesian rupiah")
      expect(selectedCurrency).toHaveClass("bg-black", "text-white")
    })
  })

  it("shows empty message when no currencies match search", async () => {
    render(<CurrencyFilter {...mockProps} emptyMessage="No currencies found" />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.change(searchInput, { target: { value: "XYZ" } })
    })

    await waitFor(() => {
      expect(screen.getByText("No currencies found")).toBeInTheDocument()
    })
  })

  it("closes popover when Escape key is pressed", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")
      fireEvent.keyDown(searchInput, { key: "Escape" })
    })

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument()
    })
  })

  it("uses custom search icon", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchIcon = screen.getByAltText("Search")
      expect(searchIcon).toBeInTheDocument()
      expect(searchIcon).toHaveAttribute("src", "/icons/search-icon-custom.png")
    })
  })

  it("supports continuous search functionality", async () => {
    render(<CurrencyFilter {...mockProps} />)

    fireEvent.click(screen.getByText("Open Currency Filter"))

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")

      // Type "U" - should show USD
      fireEvent.change(searchInput, { target: { value: "U" } })
    })

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("IDR - Indonesian rupiah")).not.toBeInTheDocument()
    })

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText("Search")

      // Type "US" - should still show USD
      fireEvent.change(searchInput, { target: { value: "US" } })
    })

    await waitFor(() => {
      expect(screen.getByText("USD - US Dollar")).toBeInTheDocument()
      expect(screen.queryByText("EUR - Euro")).not.toBeInTheDocument()
    })
  })
})
