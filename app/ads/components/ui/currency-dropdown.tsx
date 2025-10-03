"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthAPI } from "@/services/api"
import type { Country } from "@/services/api/api-auth"

interface CurrencyDropdownProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function CurrencyDropdown({ value, onValueChange, disabled = false }: CurrencyDropdownProps) {
  const [countries, setCountries] = useState<Country[]>([])

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await AuthAPI.getCountries()
        if (response.countries) {
          setCountries(response.countries)
        }
      } catch (error) {
        console.error("Failed to load countries:", error)
      }
    }

    loadCountries()
  }, [])

  // Get flag emoji from country code
  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🏳️"
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  const selectedCountry = countries.find((country) => country.code === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full h-14 rounded-lg border-grayscale-200 hover:border-grayscale-300 transition-colors">
        <div className="flex items-center gap-3">
          {selectedCountry && (
            <>
              <span className="text-2xl">{getFlagEmoji(selectedCountry.code)}</span>
              <SelectValue>
                <span className="text-base font-medium">{selectedCountry.code}</span>
              </SelectValue>
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.code} className="cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getFlagEmoji(country.code)}</span>
              <span className="text-sm">
                {country.code} - {country.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
