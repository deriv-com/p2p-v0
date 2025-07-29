"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Search } from "lucide-react"

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
  const isMobile = useIsMobile()

  const filteredPaymentMethods = useMemo(() => {
    if (!searchQuery.trim()) return paymentMethods

    return paymentMethods.filter(
      (method) =>
        method.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        method.method.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [paymentMethods, searchQuery])

  const isAllSelected =
    filteredPaymentMethods.length > 0 &&
    filteredPaymentMethods.every((method) => selectedMethods.includes(method.method))

  const isIndeterminate =
    filteredPaymentMethods.some((method) => selectedMethods.includes(method.method)) && !isAllSelected

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = [...new Set([...selectedMethods, ...filteredPaymentMethods.map((m) => m.method)])]
      onSelectionChange(newSelection)
    } else {
      const filteredMethodIds = filteredPaymentMethods.map((m) => m.method)
      const newSelection = selectedMethods.filter((id) => !filteredMethodIds.includes(id))
      onSelectionChange(newSelection)
    }
  }

  const handleMethodToggle = (methodId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedMethods, methodId])
    } else {
      onSelectionChange(selectedMethods.filter((id) => id !== methodId))
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchQuery("")
    }
  }

  const FilterContent = () => (
    <div className="w-full">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-300 focus:border-black"
        />
      </div>

      <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200">
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
        <label htmlFor="select-all" className="text-sm text-gray-700 cursor-pointer font-medium">
          Select all
        </label>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading payment methods...</div>
        ) : filteredPaymentMethods.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchQuery ? "No payment methods found" : "No payment methods available"}
          </div>
        ) : (
          filteredPaymentMethods.map((method) => (
            <div key={method.method} className="flex items-center space-x-3">
              <Checkbox
                id={method.method}
                checked={selectedMethods.includes(method.method)}
                onCheckedChange={(checked) => handleMethodToggle(method.method, checked as boolean)}
                className="data-[state=checked]:bg-black border-black"
              />
              <label htmlFor={method.method} className="text-sm text-gray-700 cursor-pointer flex-1">
                {method.display_name}
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="h-fit p-4 rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">Payment method</h3>
          </div>
          <FilterContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <FilterContent />
      </PopoverContent>
    </Popover>
  )
}
