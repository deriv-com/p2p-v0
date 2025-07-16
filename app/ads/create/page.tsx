"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AdDetailsForm from "../components/ad-details-form"
import PaymentDetailsForm from "../components/payment-details-form"
import ProgressSteps from "../components/progress-steps"
import { PaymentSelectionProvider } from "../components/payment-selection-context"
import { createAdvert, getAdvertDetails, updateAdvert } from "../api/api-ads"
import type { CreateAdvertRequest } from "../types"

function CreateAdContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [adData, setAdData] = useState<Partial<CreateAdvertRequest>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const editId = searchParams.get("edit")
    if (editId) {
      setIsEditing(true)
      setEditingAdId(editId)
      loadAdForEditing(editId)
    }
  }, [searchParams])

  const loadAdForEditing = async (adId: string) => {
    try {
      setIsLoading(true)
      const adDetails = await getAdvertDetails(adId)

      // Transform the ad details to match CreateAdvertRequest format
      const transformedData: Partial<CreateAdvertRequest> = {
        type: adDetails.type,
        amount: adDetails.amount,
        min_order_amount: adDetails.min_order_amount,
        max_order_amount: adDetails.max_order_amount,
        rate_type: adDetails.rate_type,
        rate: adDetails.rate,
        payment_method_ids: adDetails.payment_method_ids,
        payment_method_details: adDetails.payment_method_details,
        description: adDetails.description,
        instructions: adDetails.instructions,
        local_currency: adDetails.local_currency,
        account_currency: adDetails.account_currency,
      }

      setAdData(transformedData)
    } catch (error) {
      console.error("Error loading ad for editing:", error)
      router.push("/ads?error=load_failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepComplete = (stepData: Partial<CreateAdvertRequest>) => {
    setAdData((prev) => ({ ...prev, ...stepData }))
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (finalData: CreateAdvertRequest) => {
    try {
      setIsSubmitting(true)

      if (isEditing && editingAdId) {
        await updateAdvert(editingAdId, finalData)
        router.push(`/ads?success=update&type=${finalData.type}&id=${editingAdId}`)
      } else {
        const response = await createAdvert(finalData)
        router.push(`/ads?success=create&type=${finalData.type}&id=${response.id}`)
      }
    } catch (error) {
      console.error("Error submitting ad:", error)
      router.push("/ads?error=submit_failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading ad details...</p>
        </div>
      </div>
    )
  }

  return (
    <PaymentSelectionProvider>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{isEditing ? "Edit your ad" : "Create new ad"}</h1>
          <p className="text-gray-600">
            {isEditing ? "Update your ad details and payment methods" : "Set up your ad details and payment methods"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Step {currentStep} of 2: {currentStep === 1 ? "Ad details" : "Payment details"}
              </span>
              <ProgressSteps currentStep={currentStep} totalSteps={2} />
            </CardTitle>
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

export default function CreateAdPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <CreateAdContent />
    </Suspense>
  )
}
