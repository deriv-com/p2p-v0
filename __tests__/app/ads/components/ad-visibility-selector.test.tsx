"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { AdVisibilitySelector } from "@/app/ads/components/shared/ad-visibility-selector"
import jest from "jest"

jest.mock("@/lib/i18n/use-translations", () => ({
  useTranslations: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "adForm.adVisibility": "Ad visibility",
        "adForm.adVisibilityTooltip": "Choose who can see your ad",
        "adForm.everyone": "Everyone",
        "adForm.everyoneDescription": "Your ad will be visible to everyone on the marketplace.",
        "adForm.closedGroup": "Closed group",
        "adForm.closedGroupDescription": "Your ad will be visible only to users in your close group list.",
        "adForm.editList": "Edit list",
      }
      return translations[key] || key
    },
  }),
}))

describe("AdVisibilitySelector", () => {
  const mockOnValueChange = jest.fn()
  const mockOnEditList = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the component with heading and tooltip", () => {
    render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    expect(screen.getByText("Ad visibility")).toBeInTheDocument()
    expect(screen.getByAltText("Info")).toBeInTheDocument()
  })

  it("renders both visibility options", () => {
    render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    expect(screen.getByText("Everyone")).toBeInTheDocument()
    expect(screen.getByText("Your ad will be visible to everyone on the marketplace.")).toBeInTheDocument()
    expect(screen.getByText("Closed group")).toBeInTheDocument()
    expect(screen.getByText("Your ad will be visible only to users in your close group list.")).toBeInTheDocument()
  })

  it("displays 'everyone' as selected when value is 'everyone'", () => {
    render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    const everyoneRadio = screen.getByRole("radio", { name: /everyone/i })
    expect(everyoneRadio).toBeChecked()
  })

  it("displays 'closed_group' as selected when value is 'closed_group'", () => {
    render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} />)

    const closedGroupRadio = screen.getByRole("radio", { name: /closed group/i })
    expect(closedGroupRadio).toBeChecked()
  })

  it("calls onValueChange when 'everyone' option is clicked", () => {
    render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} />)

    const everyoneOption = screen.getByLabelText(/everyone/i)
    fireEvent.click(everyoneOption)

    expect(mockOnValueChange).toHaveBeenCalledWith("everyone")
  })

  it("calls onValueChange when 'closed_group' option is clicked", () => {
    render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    const closedGroupOption = screen.getByLabelText(/closed group/i)
    fireEvent.click(closedGroupOption)

    expect(mockOnValueChange).toHaveBeenCalledWith("closed_group")
  })

  it("renders 'Edit list' button when onEditList prop is provided", () => {
    render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} onEditList={mockOnEditList} />)

    const editListButton = screen.getByRole("button", { name: "Edit list" })
    expect(editListButton).toBeInTheDocument()
  })

  it("does not render 'Edit list' button when onEditList prop is not provided", () => {
    render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} />)

    const editListButton = screen.queryByRole("button", { name: "Edit list" })
    expect(editListButton).not.toBeInTheDocument()
  })

  it("calls onEditList when 'Edit list' button is clicked", () => {
    render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} onEditList={mockOnEditList} />)

    const editListButton = screen.getByRole("button", { name: "Edit list" })
    fireEvent.click(editListButton)

    expect(mockOnEditList).toHaveBeenCalledTimes(1)
  })

  it("applies correct styling to selected option", () => {
    const { container } = render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    const everyoneLabel = container.querySelector('label[for="visibility-everyone"]')
    expect(everyoneLabel).toHaveClass("border-black")
    expect(everyoneLabel).toHaveClass("bg-grayscale-100")
  })

  it("applies correct styling to unselected option", () => {
    const { container } = render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    const closedGroupLabel = container.querySelector('label[for="visibility-closed-group"]')
    expect(closedGroupLabel).toHaveClass("border-grayscale-400")
    expect(closedGroupLabel).toHaveClass("bg-white")
  })

  it("renders globe icon for 'everyone' option", () => {
    const { container } = render(<AdVisibilitySelector value="everyone" onValueChange={mockOnValueChange} />)

    const everyoneLabel = container.querySelector('label[for="visibility-everyone"]')
    const svgIcon = everyoneLabel?.querySelector("svg")
    expect(svgIcon).toBeInTheDocument()
  })

  it("renders star icon for 'closed_group' option", () => {
    const { container } = render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} />)

    const closedGroupLabel = container.querySelector('label[for="visibility-closed-group"]')
    const svgIcon = closedGroupLabel?.querySelector("svg")
    expect(svgIcon).toBeInTheDocument()
  })

  it("prevents default behavior when clicking 'Edit list' button", () => {
    render(<AdVisibilitySelector value="closed_group" onValueChange={mockOnValueChange} onEditList={mockOnEditList} />)

    const editListButton = screen.getByRole("button", { name: "Edit list" })
    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true })
    const preventDefaultSpy = jest.spyOn(clickEvent, "preventDefault")

    fireEvent.click(editListButton, clickEvent)

    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
