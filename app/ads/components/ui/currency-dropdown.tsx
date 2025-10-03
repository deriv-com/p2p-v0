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

          // Extract unique currencies from the data
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

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🏳️"
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const selectedCountry = countries.find((country) => country.currency === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full h-14 rounded-lg border-grayscale-200 hover:border-grayscale-300 transition-colors">
        <div className="flex items-center gap-3">
          {selectedCountry && (
            <SelectValue>
              <span className="text-base font-medium">{selectedCountry.currency}</span>
            </SelectValue>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {currencies.map((currency) => {
          const country = countries.find((c) => c.currency === currency)
          if (!country) return null

          return (
            <SelectItem key={currency} value={currency} className="cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getFlagEmoji(country.code)}</span>
                <span className="text-sm">{currency}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
