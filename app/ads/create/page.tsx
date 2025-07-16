"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check } from "lucide-react"
import AdDetailsForm from "../components/ad-details-form"
import PaymentDetailsForm from "../components/payment-details-form"
import ProgressSteps from "../components/progress-steps"
import { createAd, updateAd } from "../api/api-ads"
import { PaymentSelectionProvider } from "../components/payment-selection-context"
import type { AdFormData, CreateAdPayload } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CreateAdPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AdFormData>({
    type: "buy",
    account_currency: "USD",
    payment_currency: "IDR",
    minimum_order_amount: 0,
    maximum_order_amount: 0,
    rate: 0,
    rate_type: "fixed",
    payment_method_names: [],
    payment_method_details: {},
    instructions: "",
    contact_info: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editAdId, setEditAdId] = useState<string | null>(null)

  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get("edit")
    const adData = urlParams.get("data")

    if (editId && adData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(adData))
        setIsEditMode(true)
        setEditAdId(editId)
        setFormData(parsedData)
      } catch (err) {
        console.error("Error parsing ad data:", err)
      }
    }
  }, [])

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/ads")
    }
  }

  const handleFormDataChange = (newData: Partial<AdFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      const payload: CreateAdPayload = {
        type: formData.type,
        account_currency: formData.account_currency,
        payment_currency: formData.payment_currency,
        minimum_order_amount: formData.minimum_order_amount,
        maximum_order_amount: formData.maximum_order_amount,
        rate: formData.rate,
        rate_type: formData.rate_type,
        payment_method_names: formData.payment_method_names,
        payment_method_details: formData.payment_method_details,
        instructions: formData.instructions,
        contact_info: formData.contact_info,
      }

      console.log("🔄 Creating ad with payload:", payload)

      let response
      if (isEditMode && editAdId) {
        response = await updateAd(editAdId, payload)
        console.log("✅ Ad updated successfully:", response)
      } else {
        response = await createAd(payload)
        console.log("✅ Ad created successfully:", response)
      }

      const params = new URLSearchParams({
        success: isEditMode ? "updated" : "created",
        type: formData.type,
        id: response.id?.toString() || editAdId || "unknown",
      })

      console.log("🚀 Navigating with window.location.href to:", `/ads?${params.toString()}`)
      window.location.href = `/ads?${params.toString()}`
    } catch (err) {
      console.error("❌ Error submitting ad:", err)
      setError(err instanceof Error ? err.message : "Failed to create ad")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return (
      formData.minimum_order_amount > 0 &&
      formData.maximum_order_amount >= formData.minimum_order_amount &&
      formData.rate > 0 &&
      formData.payment_method_names.length > 0 &&
      formData.instructions.trim() !== ""
    )
  }

  return (
    <PaymentSelectionProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4 p-0 h-auto font-normal text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Back to My ads" : "Back"}
            </Button>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">{isEditMode ? "Edit ad" : "Create new ad"}</h1>

            <ProgressSteps currentStep={currentStep} />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>{currentStep === 1 ? "Ad details" : "Payment details"}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 1 ? (
                <AdDetailsForm formData={formData} onChange={handleFormDataChange} onNext={handleNext} />
              ) : (
                <PaymentDetailsForm
                  formData={formData}
                  onChange={handleFormDataChange}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  isFormValid={isFormValid()}
                  isEditMode={isEditMode}
                />
              )}
            </CardContent>
          </Card>

          {!isMobile && currentStep === 2 && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={!isFormValid() || isSubmitting} className="min-w-[120px]">
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? "Updating..." : "Creating..."}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update ad" : "Create ad"}
                  </div>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PaymentSelectionProvider>
  )
}
