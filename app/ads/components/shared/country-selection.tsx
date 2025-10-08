"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"

interface Country {
  code: string
  name: string
}

interface CountrySelectionProps {
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
}

const COUNTRIES: Country[] = [
  { code: "ad", name: "Andorra" },
  { code: "af", name: "Afghanistan" },
  { code: "al", name: "Albania" },
  { code: "ar", name: "Argentina" },
]

export default function CountrySelection({ selectedCountries, onCountriesChange }: CountrySelectionProps) {
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCountries = COUNTRIES.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const isAllSelected = selectedCountries.length === 0

  const handleCountryToggle = (countryCode: string) => {
    if (selectedCountries.length === 0) {
      onCountriesChange([countryCode])
    } else if (selectedCountries.includes(countryCode)) {
      const newSelection = selectedCountries.filter((code) => code !== countryCode)
      onCountriesChange(newSelection.length === 0 ? [] : newSelection)
    } else {
      onCountriesChange([...selectedCountries, countryCode])
    }
  }

  const handleAllToggle = (checked: boolean | string) => {
    if (checked) {
      onCountriesChange([])
    } else {
      onCountriesChange([])
    }
  }

  const getDisplayText = () => {
    if (isAllSelected) {
      return "All"
    }
  
      const countryNames = selectedCountries
        .map((code) => COUNTRIES.find((c) => c.code === code)?.name)
        .join(", ")
      return countryNames
  
  }

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
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base pl-10 border-gray-200 focus:border-black focus:ring-0"
          autoComplete="off"
          autoFocus
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
          >
            <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
          </Button>
        )}
      </div>

      <div className="space-y-4 overflow-y-auto px-4">
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

        {filteredCountries.map((country) => (
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
        ))}
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
            <span className="text-left font-normal">{getDisplayText()}</span>
            <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
          </Button>
        </DrawerTrigger>
        <DrawerContent side="bottom" className="h-fit p-4 rounded-t-2xl">
          <div className="my-4">
            <h3 className="text-xl font-bold text-center">Country selection</h3>
            <div className="text-base text-center opacity-72 mt-2">Select any number of countries.</div>
          </div>
          <div className="mt-6">
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
          <span className="text-left font-normal">{getDisplayText()}</span>
          <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-4" align="start">
        <CountryList />
      </PopoverContent>
    </Popover>
  )
}
