"use client"

import type React from "react"

import { useMemo, useState, useCallback } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import type { Country } from "@/services/api/api-auth"
import EmptyState from "@/components/empty-state"

interface CountrySelectionProps {
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
  countries: Country[]
  isLoading: boolean
}

export default function CountrySelection({
  selectedCountries,
  onCountriesChange,
  countries,
  isLoading,
}: CountrySelectionProps) {
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCountries = useMemo(() => {
    if (!searchTerm.trim()) return countries

    return countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [countries, searchTerm])

  const isAllSelected = useMemo(() => {
    return selectedCountries.length === 0 || selectedCountries.length === countries.length
  }, [selectedCountries.length, countries.length])

  const handleCountryToggle = useCallback(
    (countryCode: string) => {
      if (selectedCountries.length === 0) {
        onCountriesChange([countryCode])
      } else if (selectedCountries.includes(countryCode)) {
        const newSelection = selectedCountries.filter((code) => code !== countryCode)
        onCountriesChange(newSelection.length === 0 ? [] : newSelection)
      } else {
        onCountriesChange([...selectedCountries, countryCode])
      }
    },
    [selectedCountries, onCountriesChange],
  )

  const handleAllToggle = useCallback(
    (checked: boolean | string) => {
      if (checked) {
        const allCountryCodes = countries.map((country) => country.code)
        onCountriesChange(allCountryCodes)
      } else {
        onCountriesChange([])
      }
    },
    [countries, onCountriesChange],
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchTerm("")
  }, [])

  const displayText = useMemo(() => {
   // if (isAllSelected) {
      return "All"
   // }

    /*const countryNames = selectedCountries
      .map((code) => countries.find((c) => c.code === code)?.name)
      .filter(Boolean)
      .join(", ")
    return countryNames || "All"*/
  }, [isAllSelected, selectedCountries, countries])

  const CountryList = () => (
    <div className="space-y-4">
      <div className="relative">
        <Image
          src="/icons/search-icon-custom.png"
          alt="Search"
          width={24}
          height={24}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearchChange}
          className="text-base pl-10 pr-10 h-8 border-grayscale-500 focus:border-grayscale-500  bg-grayscale-500 rounded-lg"
          autoComplete="off"
          autoFocus
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
          >
            <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
          </Button>
        )}
      </div>

      <div className="space-y-4 overflow-y-auto">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="all-countries"
            checked={isAllSelected}
            onCheckedChange={handleAllToggle}
            className="data-[state=checked]:bg-black border-black"
          />
          <label htmlFor="all-countries" className="text-sm cursor-pointer">
            All
          </label>
        </div>

        {isLoading ? (
          <div className="text-sm text-center py-4">Loading countries...</div>
        ) : filteredCountries.length === 0 ? (
          <EmptyState title="No countries found" redirectToAds={false} />
        ) : (
          filteredCountries.map((country) => (
            <div key={country.code} className="flex items-center space-x-3">
              <Checkbox
                id={country.code}
                checked={selectedCountries.includes(country.code)}
                onCheckedChange={() => handleCountryToggle(country.code)}
                disabled={false}
                className="data-[state=checked]:bg-black border-black"
              />
              <label htmlFor={country.code} className="text-sm cursor-pointer">
                {country.name}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between px-4 rounded-lg bg-transparent"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-left font-normal">{displayText}</span>
            <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
          </Button>
        </DrawerTrigger>
        <DrawerContent side="bottom" className="h-fit p-4">
          <div className="my-4">
            <h3 className="text-xl font-bold text-center">Country selection</h3>
            <div className="text-base text-center opacity-72 mt-2">Select any number of countries.</div>
          </div>
          <div className="mt-4">
            <CountryList />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between px-4 rounded-lg bg-transparent border-input hover:bg-transparent focus:border-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-left font-normal">{displayText}</span>
          <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-4" align="start">
        <CountryList />
      </PopoverContent>
    </Popover>
  )
}
