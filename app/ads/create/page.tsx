"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import AdDetailsForm from "../components/ad-details-form"
import PaymentDetailsForm from "../components/payment-details-form"
import ProgressSteps from "../components/progress-steps"
import { PaymentSelectionProvider } from "../components/payment-selection-context"
import { createAdvert, updateAdvert, getAdvertDetails } from "../api/api-ads"
import type { CreateAdvertRequest, UpdateAdvertRequest, MyAd } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CreateAdPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [adData, setAdData] = useState<Partial<CreateAdvertRequest>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [existingAd, setExistingAd] = useState<MyAd | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  // Check if we're editing an existing ad
  const editId = searchParams.get("edit")
  const isEditing = Boolean(editId)

  console.log("🎯 CreateAdPage render:", { currentStep, isEditing, editId, isSubmitting, isLoading })

  // Load existing ad data if editing
  useEffect(() => {
    if (isEditing && editId) {
      console.log("📝 Loading existing ad for editing:", editId)
      setIsLoading(true)
      getAdvertDetails(editId)
        .then((ad) => {
          console.log("✅ Loaded existing ad:", ad)
          setExistingAd(ad)
          // Pre-populate form with existing data
          setAdData({
            type: ad.type,
            amount: ad.amount,
            amount_display: ad.amount_display,
            rate: ad.rate,
            rate_display: ad.rate_display,
            min_order_amount: ad.min_order_amount,
            min_order_amount_display: ad.min_order_amount_display,
            max_order_amount: ad.max_order_amount,
            max_order_amount_display: ad.max_order_amount_display,
            order_expiry_period: ad.order_expiry_period,
            description: ad.description,
            payment_method_names: ad.payment_method_names,
            payment_method_details: ad.payment_method_details,
          })
        })
        .catch((error) => {
          console.error("❌ Error loading ad for editing:", error)
          // Redirect back to ads list if we can't load the ad
          router.push("/ads")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isEditing, editId, router])

  const handleStepComplete = (stepData: any) => {
    console.log("✅ Step completed:", { step: currentStep, data: stepData })
    setAdData((prev) => ({ ...prev, ...stepData }))

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    console.log("⬅️ Going back from step:", currentStep)
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/ads")
    }
  }

  const handleSubmit = async (finalData: CreateAdvertRequest | UpdateAdvertRequest) => {
    console.log("🚀 Submitting ad:", { isEditing, finalData })
    setIsSubmitting(true)

    try {
      let result
      if (isEditing && editId) {
        console.log("📝 Updating existing ad...")
        result = await updateAdvert(editId, finalData as UpdateAdvertRequest)
        console.log("✅ Ad updated successfully:", result)
      } else {
        console.log("➕ Creating new ad...")
        result = await createAdvert(finalData as CreateAdvertRequest)
        console.log("✅ Ad created successfully:", result)
      }

      // Navigate with success parameters
      const successType = isEditing ? "update" : "create"
      const adType = finalData.type || "unknown"
      const adId = result.id || editId || "unknown"

      const successUrl = `/ads?success=${successType}&type=${adType}&id=${adId}`
      console.log("🎉 Navigating to success:", successUrl)

      window.location.href = successUrl
    } catch (error) {
      console.error("❌ Error submitting ad:", error)
      // Handle error - could show error modal here
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading ad details...</p>
        </div>
      </div>
    )
  }

  return (
    <PaymentSelectionProvider>
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit ad" : "Create new ad"}</h1>
        </div>

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} totalSteps={2} />

        {/* Form Content */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{currentStep === 1 ? "Ad details" : "Payment details"}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 ? (
              <AdDetailsForm initialData={adData} onComplete={handleStepComplete} isEditing={isEditing} />
            ) : (
              <PaymentDetailsForm
                initialData={adData}
                onComplete={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
                isEditing={isEditing}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PaymentSelectionProvider>
  )
}
