"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { AdFormData } from "../types"
import { CurrencyInput } from "./ui/currency-input"
import { RateInput } from "./ui/rate-input"
import { TradeTypeSelector } from "./ui/trade-type-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdsAPI } from "@/services/api"
import { useCurrencyData } from "@/hooks/use-currency-data"

interface AdDetailsFormProps {
  onNext: (data: Partial<AdFormData>, errors?: ValidationErrors) => void
  initialData?: Partial<AdFormData>
  isEditMode?: boolean
}

interface ValidationErrors {
  totalAmount?: string
  fixedRate?: string
  minAmount?: string
  maxAmount?: string
}

export default function AdDetailsForm({ onNext, initialData, isEditMode }: AdDetailsFormProps) {
  const [type, setType] = useState<"buy" | "sell">(initialData?.type || "buy")
  const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount?.toString() || "")
  const [fixedRate, setFixedRate] = useState(initialData?.fixedRate?.toString() || "")
  const [minAmount, setMinAmount] = useState(initialData?.minAmount?.toString() || "")
  const [maxAmount, setMaxAmount] = useState(initialData?.maxAmount?.toString() )
  const [buyCurrency, setBuyCurrency] = useState(initialData?.buyCurrency?.toString() || "USD")
  const [forCurrency, setForCurrency] = useState(initialData?.forCurrency?.toString() || ")
  const { currencies: currencyList } = useCurrencyData()
  const [currencies, setCurrencies] = useState<string[]>([])
  const [formErrors, setFormErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState({
    totalAmount: false,
    fixedRate: false,
    minAmount: false,
    maxAmount: false,
  })

  const isFormValid = () => {
    const hasValues = !!totalAmount && !!fixedRate && !!minAmount && !!maxAmount
    const hasNoErrors = Object.keys(formErrors).length === 0
    return hasValues && hasNoErrors
  }

  useEffect(() => {
    const loadCurrencies = async () => {
      const currencyList = await AdsAPI.getCurrencies()
      setCurrencies(currencyList)
    }
    loadCurrencies()
  }, [])

  useEffect(() => {
    if (currencyList.length > 0 && !forCurrency) {
      setForCurrency(currencyList[0].code)
    }
  }, [currencyList, forCurrency])

  useEffect(() => {
    if (initialData) {
      if (initialData.type) setType(initialData.type as "buy" | "sell")
      if (initialData.totalAmount !== undefined) setTotalAmount(initialData.totalAmount.toString())
      if (initialData.fixedRate !== undefined) setFixedRate(initialData.fixedRate.toString())
      if (initialData.minAmount !== undefined) setMinAmount(initialData.minAmount.toString())
      if (initialData.maxAmount !== undefined) setMaxAmount(initialData.maxAmount.toString())
    }
  }, [initialData])

  useEffect(() => {
    const errors: ValidationErrors = {}
    const total = Number(totalAmount)
    const min = Number(minAmount)
    const max = Number(maxAmount)
    const rate = Number(fixedRate)

    if (touched.totalAmount) {
      if (!totalAmount) {
        errors.totalAmount = "Total amount is required"
      } else if (total <= 0) {
        errors.totalAmount = "Total amount must be greater than 0"
      }
    }

    if (min > total) {
      errors.minAmount = "Minimum amount must be less than total amount"
    }

    if (max > total) {
      errors.maxAmount = "Maximum amount must be less than total amount"
    }

    if (touched.fixedRate) {
      if (!fixedRate) {
        errors.fixedRate = "Rate is required"
      } else if (rate <= 0) {
        errors.fixedRate = "Rate must be greater than 0"
      }
    }

    if (touched.minAmount) {
      if (!minAmount) {
        errors.minAmount = "Minimum amount is required"
      } else if (min <= 0) {
        errors.minAmount = "Minimum amount must be greater than 0"
      }
    }

    if (touched.minAmount && touched.maxAmount && min > max) {
      errors.minAmount = "Minimum amount must be less than maximum amount"
      errors.maxAmount = "Maximum amount must be greater than minimum amount"
    }

    if (touched.maxAmount) {
      if (!maxAmount) {
        errors.maxAmount = "Maximum amount is required"
      } else if (max <= 0) {
        errors.maxAmount = "Maximum amount must be greater than 0"
      }
    }

    setFormErrors(errors)
  }, [totalAmount, fixedRate, minAmount, maxAmount, touched])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({
      totalAmount: true,
      fixedRate: true,
      minAmount: true,
      maxAmount: true,
    })

    const total = Number(totalAmount)
    const min = Number(minAmount)
    const max = Number(maxAmount)

    const additionalErrors: ValidationErrors = {}

    if (min > total) {
      additionalErrors.minAmount = "Minimum amount must be less than total amount"
    }

    if (max > total) {
      additionalErrors.maxAmount = "Maximum amount must be less than total amount"
    }

    if (min > max) {
      additionalErrors.minAmount = "Minimum amount must be less than maximum amount"
      additionalErrors.maxAmount = "Maximum amount must be greater than minimum amount"
    }

    const combinedErrors = { ...formErrors, ...additionalErrors }

    if (Object.keys(additionalErrors).length > 0) {
      setFormErrors(combinedErrors)
    }

    if (!isFormValid() || Object.keys(additionalErrors).length > 0) {
      const formData = {
        type,
        totalAmount: Number.parseFloat(totalAmount) || 0,
        fixedRate: Number.parseFloat(fixedRate) || 0,
        minAmount: Number.parseFloat(minAmount) || 0,
        maxAmount: Number.parseFloat(maxAmount) || 0,
        forCurrency,
        buyCurrency
      }

      onNext(formData, combinedErrors)
      return
    }

    const formData = {
      type,
      totalAmount: Number.parseFloat(totalAmount) || 0,
      fixedRate: Number.parseFloat(fixedRate) || 0,
      minAmount: Number.parseFloat(minAmount) || 0,
      maxAmount: Number.parseFloat(maxAmount) || 0,
      forCurrency,
      buyCurrency
    }

    onNext(formData)
  }

  useEffect(() => {
    const isValid = isFormValid()
    const event = new CustomEvent("adFormValidationChange", {
      bubbles: true,
      detail: {
        isValid,
        formData: {
          type,
          totalAmount: Number.parseFloat(totalAmount) || 0,
          fixedRate: Number.parseFloat(fixedRate) || 0,
          minAmount: Number.parseFloat(minAmount) || 0,
          maxAmount: Number.parseFloat(maxAmount) || 0,
        },
      },
    })
    document.dispatchEvent(event)
  }, [type, totalAmount, fixedRate, minAmount, maxAmount, formErrors])

  return (
    <div className="max-w-[800px] mx-auto">
      <form id="ad-details-form" onSubmit={handleSubmit} className="space-y-6">
        {!isEditMode && (
          <div>
            <TradeTypeSelector value={type} onChange={setType} isEditMode={isEditMode} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block mb-2 text-black text-sm font-normal leading-5">
                  {type === "buy" ? "Buy currency" : "Sell currency"}
                </label>
                <Select value={buyCurrency} onValueChange={setBuyCurrency}>
                  <SelectTrigger className="w-full h-14 rounded-lg" disabled>
                    <SelectValue>{buyCurrency}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block mb-2 text-black text-sm font-normal leading-5">For</label>
                <Select value={forCurrency} onValueChange={setForCurrency}>
                  <SelectTrigger className="w-full h-14 rounded-lg">
                    <SelectValue>{forCurrency}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {currencyList.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-base font-bold leading-6 tracking-normal mb-4">Price type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-grayscale-200 pb-6">
            <div>
              <RateInput
                currency={forCurrency}
                label="Fixed price"
                value={fixedRate}
                onChange={(value) => {
                  setFixedRate(value)
                  setTouched((prev) => ({ ...prev, fixedRate: true }))
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, fixedRate: true }))}
                error={touched.fixedRate && !!formErrors.fixedRate}
              />
              {touched.fixedRate && formErrors.fixedRate && (
                <p className="text-destructive text-xs mt-1">{formErrors.fixedRate}</p>
              )}
            </div>
            <div>
              <CurrencyInput
                value={totalAmount}
                onValueChange={(value) => {
                  setTotalAmount(value)
                  setTouched((prev) => ({ ...prev, totalAmount: true }))
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, totalAmount: true }))}
                placeholder={type === "sell" ? "Sell quantity" : "Buy quantity"}
                isEditMode={isEditMode}
                error={touched.totalAmount && !!formErrors.totalAmount}
                currency={buyCurrency}
              />
              {touched.totalAmount && formErrors.totalAmount && (
                <p className="text-destructive text-xs mt-1">{formErrors.totalAmount}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold leading-6 tracking-normal mb-4">Transaction limit</h3>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div>
              <CurrencyInput
                value={minAmount}
                onValueChange={(value) => {
                  setMinAmount(value)
                  setTouched((prev) => ({ ...prev, minAmount: true }))
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, minAmount: true }))}
                placeholder="Minimum order"
                error={touched.minAmount && !!formErrors.minAmount}
                currency={buyCurrency}
              />
              {touched.minAmount && formErrors.minAmount && (
                <p className="text-destructive text-xs mt-1">{formErrors.minAmount}</p>
              )}
            </div>
            <div className="text-xl hidden md:block">~</div>
            <div>
              <CurrencyInput
                value={maxAmount}
                onValueChange={(value) => {
                  setMaxAmount(value)
                  setTouched((prev) => ({ ...prev, maxAmount: true }))
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, maxAmount: true }))}
                placeholder="Maximum order"
                error={touched.maxAmount && !!formErrors.maxAmount}
                currency={buyCurrency}
              />
              {touched.maxAmount && formErrors.maxAmount && (
                <p className="text-destructive text-xs mt-1">{formErrors.maxAmount}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
