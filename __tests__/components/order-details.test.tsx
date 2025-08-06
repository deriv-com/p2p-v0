import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OrderDetails } from '@/components/order-details/order-details'
import type { Order } from '@/services/api/api-orders'

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

const mockOrder: Order = {
  id: 'ORD123456',
  type: 'buy',
  amount: 1000,
  payment_amount: 50000,
  exchange_rate: 50,
  created_at: '2024-01-15T10:30:00Z',
  status: 'pending',
  user: {
    id: 'user123',
    nickname: 'buyer_user',
  },
  advert: {
    id: 'ad123',
    account_currency: 'USD',
    payment_currency: 'IDR',
    user: {
      id: 'advertiser123',
      nickname: 'seller_user',
    },
  },
}

describe('OrderDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all order details correctly', () => {
    render(<OrderDetails order={mockOrder} />)
    
    expect(screen.getByTestId('order-details-container')).toBeInTheDocument()
    expect(screen.getByTestId('order-id-item')).toBeInTheDocument()
    expect(screen.getByTestId('exchange-rate-item')).toBeInTheDocument()
    expect(screen.getByTestId('payment-amount-item')).toBeInTheDocument()
    expect(screen.getByTestId('amount-item')).toBeInTheDocument()
    expect(screen.getByTestId('order-time-item')).toBeInTheDocument()
    expect(screen.getByTestId('counterparty-item')).toBeInTheDocument()
  })

  it('displays correct order ID with copy button', () => {
    render(<OrderDetails order={mockOrder} />)
    
    const orderIdItem = screen.getByTestId('order-id-item')
    expect(orderIdItem).toHaveTextContent('ORD123456')
    expect(screen.getByTestId('copy-order-id-button')).toBeInTheDocument()
  })

  it('copies order ID to clipboard when copy button is clicked', async () => {
    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText')
    
    render(<OrderDetails order={mockOrder} />)
    
    const copyButton = screen.getByTestId('copy-order-id-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('ORD123456')
    })
  })

  it('shows success feedback after copying', async () => {
    render(<OrderDetails order={mockOrder} />)
    
    const copyButton = screen.getByTestId('copy-order-id-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('copy-success-icon')).toBeInTheDocument()
    })
  })

  it('resets copy feedback after timeout', async () => {
    jest.useFakeTimers()
    
    render(<OrderDetails order={mockOrder} />)
    
    const copyButton = screen.getByTestId('copy-order-id-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('copy-success-icon')).toBeInTheDocument()
    })
    
    jest.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(screen.queryByTestId('copy-success-icon')).not.toBeInTheDocument()
      expect(screen.getByTestId('copy-order-id-button')).toBeInTheDocument()
    })
    
    jest.useRealTimers()
  })

  it('handles clipboard API errors gracefully', async () => {
    const writeTextSpy = jest.spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValueOnce(new Error('Clipboard error'))
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<OrderDetails order={mockOrder} />)
    
    const copyButton = screen.getByTestId('copy-order-id-button')
    fireEvent.click(copyButton)
    
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('ORD123456')
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy order ID:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })

  it('displays correct exchange rate format', () => {
    render(<OrderDetails order={mockOrder} />)
    
    const exchangeRateItem = screen.getByTestId('exchange-rate-item')
    expect(exchangeRateItem).toHaveTextContent('IDR 50.00')
  })

  it('shows correct payment amount for buy order', () => {
    render(<OrderDetails order={mockOrder} />)
    
    const paymentAmountItem = screen.getByTestId('payment-amount-item')
    expect(paymentAmountItem).toHaveTextContent('You pay')
    expect(paymentAmountItem).toHaveTextContent('IDR 50,000')
  })

  it('shows correct amount for buy order', () => {
    render(<OrderDetails order={mockOrder} />)
    
    const amountItem = screen.getByTestId('amount-item')
    expect(amountItem).toHaveTextContent('You receive')
    expect(amountItem).toHaveTextContent('USD 1,000')
  })

  it('displays correct counterparty for buy order', () => {
    render(<OrderDetails order={mockOrder} />)
    
    const counterpartyItem = screen.getByTestId('counterparty-item')
    expect(counterpartyItem).toHaveTextContent('Seller')
    expect(counterpartyItem).toHaveTextContent('seller_user')
  })

  it('handles sell order correctly', () => {
    const sellOrder = { ...mockOrder, type: 'sell' as const }
    render(<OrderDetails order={sellOrder} />)
    
    const paymentAmountItem = screen.getByTestId('payment-amount-item')
    const amountItem = screen.getByTestId('amount-item')
    const counterpartyItem = screen.getByTestId('counterparty-item')
    
    expect(paymentAmountItem).toHaveTextContent('You receive')
    expect(amountItem).toHaveTextContent('You send')
    expect(counterpartyItem).toHaveTextContent('Buyer')
  })

  it('returns null when order is not provided', () => {
    const { container } = render(<OrderDetails order={null as any} />)
    expect(container.firstChild).toBeNull()
  })

  it('handles missing counterparty nickname gracefully', () => {
    const orderWithoutNickname = {
      ...mockOrder,
      advert: {
        ...mockOrder.advert,
        user: {
          ...mockOrder.advert.user,
          nickname: undefined,
        },
      },
    }
    
    render(<OrderDetails order={orderWithoutNickname} />)
    
    const counterpartyItem = screen.getByTestId('counterparty-item')
    expect(counterpartyItem).toHaveTextContent('Seller')
    expect(counterpartyItem).toHaveTextContent('')
  })

  it('applies correct CSS classes', () => {
    render(<OrderDetails order={mockOrder} />)
    
    const container = screen.getByTestId('order-details-container')
    expect(container).toHaveClass('space-y-[16px]')
  })
})
