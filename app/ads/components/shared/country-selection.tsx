"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"

interface Country {
  code: string
  name: string
}

interface CountrySelectionProps {
  countries: Country[]
  selectedCountries: string[]
  onCountriesChange: (countries: string[]) => void
}

export default function CountrySelection({ countries, selectedCountries, onCountriesChange }: CountrySelectionProps) {
  const { t } = useTranslations()
  const isMobile = useIsMobile()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
      return t("common.all")
    }

    const countryNames = selectedCountries.map((code) => countries.find((c) => c.code === code)?.name).join(", ")
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
          placeholder={t("common.search")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-base pl-10 pr-10 h-8 border-grayscale-500 focus:border-grayscale-500  bg-grayscale-500 rounded-lg"
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

      <div className="space-y-4 px-1 relative">
        <div className="flex items-center space-x-3 mt-2">
          <Checkbox
            id="all-countries"
            checked={isAllSelected}
            onCheckedChange={handleAllToggle}
            className="data-[state=checked]:bg-black border-black"
          />
          <label htmlFor="all-countries" className="text-sm cursor-pointer">
            {t("common.all")}
          </label>
        </div>

        <div className="h-px bg-black/[0.08] my-7 md:fixed md:left-0 md:w-full" />

        <div className="space-y-4 max-h-[300px] overflow-y-auto pt-6">
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
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-[56px] max-h-none justify-between px-4 rounded-lg bg-transparent border-input hover:bg-transparent focus:border-black"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-left font-normal">{getDisplayText()}</span>
            <Image
              src="/icons/chevron-down.png"
              alt="Dropdown icon"
              width={24}
              height={24}
              className={cn("ml-2 transition-transform duration-200", isOpen && "rotate-180")}
            />
          </Button>
        </DrawerTrigger>
        <DrawerContent side="bottom" className="h-fit">
          <div className="my-4">
            <h3 className="text-xl font-bold text-center">Country selection</h3>
            <div className="text-base text-center opacity-72 mt-2">Select any number of countries.</div>
          </div>
          <div className="p-4">
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
          className="w-full h-[56px] max-h-none justify-between px-4 rounded-lg bg-transparent border-input hover:bg-transparent focus:border-black"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-left font-normal">{getDisplayText()}</span>
          <Image
            src="/icons/chevron-down.png"
            alt="Dropdown icon"
            width={24}
            height={24}
            className={cn("ml-2 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-4 
                   w-[var(--radix-popover-trigger-width)] 
                   min-w-[var(--radix-popover-trigger-width)]"
      >
        <CountryList />
      </PopoverContent>
    </Popover>
  )
}
