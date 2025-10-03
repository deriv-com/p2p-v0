"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthAPI } from "@/services/api"

interface CountryData {
  code: string
  name: string
  currency?: string
}

interface CurrencyDropdownProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function CurrencyDropdown({ value, onValueChange, disabled = false }: CurrencyDropdownProps) {
  const [countries, setCountries] = useState<CountryData[]>([])
  const [currencies, setCurrencies] = useState<string[]>([])

  useEffect(() => {
    const getCurrencies = async () => {
      try {
        const response = await AuthAPI.getCountries()
        if (response.countries) {
          const countryData = response.countries as CountryData[]
          setCountries(countryData)

          const uniqueCurrencies = Array.from(
            new Set(countryData.map((country) => country.currency).filter(Boolean)),
          ) as string[]
          setCurrencies(uniqueCurrencies)
        }
      } catch (error) {
        console.error("Failed to load countries:", error)
      }
    }

    getCurrencies()
  }, [])

  const selectedCountry = countries.find((country) => country.currency === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
       <SelectTrigger className="rounded-md px-3 h-[32px] lg:h-[40px] hidden" disabled>
        <SelectValue placeholder="For" />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {currencies.map((currency) => {
          const country = countries.find((c) => c.currency === currency)
          if (!country) return null

          return (
            <SelectItem key={currency} value={currency} className="cursor-pointer">
              <span className="text-sm">{currency}</span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
