"use client"

import { useState, useEffect } from "react"

export interface Currency {
  code: string
  name: string
}

export function useCurrencyData() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock currency data - replace with actual API call
    const mockCurrencies: Currency[] = [
      { code: "IDR", name: "Indonesian rupiah" },
      { code: "ARS", name: "Argentine peso" },
      { code: "BDT", name: "Bangladeshi taka" },
      { code: "BOB", name: "Boliviano" },
      { code: "BRL", name: "Brazilian real" },
      { code: "COP", name: "Colombian peso" },
      { code: "CRC", name: "Costa Rican colon" },
      { code: "GHS", name: "Ghanaian cedi" },
      { code: "GTQ", name: "Guatemalan quetzal" },
      { code: "HNL", name: "Honduran lempira" },
      { code: "INR", name: "Indian rupee" },
      { code: "KES", name: "Kenyan shilling" },
      { code: "LKR", name: "Sri Lankan rupee" },
      { code: "MAD", name: "Moroccan dirham" },
      { code: "MXN", name: "Mexican peso" },
      { code: "NGN", name: "Nigerian naira" },
      { code: "PAB", name: "Panamanian balboa" },
      { code: "PEN", name: "Peruvian sol" },
      { code: "PHP", name: "Philippine peso" },
      { code: "PKR", name: "Pakistani rupee" },
      { code: "TZS", name: "Tanzanian shilling" },
      { code: "UGX", name: "Ugandan shilling" },
      { code: "USD", name: "US Dollar" },
      { code: "EUR", name: "Euro" },
      { code: "GBP", name: "British Pound" },
    ]

    // Simulate API delay
    setTimeout(() => {
      setCurrencies(mockCurrencies)
      setLoading(false)
    }, 500)
  }, [])

  return {
    currencies,
    loading,
  }
}
