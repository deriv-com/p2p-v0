"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
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
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "CA", name: "Canada" },
  { code: "CN", name: "China" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "NL", name: "Netherlands" },
  { code: "NG", name: "Nigeria" },
  { code: "PK", name: "Pakistan" },
  { code: "PH", name: "Philippines" },
  { code: "RU", name: "Russia" },
  { code: "SG", name: "Singapore" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
]

export default function CountrySelection({ selectedCountries, onCountriesChange }: CountrySelectionProps) {
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCountries = COUNTRIES.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const isAllSelected = selectedCountries.length === 0
  const selectedCount = selectedCountries.length

  const handleCountryToggle = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      onCountriesChange(selectedCountries.filter((code) => code !== countryCode))
    } else {
      onCountriesChange([...selectedCountries, countryCode])
    }
  }

  const handleAllToggle = () => {
    if (isAllSelected) {
      return
    } else {
      onCountriesChange([])
    }
  }

  const getDisplayText = () => {
    if (isAllSelected) {
      return "All"
    }
    if (selectedCount === 1) {
      const country = COUNTRIES.find((c) => c.code === selectedCountries[0])
      return country?.name || "1 country selected"
    }
    return `${selectedCount} countries selected`
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
          className="pl-10"
        />
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        <div className="flex items-center space-x-3">
          <Checkbox id="all-countries" checked={isAllSelected} onCheckedChange={handleAllToggle} />
          <label htmlFor="all-countries" className="text-sm font-medium cursor-pointer">
            All
          </label>
        </div>

        {filteredCountries.map((country) => (
          <div key={country.code} className="flex items-center space-x-3">
            <Checkbox
              id={country.code}
              checked={selectedCountries.includes(country.code)}
              onCheckedChange={() => handleCountryToggle(country.code)}
              disabled={isAllSelected}
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
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="w-[70%] justify-between px-4 rounded-sm"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-left font-normal">{getDisplayText()}</span>
            <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Country selection</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CountryList />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[70%] justify-between px-4 rounded-sm"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-left font-normal rounded-sm">{getDisplayText()}</span>
          <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-4" align="start">
        <CountryList />
      </PopoverContent>
    </Popover>
  )
}
