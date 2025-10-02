"use client"

import type React from "react"
import { useCallback, useState, useMemo } from "react"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import EmptyState from "@/components/empty-state"

export interface PaymentMethod {
  display_name: string
  type: string
  method: string
}

interface PaymentMethodsFilterProps {
  paymentMethods: PaymentMethod[]
  selectedMethods: string[]
  onSelectionChange: (selectedMethods: string[]) => void
  isLoading?: boolean
  trigger: React.ReactElement
}

export default function PaymentMethodsFilter({
  paymentMethods,
  selectedMethods,
  onSelectionChange,
  isLoading = false,
  trigger,
}: PaymentMethodsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [tempSelectedMethods, setTempSelectedMethods] = useState<string[]>(selectedMethods)
  const isMobile = useIsMobile()

  const filteredPaymentMethods = useMemo(() => {
    if (!searchQuery.trim()) return paymentMethods

    return paymentMethods.filter(
      (method) =>
        method.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.method.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [paymentMethods, searchQuery])

  const groupedMethods = useMemo(() => {
    return filteredPaymentMethods.reduce(
      (acc, method) => {
        const { type } = method
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(method)
        return acc
      },
      {} as Record<string, PaymentMethod[]>,
    )
  }, [filteredPaymentMethods])

  const isAllSelected =
    filteredPaymentMethods.length > 0 &&
    filteredPaymentMethods.every((method) => tempSelectedMethods.includes(method.method))

  const isIndeterminate =
    filteredPaymentMethods.some((method) => tempSelectedMethods.includes(method.method)) && !isAllSelected

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = [...new Set([...tempSelectedMethods, ...filteredPaymentMethods.map((m) => m.method)])]
      setTempSelectedMethods(newSelection)
    } else {
      const filteredMethodIds = filteredPaymentMethods.map((m) => m.method)
      const newSelection = tempSelectedMethods.filter((id) => !filteredMethodIds.includes(id))
      setTempSelectedMethods(newSelection)
    }
  }

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleMethodToggle = (methodId: string) => {
    const isSelected = tempSelectedMethods.includes(methodId)
    if (isSelected) {
      setTempSelectedMethods(tempSelectedMethods.filter((id) => id !== methodId))
    } else {
      setTempSelectedMethods([...tempSelectedMethods, methodId])
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery("")
    } else {
      setTempSelectedMethods(selectedMethods)
    }
  }

  const handleReset = () => {
    const allMethodIds = paymentMethods.map((method) => method.method)
    setTempSelectedMethods(allMethodIds)
    onSelectionChange(allMethodIds)
    setIsOpen(false)
    setSearchQuery("")
  }

  const handleApply = () => {
    onSelectionChange(tempSelectedMethods)
    setIsOpen(false)
    setSearchQuery("")
  }

  const getGroupTitle = (type: string) => {
    if (type === "bank") return "Bank Transfers"
    if (type === "ewallet") return "E-Wallets"
    return type?.charAt(0).toUpperCase() + type?.slice(1)
  }

  const renderPaymentMethodGroups = () => {
    if (Object.keys(groupedMethods).length === 0) {
      return null
    }

    return Object.entries(groupedMethods)
      .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
      .map(([type, methods]) => (
        <div key={type} className="space-y-3">
          <h4 className="font-bold text-gray-900 text-sm">{getGroupTitle(type)}</h4>
          <div className="flex flex-col gap-3">
            {methods.map((method) => (
              <div key={method.method} className="flex items-center space-x-3">
                <Checkbox
                  id={method.method}
                  checked={tempSelectedMethods.includes(method.method)}
                  onCheckedChange={() => handleMethodToggle(method.method)}
                  className="data-[state=checked]:bg-black border-black"
                  disabled={isLoading}
                />
                <label htmlFor={method.method} className="text-sm text-grayscale-100 cursor-pointer flex-1">
                  {method.display_name}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))
  }

  const FilterContent = () => (
    <div className="w-full">
      <div className="relative mb-4">
        <Image
          src="/icons/search-icon-custom.png"
          alt="Search"
          width={24}
          height={24}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
        />
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          className="text-base pl-10 pr-10 h-8 border-grayscale-500 focus:border-grayscale-500  bg-grayscale-500 rounded-lg"
          autoComplete="off"
          autoFocus
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
          >
            <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
          </Button>
        )}
      </div>

      {filteredPaymentMethods.length > 0 && (
        <div className="flex items-center space-x-3 mb-4 pb-3">
          <Checkbox
            id="select-all"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onCheckedChange={handleSelectAll}
            className="data-[state=checked]:bg-black border-black"
            disabled={isLoading || filteredPaymentMethods.length === 0}
          />
          <label htmlFor="select-all" className="text-sm text-grayscale-100 cursor-pointer">
            Select all
          </label>
        </div>
      )}

      <div className="space-y-4 max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading payment methods...</div>
        ) : filteredPaymentMethods.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchQuery ? (
              <EmptyState
                title="Payment method unavailable"
                description="Search for a different payment method."
                redirectToAds={false}
              />
            ) : (
              "No payment methods available"
            )}
          </div>
        ) : (
          renderPaymentMethodGroups()
        )}
      </div>

      {filteredPaymentMethods.length > 0 && (
        <div className="flex flex-col-reverse md:flex-row gap-3 mt-4">
          <Button
            onClick={handleReset}
            className="flex-1 bg-transparent"
            variant="outline"
            size={isMobile ? "default" : "sm"}
          >
            Reset
          </Button>
          <Button onClick={handleApply} className="flex-1" size={isMobile ? "default" : "sm"}>
            Apply
          </Button>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent side="bottom" className="h-fit p-4 rounded-t-2xl">
          <div className="my-4">
            <h3 className="text-xl font-bold text-center">Payment method</h3>
          </div>
          <FilterContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <FilterContent />
      </PopoverContent>
    </Popover>
  )
}
