import { render, screen } from "@testing-library/react"
import OrderChatSkeleton from "@/components/order-chat-skeleton"

describe("OrderChatSkeleton", () => {
  it("renders the skeleton structure", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    // Check main container exists
    expect(container.firstChild).toHaveClass("flex", "flex-col", "h-full", "overflow-auto")
  })

  it("renders header skeleton with avatar and text placeholders", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    // Header should exist
    const header = container.querySelector(".border-b")
    expect(header).toBeInTheDocument()
    
    // Avatar skeleton
    const avatar = container.querySelector(".w-10.h-10.rounded-full")
    expect(avatar).toHaveClass("bg-grayscale-500", "animate-pulse")
    
    // Text placeholders in header
    const headerPlaceholders = header?.querySelectorAll(".bg-grayscale-500.animate-pulse.rounded")
    expect(headerPlaceholders?.length).toBeGreaterThanOrEqual(2)
  })

  it("renders disclaimer section skeleton", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    const disclaimer = container.querySelector(".rounded-\\[16px\\].h-\\[120px\\]")
    expect(disclaimer).toHaveClass("bg-grayscale-500", "animate-pulse")
  })

  it("renders multiple message skeletons", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    // Should have multiple message skeletons (sent and received)
    const messageContainers = container.querySelectorAll(".justify-start, .justify-end")
    expect(messageContainers.length).toBeGreaterThanOrEqual(4)
  })

  it("renders date header skeleton", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    const dateHeader = container.querySelector(".rounded-full.h-6.w-32")
    expect(dateHeader).toHaveClass("bg-grayscale-500", "animate-pulse")
  })

  it("renders input section skeleton", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    // Input field skeleton
    const input = container.querySelector(".h-14.w-full")
    expect(input).toHaveClass("bg-grayscale-500", "animate-pulse", "rounded-lg")
    
    // Character count skeleton
    const charCount = container.querySelector(".h-3.w-12")
    expect(charCount).toHaveClass("bg-grayscale-500", "animate-pulse")
  })

  it("applies correct styling to sent vs received message skeletons", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    const sentMessage = container.querySelector(".justify-end")
    const receivedMessage = container.querySelector(".justify-start")
    
    expect(sentMessage).toBeInTheDocument()
    expect(receivedMessage).toBeInTheDocument()
  })

  it("renders with correct border and background styling", () => {
    const { container } = render(<OrderChatSkeleton />)
    
    // Header border
    const header = container.querySelector(".border-b")
    expect(header).toBeInTheDocument()
    
    // Footer background
    const footer = container.querySelector(".bg-slate-75")
    expect(footer).toBeInTheDocument()
  })
})
